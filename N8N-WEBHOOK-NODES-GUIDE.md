# n8n Webhook Nodes - Complete Setup Guide

## Overview

This guide shows you how to set up n8n nodes to:
1. **Receive messages** from the chat window (Webhook node)
2. **Process the message** (Function/OpenAI nodes)
3. **Send reply back** to chat window (Respond to Webhook node)

---

## 📥 Node 1: Webhook (Receive Message)

### Configuration

**Node Type:** `Webhook`

**Settings:**
- **HTTP Method:** `POST`
- **Path:** `event-assistant`
- **Response Mode:** `Respond to Webhook`
- **Response Code:** `200`

### What It Receives

```json
{
  "message": "Find me some venues",
  "action": null,
  "eventData": {
    "name": "Spring 2024 Hackathon",
    "type": "hackathon",
    "date": "2024-06-15",
    "description": "A 24-hour coding competition",
    "goals": "Recruit developers, Build partnerships"
  },
  "conversationHistory": [
    {
      "id": "1",
      "role": "assistant",
      "content": "How can I help?",
      "timestamp": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Access Data in Next Nodes

- Message: `{{ $json.message }}`
- Action: `{{ $json.action }}`
- Event Name: `{{ $json.eventData.name }}`
- Event Type: `{{ $json.eventData.type }}`
- Event Date: `{{ $json.eventData.date }}`
- Full History: `{{ $json.conversationHistory }}`

---

## 🔄 Node 2: Function (Process Message)

### Configuration

**Node Type:** `Function`

**Function Code:**

```javascript
// Extract incoming data
const message = $json.message || '';
const action = $json.action || null;
const eventData = $json.eventData || {};
const conversationHistory = $json.conversationHistory || [];

// Initialize response
let response = {
  message: '',
  actions: []
};

// ============================================
// HANDLE ACTION BUTTONS
// ============================================
if (action) {
  switch(action) {
    case 'venue_search':
      response = {
        message: `Let's find the perfect venue for your ${eventData.type}! 🏢\n\nWhat city or location are you looking for?`,
        actions: []
      };
      break;
      
    case 'candidate_source':
      response = {
        message: `Let's find candidates for your ${eventData.type}! 👥\n\nWhat skills or technologies are you looking for?\n(e.g., Python, React, Machine Learning)`,
        actions: []
      };
      break;
      
    case 'task_generate':
      response = {
        message: `Generating personalized task checklist for "${eventData.name}"...\n\n**High Priority Tasks:**\n⬜ Finalize venue booking\n⬜ Send candidate invitations\n⬜ Set up registration system\n\n**Medium Priority:**\n⬜ Coordinate with partners\n⬜ Prepare materials\n\nWould you like me to set up reminders for these?`,
        actions: [
          { id: 'reminders', label: '🔔 Set Up Reminders', type: 'custom' },
          { id: 'done', label: '✅ All Set!', type: 'custom' }
        ]
      };
      break;
      
    default:
      response = {
        message: 'I can help you with that! What would you like to know?',
        actions: []
      };
  }
}

