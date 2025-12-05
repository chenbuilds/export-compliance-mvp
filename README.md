# Export Compliance Assistant MVP

🛡️ **AI-Powered Export Compliance Screening Tool** for EAR and ITAR regulations.

## Features

- **42+ ECCN Classifications** - Comprehensive coverage across all export control categories
- **14 License Exception Types** - LVS, STA, ENC, GOV, TMP, RPL, and more
- **Real-time AI Suggestions** - Powered by Google Gemini
- **Regulatory Citations** - Direct links to eCFR.gov sections
- **PDF Reports** - Professional compliance reports with decision trace
- **Email Integration** - Send reports via Gmail or SendGrid
- **Modern UI** - Accordion-style exception display with filtering

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Python Flask
- **AI**: Google Gemini API
- **Styling**: Custom CSS with modern design

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Google Gemini API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/export-compliance-mvp.git
cd export-compliance-mvp

# Install frontend dependencies
npm install

# Set up backend
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your API keys
```

### Running Locally

```bash
# Terminal 1: Start backend
cd backend && source venv/bin/activate && python3 app.py

# Terminal 2: Start frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_API_KEY` | Google Gemini API Key |
| `EMAIL_PROVIDER` | `gmail` or `sendgrid` |
| `GMAIL_USER` | Gmail address |
| `GMAIL_APP_PASSWORD` | Gmail App Password |
| `FROM_EMAIL` | Sender email address |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/evaluate` | POST | Evaluate export compliance |
| `/chat` | POST | AI chat assistant |
| `/report` | POST | Generate PDF/JSON report |
| `/send-email` | POST | Email compliance report |
| `/email-status` | GET | Check email configuration |
| `/audit` | GET | View audit log |

## License

MIT License - See LICENSE file for details.

## Disclaimer

This tool is for informational purposes only and does not constitute legal advice. Always consult qualified export compliance professionals for official determinations.
