"""
Export Utilities for PDF Report Generation
"""
from datetime import datetime
import json
import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch

def generate_report_data(evaluation_data, license_results, uflpa_results, dps_results, ai_suggestion):
    """Generate structured data for a compliance report."""
    
    # Extract trace and simplified results from license engine output
    trace = license_results.get('trace', [])
    lic_res = license_results.get('results', [])
    
    report = {
        'generated_at': datetime.now().isoformat(),
        'report_id': f"ECR-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        'input': {
            'eccn': evaluation_data.get('eccn', 'N/A'),
            'destination': evaluation_data.get('destination', 'N/A'),
            'value': evaluation_data.get('value', 'N/A'),
            'end_user_type': evaluation_data.get('endUserType', 'N/A'),
            'end_user_name': evaluation_data.get('endUserName', 'N/A'),
            'supplier': evaluation_data.get('supplier', 'N/A'),
            'description': evaluation_data.get('description', 'N/A')
        },
        'license_analysis': {
            'status': license_results.get('status', 'UNKNOWN'),
            'results': lic_res,
            'trace': trace
        },
        'forced_labour_analysis': uflpa_results,
        'dps_analysis': dps_results,
        'ai_recommendation': ai_suggestion,
        'disclaimer': "This report is for informational purposes only and does not constitute legal advice."
    }
    return report

def format_report_as_text(report_data):
    """Format the report as plain text for display or simple export."""
    lines = []
    lines.append("=" * 60)
    lines.append("EXPORT COMPLIANCE EVALUATION REPORT")
    lines.append("=" * 60)
    lines.append(f"Report ID: {report_data['report_id']}")
    lines.append(f"Generated: {report_data['generated_at']}")
    lines.append("")
    
    lines.append("-" * 40)
    lines.append("1. INPUT PARAMETERS")
    lines.append("-" * 40)
    inp = report_data['input']
    lines.append(f"ECCN: {inp['eccn']}")
    lines.append(f"Destination: {inp['destination']}")
    lines.append(f"Value: ${inp['value']}")
    lines.append(f"End User Type: {inp['end_user_type']}")
    lines.append(f"End User Name: {inp.get('end_user_name', 'N/A')}")
    lines.append(f"Supplier: {inp.get('supplier', 'N/A')}")
    lines.append("")
    
    lines.append("-" * 40)
    lines.append("2. LICENSE RESULTS")
    lines.append("-" * 40)
    lic = report_data['license_analysis']
    lines.append(f"Status: {lic['status']}")
    for res in lic.get('results', []):
        lines.append(f"[{res['code']}] {res['title']}: {res['justification']}")
    lines.append("")
    
    lines.append("-" * 40)
    lines.append("3. FORCED LABOUR / UFLPA")
    lines.append("-" * 40)
    uflpa = report_data.get('forced_labour_analysis', {})
    lines.append(f"Risk Level: {uflpa.get('risk_level', 'N/A')}")
    if uflpa.get('reasons'):
        for r in uflpa['reasons']:
            lines.append(f" - {r}")
    lines.append(f"Action: {uflpa.get('action', 'N/A')}")
    lines.append("")

    lines.append("-" * 40)
    lines.append("AI RECOMMENDATION")
    lines.append("-" * 40)
    lines.append(report_data['ai_recommendation'] or "No AI recommendation available.")
    lines.append("")
    
    lines.append("-" * 40)
    lines.append("DISCLAIMER")
    lines.append("-" * 40)
    lines.append(report_data['disclaimer'])
    
    return "\n".join(lines)

def format_report_as_json(report_data):
    """Format the report as JSON."""
    return json.dumps(report_data, indent=2)