// ============================================
// HANDLE TEXT MESSAGES
// ============================================
else if (message) {
  const lowerMessage = message.toLowerCase();
  
  // Venue-related keywords
  if (lowerMessage.includes('venue') || lowerMessage.includes('location') || lowerMessage.includes('place')) {
    response = {
      message: `I can help you find venues! Here are some options:\n\n🏢 **Tech Hub Downtown**\n   • Capacity: 200 people\n   • Price: $2,500/day\n   • Rating: 4.8/5\n   • Amenities: WiFi, Projector, Catering\n\n🏢 **Innovation Center**\n   • Capacity: 150 people\n   • Price: $1,800/day\n   • Rating: 4.6/5\n   • Amenities: WiFi, Breakout rooms\n\n🏢 **Startup Space**\n   • Capacity: 100 people\n   • Price: $1,200/day\n   • Rating: 4.5/5\n   • Amenities: WiFi, Kitchen\n\nWhich one interests you?`,
      actions: [
        { id: 'book1', label: 'Book Tech Hub', type: 'venue_search', data: { venueId: '123' } },
        { id: 'book2', label: 'Book Innovation Center', type: 'venue_search', data: { venueId: '456' } },
        { id: 'book3', label: 'Book Startup Space', type: 'venue_search', data: { venueId: '789' } }
      ]
    };
  }
  
  // Candidate-related keywords
  else if (lowerMessage.includes('candidate') || lowerMessage.includes('recruit') || lowerMessage.includes('hire')) {
    response = {
      message: `I'll help you source candidates! Which platforms should I search?`,
      actions: [
        { id: 'github', label: '🐙 GitHub', type: 'candidate_source', data: { platform: 'github' } },
        { id: 'kaggle', label: '📊 Kaggle', type: 'candidate_source', data: { platform: 'kaggle' } },
        { id: 'both', label: '🔍 Both Platforms', type: 'candidate_source', data: { platform: 'both' } }
      ]
    };
  }
  
  // Task-related keywords
  else if (lowerMessage.includes('task') || lowerMessage.includes('checklist') || lowerMessage.includes('todo')) {
    response = {
      message: `Here's your task checklist for "${eventData.name}":\n\n✅ Event created\n⬜ Book venue\n⬜ Source candidates\n⬜ Send invitations\n⬜ Set up registration\n⬜ Prepare materials\n\nWhat would you like to tackle first?`,
      actions: [
        { id: 'venue', label: '🏢 Find Venues', type: 'venue_search' },
        { id: 'candidates', label: '👥 Source Candidates', type: 'candidate_source' }
      ]
    };
  }
  
  // Help/general keywords
  else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    response = {
      message: `I'm your Event Planning Assistant! I can help you with:\n\n🏢 **Venue Search** - Find and book venues\n👥 **Candidate Sourcing** - Find talent on GitHub/Kaggle\n✅ **Task Generation** - Create personalized checklists\n📧 **Reminders** - Set up automated follow-ups\n🎓 **University Matching** - Connect with relevant schools\n\nWhat would you like to do?`,
      actions: [
        { id: 'venue', label: '🏢 Find Venues', type: 'venue_search' },
        { id: 'candidates', label: '👥 Source Candidates', type: 'candidate_source' },
        { id: 'tasks', label: '✅ Generate Tasks', type: 'task_generate' }
      ]
    };
  }
  
  // Default response for unrecognized messages
  else {
    response = {
      message: `I understand you're asking about: "${message}"\n\nI can help you with:\n• Finding venues\n• Sourcing candidates\n• Generating tasks\n• Setting up reminders\n\nWhat would you like to do?`,
      actions: [
        { id: 'venue', label: '🏢 Find Venues', type: 'venue_search' },
        { id: 'candidates', label: '👥 Source Candidates', type: 'candidate_source' },
        { id: 'tasks', label: '✅ Generate Tasks', type: 'task_generate' }
      ]
    };
  }
}

// ============================================
// FIRST INTERACTION (No message or action)
// ============================================
else {
  response = {
    message: `🎉 Great! I've received the details for "${eventData.name}".\n\nI'm your AI Event Planning Assistant. I can help you with:\n\n🏢 Finding and booking venues\n👥 Sourcing candidates from GitHub/Kaggle\n✅ Generating task checklists\n📧 Setting up automated reminders\n🎓 Matching with universities\n\nWhat would you like to tackle first?`,
    actions: [
      { id: 'venue', label: '🏢 Find Venues', type: 'venue_search' },
      { id: 'candidates', label: '👥 Source Candidates', type: 'candidate_source' },
      { id: 'tasks', label: '✅ Generate Tasks', type: 'task_generate' }
    ]
  };
}

// Return response
return { json: response };
```

### What It Outputs

```json
{
  "message": "Response text to show user",
  "actions": [
    {
      "id": "unique_id",
      "label": "Button Text",
      "type": "action_type",
      "data": { "optional": "data" }
    }
  ]
}
```

---

## 📤 Node 3: Respond to Webhook (Send Reply)

### Configuration

**Node Type:** `Respond to Webhook`

**Settings:**
- **Respond With:** `JSON`
- **Response Body:** `={{ $json }}`

### What It Sends Back

The chat window receives:

```json
{
  "message": "I can help you find venues! Here are some options:\n\n🏢 Tech Hub Downtown...",
  "actions": [
    { "id": "book1", "label": "Book Tech Hub", "type": "venue_search" }
  ]
}
```

---

## 🔗 Complete Workflow Structure

```
┌─────────────┐
│   Webhook   │ ← Receives message from chat
│  (Receive)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Function   │ ← Process message & generate response
│  (Process)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Respond to │ ← Send reply back to chat
│   Webhook   │
└─────────────┘
```

---

## 🚀 Advanced: Add OpenAI Node

For intelligent responses, insert OpenAI between Function and Respond:

```
Webhook → Function (Extract) → OpenAI → Function (Format) → Respond
```

### Node 2a: Extract Context (Function)

```javascript
// Prepare context for OpenAI
const systemPrompt = `You are an Event Planning Assistant for Idea Hub.
Event: ${$json.eventData.name}
Type: ${$json.eventData.type}
Date: ${$json.eventData.date}

Help the user with venue booking, candidate sourcing, and task generation.
Always provide action buttons in your response.`;

