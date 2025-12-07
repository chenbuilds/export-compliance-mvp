
"""
Chat Agent extension logic
"""
# Helper to enhance context for chat
def update_context_with_screening(session_id, context_data):
    # This is handled by the existing update_context since it accepts a dictionary
    # But we might want to ensure 'supplier' and 'endUserName' are prioritized
    from chat_agent import get_or_create_conversation
    
    conv = get_or_create_conversation(session_id)
    # Ensure nested inputs are flattened or structured nicely for the prompt
    # Current implementation flattens most things, so just passing the new keys works.
    conv['context'].update(context_data)
    return conv['context']
