"""
Chat Agent for Multi-Turn Conversations
Provides a ChatGPT-like experience for export compliance guidance.
"""
from datetime import datetime
import json
import uuid

# In-memory conversation storage (per session)
conversations = {}

# In-memory audit log
audit_log = []

def get_or_create_conversation(session_id):
    """Get existing conversation or create new one."""
    if session_id not in conversations:
        conversations[session_id] = {
            'id': session_id,
            'created_at': datetime.now().isoformat(),
            'messages': [],
            'context': {}  # Store form data context
        }
    return conversations[session_id]

def add_message(session_id, role, content):
    """Add a message to the conversation."""
    conv = get_or_create_conversation(session_id)
    conv['messages'].append({
        'role': role,
        'content': content,
        'timestamp': datetime.now().isoformat()
    })
    return conv

def get_conversation_history(session_id, max_messages=10):
    """Get recent conversation history for context."""
    conv = get_or_create_conversation(session_id)
    return conv['messages'][-max_messages:]

def update_context(session_id, context_data):
    """Update the conversation context with form data."""
    conv = get_or_create_conversation(session_id)
    conv['context'].update(context_data)
    return conv['context']

def build_chat_prompt(session_id, user_message, compliance_results=None):
    """Build a prompt for the AI with conversation history."""
    conv = get_or_create_conversation(session_id)
    history = get_conversation_history(session_id)
    context = conv.get('context', {})
    
    # Build conversation history string
    history_str = ""
    for msg in history[-5:]:  # Last 5 messages for context
        role = "User" if msg['role'] == 'user' else "Assistant"
        history_str += f"{role}: {msg['content']}\n"
    
    prompt = f"""You are an expert Export Compliance Assistant. You help users navigate US export control regulations (EAR, ITAR).

CONVERSATION CONTEXT:
{json.dumps(context, indent=2) if context else "No form data yet."}

CONVERSATION HISTORY:
{history_str if history_str else "This is the start of the conversation."}

COMPLIANCE RESULTS (if available):
{json.dumps(compliance_results, indent=2) if compliance_results else "No evaluation performed yet."}

USER'S CURRENT MESSAGE:
{user_message}

INSTRUCTIONS:
1. Be conversational and helpful.
2. If user hasn't provided ECCN yet, ask for it.
3. If you need clarification, ask ONE specific question.
4. If results are available, explain them clearly.
5. Proactively suggest next steps.
6. Keep responses concise (2-3 sentences max unless explaining complex topics).

YOUR RESPONSE:"""
    
    return prompt

def log_audit_event(event_type, data, result=None, ai_suggestion=None):
    """Log an event to the audit log."""
    event = {
        'id': str(uuid.uuid4()),
        'timestamp': datetime.now().isoformat(),
        'event_type': event_type,
        'input_data': data,
        'result': result,
        'ai_suggestion': ai_suggestion
    }
    audit_log.append(event)
    return event

def get_audit_log(limit=50):
    """Get recent audit log entries."""
    return audit_log[-limit:]

def clear_audit_log():
    """Clear the audit log."""
    global audit_log
    audit_log = []
