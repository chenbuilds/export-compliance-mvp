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

def generate_report_data(evaluation_data, results, trace, ai_suggestion):
    """Generate structured data for a compliance report."""
    report = {
        'generated_at': datetime.now().isoformat(),
        'report_id': f"ECR-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        'input': {
            'eccn': evaluation_data.get('eccn', 'N/A'),
            'destination': evaluation_data.get('destination', 'N/A'),
            'value': evaluation_data.get('value', 'N/A'),
            'end_user_type': evaluation_data.get('endUserType', 'N/A'),
            'end_user_type': evaluation_data.get('endUserType', 'N/A'),
            'end_user_name': evaluation_data.get('endUserName', 'N/A'),
            'supplier': evaluation_data.get('supplier', 'N/A'),
            'description': evaluation_data.get('description', 'N/A')
        },
        'screening_results': {
            'dps': evaluation_data.get('dps_result'),
            'uflpa': evaluation_data.get('uflpa_result')
        },
        'decision_trace': trace,
        'results': results,
        'ai_recommendation': ai_suggestion,
        'disclaimer': "This report is for informational purposes only and does not constitute legal advice. Always consult with a licensed export compliance professional before making export decisions."
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
    lines.append("INPUT PARAMETERS")
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
    lines.append("DECISION TRACE")
    lines.append("-" * 40)
    for i, step in enumerate(report_data['decision_trace'], 1):
        lines.append(f"{i}. {step}")
    lines.append("")
    
    lines.append("-" * 40)
    lines.append("COMPLIANCE RESULTS")
    lines.append("-" * 40)
    for result in report_data['results']:
        lines.append(f"\n[{result['code']}] {result['title']}")
        lines.append(f"Type: {result['type']}")
        lines.append(f"Justification: {result['justification']}")
        lines.append(f"Next Steps: {result['nextSteps']}")
        if result.get('caveats'):
            lines.append("Caveats:")
            for caveat in result['caveats']:
                lines.append(f"  - {caveat}")
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
    lines.append("")
    lines.append("=" * 60)
    
    return "\n".join(lines)

def format_report_as_json(report_data):
    """Format the report as JSON."""
    return json.dumps(report_data, indent=2)

def generate_pdf_report(report_data):
    """Generate a professional PDF report with decision trace using reportlab."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.75*inch)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=20, textColor=colors.HexColor('#1e40af'), spaceAfter=6)
    subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#64748b'), spaceAfter=16)
    heading_style = ParagraphStyle('Heading', parent=styles['Heading2'], fontSize=13, textColor=colors.HexColor('#1e40af'), spaceBefore=16, spaceAfter=8, fontName='Helvetica-Bold')
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, leading=14)
    trace_style = ParagraphStyle('Trace', parent=styles['Normal'], fontSize=9, leading=12, textColor=colors.HexColor('#475569'), leftIndent=12)
    small_style = ParagraphStyle('Small', parent=styles['Normal'], fontSize=8, textColor=colors.grey)
    link_style = ParagraphStyle('Link', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#2563eb'))
    
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
        ['End User Type', inp['end_user_type']],
        ['End User Name', inp.get('end_user_name', 'N/A')],
        ['Supplier', inp.get('supplier', 'N/A')],
        ['Description', inp.get('description', 'N/A')[:50] + '...' if len(inp.get('description', '')) > 50 else inp.get('description', 'N/A')]
    ]
    table = Table(data, colWidths=[1.8*inch, 4.5*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#f1f5f9')),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 0.15*inch))
    
    # Section 2: Decision Logic Trace
    elements.append(Paragraph("2. Decision Logic Trace", heading_style))
    elements.append(Paragraph("The following steps show how the compliance engine evaluated your export:", small_style))
    elements.append(Spacer(1, 0.1*inch))
    for i, step in enumerate(report_data.get('decision_trace', []), 1):
        # Escape HTML special chars
        safe_step = step.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        elements.append(Paragraph(f"<b>Step {i}:</b> {safe_step}", trace_style))
    elements.append(Paragraph(f"<b>Step {i}:</b> {safe_step}", trace_style))
    elements.append(Spacer(1, 0.15*inch))
    
    # Section 2.5: Screening Results (New)
    if report_data.get('screening_results'):
        screening = report_data['screening_results']
        if screening.get('dps') or screening.get('uflpa'):
            elements.append(Paragraph("2.5 Screening Checks (DPS & UFLPA)", heading_style))
            
            # DPS
            dps = screening.get('dps')
            if dps:
                dps_color = colors.red if dps.get('status') == 'BLOCKED' else (colors.orange if dps.get('status') == 'POTENTIAL_MATCH' else colors.green)
                dps_text = f"<b>Denied Party Screening:</b> <font color='{dps_color.hexval()[2:]}'>{dps.get('status', 'N/A')}</font>"
                elements.append(Paragraph(dps_text, body_style))
                if dps.get('match_name'):
                     elements.append(Paragraph(f"Match: {dps.get('match_name')} ({dps.get('list', '')})", trace_style))

            # UFLPA
            uflpa = screening.get('uflpa')
            if uflpa:
                uflpa_color = colors.red if uflpa.get('risk_level') == 'HIGH' else (colors.orange if uflpa.get('risk_level') == 'MEDIUM' else colors.green)
                uflpa_text = f"<b>Forced Labor Screening:</b> <font color='{uflpa_color.hexval()[2:]}'>{uflpa.get('risk_level', 'N/A')}</font>"
                elements.append(Paragraph(uflpa_text, body_style))
                 
            elements.append(Spacer(1, 0.15*inch))
    
    # Section 3: Compliance Results
    elements.append(Paragraph("3. Compliance Results", heading_style))
    for result in report_data['results']:
        result_type = result.get('type', 'INFO')
        color = '#10b981' if result_type == 'EXCEPTION' else '#ef4444' if result_type == 'LICENSE_REQUIRED' else '#3b82f6'
        result_text = f"<font color='{color}'><b>[{result['code']}]</b></font> <b>{result['title']}</b><br/>{result['justification']}<br/><i>Next Steps: {result['nextSteps']}</i>"
        elements.append(Paragraph(result_text, body_style))
        if result.get('caveats'):
            for caveat in result['caveats']:
                elements.append(Paragraph(f"• {caveat}", trace_style))
        elements.append(Spacer(1, 0.1*inch))
    
    # Section 4: AI Recommendation
    elements.append(Paragraph("4. AI Recommendation", heading_style))
    elements.append(Paragraph(report_data['ai_recommendation'] or "No AI recommendation available.", body_style))
    elements.append(Spacer(1, 0.15*inch))
    
    # Section 5: Regulatory Citations
    elements.append(Paragraph("5. Regulatory Citations", heading_style))
    citations = [
        "• Export Administration Regulations (EAR): 15 CFR Parts 730-774",
        "• License Exceptions: 15 CFR Part 740",
        "• Commerce Control List: Supplement No. 1 to Part 774",
        "• Country Chart: Supplement No. 1 to Part 738",
        "• Official Source: <link href='https://www.bis.doc.gov'>www.bis.doc.gov</link>"
    ]
    for citation in citations:
        elements.append(Paragraph(citation, small_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Footer: Disclaimer
    elements.append(Paragraph("Disclaimer", heading_style))
    elements.append(Paragraph(report_data['disclaimer'], small_style))
    elements.append(Spacer(1, 0.1*inch))
    elements.append(Paragraph("This report was generated by ExportShield AI. For official determinations, consult BIS or a licensed export compliance professional.", small_style))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