return {
  json: {
    systemPrompt: systemPrompt,
    userMessage: $json.message,
    eventData: $json.eventData
  }
};
```

### Node 2b: OpenAI

**Settings:**
- **Model:** `gpt-4` or `gpt-3.5-turbo`
- **System Message:** `={{ $json.systemPrompt }}`
- **User Message:** `={{ $json.userMessage }}`
- **Temperature:** `0.7`

### Node 2c: Format OpenAI Response (Function)

```javascript
// Extract OpenAI response
const aiMessage = $json.choices[0].message.content;

// Parse for action buttons (if AI includes them)
let actions = [];

// Add default actions based on context
if (aiMessage.toLowerCase().includes('venue')) {
  actions.push({ id: 'venue', label: '🏢 Find Venues', type: 'venue_search' });
}
if (aiMessage.toLowerCase().includes('candidate')) {
  actions.push({ id: 'candidates', label: '👥 Source Candidates', type: 'candidate_source' });
}

return {
  json: {
    message: aiMessage,
    actions: actions
  }
};
```

---

## 🔧 Testing Your Webhook

### 1. Test in n8n

Click "Execute Workflow" and use test data:

```json
{
  "message": "Find me some venues",
  "eventData": {
    "name": "Test Event",
    "type": "hackathon",
    "date": "2024-06-15"
  }
}
```

### 2. Test from Frontend

```bash
cd packages/frontend
npm run dev

# Create event → Chat opens → Type message
```

### 3. Check n8n Execution Logs

- Go to n8n workflow
- Click "Executions" tab
- See all incoming requests and responses

---

## 📊 Data Flow Diagram

```
FRONTEND                    n8n WORKFLOW
┌─────────┐                ┌──────────┐
│  User   │                │ Webhook  │
│  Types  │───message──────▶│ Receives │
│ Message │                └────┬─────┘
└─────────┘                     │
                                ▼
                           ┌──────────┐
                           │ Function │
                           │ Process  │
                           └────┬─────┘
                                │
                                ▼
                           ┌──────────┐
                           │ Respond  │
                           │ Webhook  │
                           └────┬─────┘
                                │
┌─────────┐                     │
│  Chat   │◀────response────────┘
│ Window  │
│ Updates │
└─────────┘
```

---

## 🎯 Quick Copy-Paste Workflow

### Minimal 3-Node Setup

1. **Webhook Node**
   - Path: `event-assistant`
   - Method: POST
   - Response Mode: Respond to Webhook

2. **Function Node**
   - Copy the function code above

3. **Respond to Webhook Node**
   - Respond With: JSON
   - Body: `={{ $json }}`

### Connect Them

Webhook → Function → Respond to Webhook

---

## 🐛 Troubleshooting

**Chat shows "n8n integration pending"**
- Check webhook URL in `.env.local`
- Verify n8n workflow is activated
- Check n8n is running on port 5678

**No response in chat**
- Check n8n execution logs
- Verify "Respond to Webhook" node is connected
- Check browser console for errors

**CORS errors**
```bash
export N8N_CORS_ORIGIN=http://localhost:3000
n8n start
```

**Webhook not found**
- Verify path is `event-assistant`
- Check workflow is saved and activated
- Restart n8n if needed

---

## 📚 Next Steps

1. ✅ Set up basic 3-node workflow
2. ⬜ Test with chat window
3. ⬜ Add OpenAI for intelligent responses
4. ⬜ Connect to real APIs (venues, GitHub)
5. ⬜ Add database storage
6. ⬜ Implement action handlers

Ready to build your workflow! 🚀
