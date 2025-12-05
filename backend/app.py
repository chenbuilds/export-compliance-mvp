
"""
Flask Backend for Export Compliance Assistant
"""
import os
import json
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
from compliance_logic import evaluate_export
from chat_agent import (
    get_or_create_conversation, add_message, update_context,
    build_chat_prompt, log_audit_event, get_audit_log
)
from export_utils import generate_report_data, format_report_as_text, format_report_as_json

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS to allow requests from the React frontend (likely on port 3555 or 5173)
CORS(app)

# Configure Gemini
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel('gemini-2.0-flash')  # Faster than gemini-3-pro-preview
else:
    model = None
    print("WARNING: No GOOGLE_API_KEY found. AI features disabled.")

@app.route('/evaluate', methods=['POST'])
def evaluate():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # 1. Run Rule-Based Logic
    logic_results, trace = evaluate_export(data)

    # 2. Run AI Agent (Gemini)
    ai_suggestion = None
    if model:
        try:
            prompt = f"""
            Act as an export compliance expert. 
            User Export Scenario:
            - ECCN: {data.get('eccn')}
            - Destination: {data.get('destination')}
            - End User: {data.get('endUserType')}
            - Value: {data.get('value')}
            
            System Rule Engine Findings: {json.dumps(logic_results)}
            
            Task: Provide a single, concise 'Agentic Insight' (max 2 sentences). 
            If the system found an exception (like LVS or GOV), advise on a practical verification step.
            If a license is required, suggest the next administrative step.
            """
            
            response = model.generate_content(prompt)
            ai_suggestion = response.text.strip()
        except Exception as e:
            print(f"Gemini Error: {e}")
            ai_suggestion = "AI service temporarily unavailable."

    # 3. Log to Audit
    log_audit_event('evaluation', data, logic_results, ai_suggestion)

    return jsonify({
        "results": logic_results,
        "trace": trace,
        "ai_suggestion": ai_suggestion
    })

@app.route('/chat', methods=['POST'])
def chat():
    """Multi-turn chat endpoint for agentic experience."""
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    session_id = data.get('session_id') or str(uuid.uuid4())
    user_message = data.get('message', '')
    form_context = data.get('context', {})
    
    # Update context if form data provided
    if form_context:
        update_context(session_id, form_context)
    
    # Add user message to history
    add_message(session_id, 'user', user_message)
    
    # Get compliance results if context has ECCN
    compliance_results = None
    if form_context.get('eccn'):
        compliance_results, _ = evaluate_export(form_context)
    
    # Generate AI response
    ai_response = "I'm here to help with export compliance. What would you like to know?"
    if model:
        try:
            prompt = build_chat_prompt(session_id, user_message, compliance_results)
            response = model.generate_content(prompt)
            ai_response = response.text.strip()
        except Exception as e:
            print(f"Gemini Chat Error: {e}")
            ai_response = "I'm having trouble connecting right now. Please try again."
    
    # Add AI response to history
    add_message(session_id, 'assistant', ai_response)
    
    # Log to audit
    log_audit_event('chat', {'message': user_message, 'context': form_context}, ai_response)
    
    return jsonify({
        "session_id": session_id,
        "response": ai_response
    })

@app.route('/report', methods=['POST'])
def generate_report():
    """Generate a downloadable compliance report (JSON, Text, or PDF)."""
    from export_utils import generate_pdf_report
    
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Run evaluation
    results, trace = evaluate_export(data)
    
    # Get AI suggestion
    ai_suggestion = "No AI recommendation available."
    if model:
        try:
            prompt = f"Summarize the compliance findings for ECCN {data.get('eccn')} to {data.get('destination')} in 2 sentences: {json.dumps(results)}"
            response = model.generate_content(prompt)
            ai_suggestion = response.text.strip()
        except Exception as e:
            print(f"Gemini Report Error: {e}")
    
    # Generate report
    report_data = generate_report_data(data, results, trace, ai_suggestion)
    report_format = data.get('format', 'json')
    
    if report_format == 'pdf':
        pdf_bytes = generate_pdf_report(report_data)
        return pdf_bytes, 200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': f'attachment; filename=compliance-report-{report_data["report_id"]}.pdf'
        }
    elif report_format == 'text':
        return format_report_as_text(report_data), 200, {'Content-Type': 'text/plain'}
    else:
        return jsonify(report_data)

@app.route('/audit', methods=['GET'])
def get_audit():
    """Get the audit log."""
    limit = request.args.get('limit', 50, type=int)
    return jsonify({"audit_log": get_audit_log(limit)})

@app.route('/email-status', methods=['GET'])
def email_status():
    """Check email service configuration status."""
    from email_service import email_service
    return jsonify(email_service.get_status())

@app.route('/send-email', methods=['POST'])
def send_email():
    """Send compliance report via email."""
    from email_service import email_service, generate_compliance_email_html
    from export_utils import generate_report_data, generate_pdf_report
    
    data = request.json
    to_email = data.get('email')
    
    if not to_email:
        return jsonify({'success': False, 'error': 'Email address required'}), 400
    
    # Get compliance data
    eccn = data.get('eccn', '')
    destination = data.get('destination', '')
    value = data.get('value', 0)
    end_user_type = data.get('endUserType', 'Commercial')
    
    # Evaluate compliance
    results, trace = evaluate_export(data)
    
    # Get AI suggestion
    ai_suggestion = ""
    if GOOGLE_API_KEY and model:
        try:
            prompt = f"Summarize compliance for ECCN {eccn} to {destination} in 2 sentences."
            response = model.generate_content(prompt)
            ai_suggestion = response.text.strip()
        except Exception as e:
            print(f"Gemini Email Error: {e}")
    
    # Generate report data
    report_data = generate_report_data(data, results, trace, ai_suggestion)
    
    # Generate email HTML
    html_content = generate_compliance_email_html(report_data)
    
    # Generate PDF attachment
    attachments = []
    if data.get('includePdf', True):
        try:
            pdf_bytes = generate_pdf_report(report_data)
            attachments.append({
                'filename': f'compliance-report-{report_data["report_id"]}.pdf',
                'content': pdf_bytes,
                'type': 'application/pdf'
            })
        except Exception as e:
            print(f"PDF generation error: {e}")
    
    # Send email
    result = email_service.send_email(
        to_email=to_email,
        subject=f'Export Compliance Report - {eccn} to {destination}',
        html_content=html_content,
        attachments=attachments if attachments else None
    )
    
    # Log the email send attempt
    log_audit_event('email_send', {
        'to': to_email,
        'eccn': eccn,
        'destination': destination,
        'success': result.get('success', False)
    })
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5001, debug=True)