def generate_pdf_report(report_data):
    """Generate a professional PDF report with newly separated sections."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.75*inch)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=20, textColor=colors.HexColor('#1e40af'), spaceAfter=6)
    subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#64748b'), spaceAfter=16)
    heading_style = ParagraphStyle('Heading', parent=styles['Heading2'], fontSize=13, textColor=colors.HexColor('#1e40af'), spaceBefore=16, spaceAfter=8, fontName='Helvetica-Bold')
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, leading=14)
    trace_style = ParagraphStyle('Trace', parent=styles['Normal'], fontSize=9, leading=12, textColor=colors.HexColor('#475569'), leftIndent=12)
    small_style = ParagraphStyle('Small', parent=styles['Normal'], fontSize=8, textColor=colors.grey)
    
    elements = []
    
    # Title & Header
    elements.append(Paragraph("EXPORT COMPLIANCE EVALUATION REPORT", title_style))
    elements.append(Paragraph(f"Report ID: {report_data['report_id']} | Generated: {report_data['generated_at'][:19].replace('T', ' ')}", subtitle_style))
    
    # Section 1: Input Parameters
    elements.append(Paragraph("1. Input Parameters", heading_style))
    inp = report_data['input']
    data = [
        ['Parameter', 'Value'],
        ['ECCN', inp['eccn']],
        ['Destination Country', inp['destination']],
        ['Declared Value', f"${inp['value']}"],
        ['End User Type', inp['end_user_type']],
        ['End User Name', inp.get('end_user_name', 'N/A')],
        ['Supplier', inp.get('supplier', 'N/A')],
        ['Description', inp.get('description', 'N/A')[:50] + '...']
    ]
    table = Table(data, colWidths=[1.8*inch, 4.5*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#f1f5f9')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 0.15*inch))
    
    # Section 2: License Requirement & Exceptions
    elements.append(Paragraph("2. License Requirement & Exceptions", heading_style))
    lic = report_data['license_analysis']
    
    # Status
    status_text = f"<b>License Status:</b> {lic.get('status', 'UNKNOWN')}"
    elements.append(Paragraph(status_text, body_style))
    elements.append(Spacer(1, 0.1*inch))
    
    # Results
    for res in lic.get('results', []):
        color = colors.green if res['type'] == 'EXCEPTION' else (colors.red if res['type'] == 'LICENSE_REQUIRED' else colors.orange)
        res_text = f"<font color='{color.hexval()[2:]}'><b>[{res['code']}] {res['title']}</b></font><br/>{res['justification']}"
        elements.append(Paragraph(res_text, body_style))
        if res.get('nextSteps'):
             elements.append(Paragraph(f"<i>Next Steps: {res['nextSteps']}</i>", body_style))
        elements.append(Spacer(1, 0.05*inch))
    
    # Section 3: Forced Labour / UFLPA Screening
    elements.append(Paragraph("3. Forced Labour / UFLPA Screening", heading_style))
    uflpa = report_data.get('forced_labour_analysis', {})
    if uflpa:
        risk_color = colors.green
        if uflpa.get('risk_level') == 'SEIZURE_LIKELY': risk_color = colors.red
        elif uflpa.get('risk_level') == 'HIGH_RISK': risk_color = colors.orange
        elif uflpa.get('risk_level') == 'WARNING': risk_color = colors.yellow
        
        elements.append(Paragraph(f"Risk Rating: <font color='{risk_color.hexval()[2:]}'><b>{uflpa.get('risk_level', 'N/A')}</b></font>", body_style))
        
        if uflpa.get('reasons'):
            elements.append(Paragraph("<b>Risk Factors:</b>", body_style))
            for r in uflpa['reasons']:
                elements.append(Paragraph(f"• {r}", trace_style))
                
        elements.append(Paragraph(f"<b>Recommended Action:</b> {uflpa.get('action', 'N/A')}", body_style))
    else:
        elements.append(Paragraph("No UFLPA screening performed.", body_style))
    
    # Section 4: AI Insights
    elements.append(Paragraph("4. AI Insights", heading_style))
    if report_data.get('ai_recommendation'):
        elements.append(Paragraph(report_data['ai_recommendation'], body_style))
    else:
        elements.append(Paragraph("No AI insights generated.", body_style))

    # Section 5: Regulatory Citations
    elements.append(Paragraph("5. Regulatory Citations", heading_style))
    citations = [
        "• Export Administration Regulations (EAR): 15 CFR Parts 730-774",
        "• License Exceptions: 15 CFR Part 740",
        "• UFLPA Entity List: DHS/CBP Guidance",
        "• Official Source: <link href='https://www.bis.doc.gov'>www.bis.doc.gov</link>"
    ]
    for c in citations:
        elements.append(Paragraph(c, small_style))
    
    # Disclaimer
    elements.append(Spacer(1, 0.3*inch))
    elements.append(Paragraph(report_data['disclaimer'], small_style))
    elements.append(Paragraph("This report was generated by ExportShield. For official determinations, consult BIS or a licensed professional.", small_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()
