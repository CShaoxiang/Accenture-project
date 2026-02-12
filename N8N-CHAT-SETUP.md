# n8n Chat Assistant Setup Guide

## Overview

The Event Planning Chat Assistant connects your frontend to n8n workflows, allowing AI-powered automation for:
- Venue search and booking
- Candidate sourcing
- Task generation
- Reminder setup
- University matching

## Features

✅ **Chat Interface** - Beautiful modal chat window after event creation
✅ **Action Buttons** - Quick actions for common tasks
✅ **n8n Integration** - Webhook-based communication
✅ **Conversation History** - Full context sent to n8n
✅ **Fallback Mode** - Works without n8n (shows placeholder responses)

## Setup Steps

### 1. Install n8n (if not installed)

```bash
# Using npm
npm install -g n8n

# Or using Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 2. Start n8n

```bash
n8n start
```

Access n8n at: http://localhost:5678

### 3. Create Webhook Workflow

1. Go to http://localhost:5678
2. Create new workflow
3. Add "Webhook" node:
   - Method: POST
   - Path: `event-assistant`
   - Response Mode: "Respond to Webhook"

4. Add your logic nodes (examples below)

5. Add "Respond to Webhook" node at the end

### 4. Configure Frontend

Create `packages/frontend/.env.local`:

```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/event-assistant
```

Restart your frontend server.

## Example n8n Workflows

### Basic Echo Workflow

```
Webhook → Function → Respond to Webhook
```

**Function Node Code:**
```javascript
return {
  json: {
    message: `You said: "${$json.message}". I'm processing your request for ${$json.eventData.name}`,
    actions: [
      { id: 'a1', label: '🏢 Find Venues', type: 'venue_search' },
      { id: 'a2', label: '👥 Source Candidates', type: 'candidate_source' }
    ]
  }
};
```

### Venue Search Workflow

```
Webhook → Switch (check action type) → HTTP Request (venue API) → Format Response → Respond
```

**Switch Node:**
- Route 1: `{{ $json.action === 'venue_search' }}`
- Route 2: `{{ $json.message.includes('venue') }}`

**HTTP Request Node:**
```
URL: https://api.example.com/venues
Method: GET
Query Parameters:
  - location: {{ $json.eventData.location }}
  - capacity: 100
```

**Format Response:**
```javascript
const venues = $json.results || [];
return {
  json: {
    message: `I found ${venues.length} venues for your event:\n\n${venues.map(v => `• ${v.name} (${v.capacity} capacity)`).join('\n')}`,
    actions: [
      { id: 'book1', label: 'Book First Venue', type: 'custom', data: venues[0] }
    ]
  }
};
```

### AI-Powered Response (OpenAI)

```
Webhook → OpenAI → Format → Respond
```

**OpenAI Node:**
```
Model: gpt-4
System Message: "You are an event planning assistant. Help the user plan their ${eventData.type} event."
User Message: {{ $json.message }}
```

**Format Node:**
```javascript
return {
  json: {
    message: $json.choices[0].message.content,
    actions: [
      { id: 'a1', label: 'Continue Planning', type: 'custom' }
    ]
  }
};
```

## Request Format

The frontend sends this JSON to your webhook:

```json
{
  "message": "Find me some venues",
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
    },
    {
      "id": "2",
      "role": "user",
      "content": "Find me some venues",
      "timestamp": "2024-01-15T10:01:00Z"
    }
  ]
}
```

## Response Format

Your n8n workflow should respond with:

```json
{
  "message": "I found 3 venues for you:\n\n• Tech Hub (200 capacity)\n• Innovation Center (150 capacity)\n• Startup Space (100 capacity)",
  "actions": [
    {
      "id": "book1",
      "label": "Book Tech Hub",
      "type": "venue_search",
      "data": { "venueId": "123" }
    },
    {
      "id": "book2",
      "label": "Book Innovation Center",
      "type": "venue_search",
      "data": { "venueId": "456" }
    }
  ]
}
```

## Action Types

The chat supports these action types:

- `venue_search` - Find and book venues
- `candidate_source` - Source candidates from GitHub/Kaggle
- `task_generate` - Generate task checklists
- `custom` - Any custom action

## Testing Without n8n

The chat works without n8n configured! It will:
- Show a fallback message
- Log the request to console
- Allow you to test the UI

## Advanced: Database Integration

To save chat history or trigger backend actions:

```
Webhook → HTTP Request (to your backend) → Respond
```

**HTTP Request to Backend:**
```
URL: http://localhost:3001/api/v1/events
Method: POST
Body:
{
  "name": "{{ $json.eventData.name }}",
  "type": "{{ $json.eventData.type }}",
  "date": "{{ $json.eventData.date }}"
}
```

## Troubleshooting

**Chat shows "n8n integration pending"**
- Check n8n is running: http://localhost:5678
- Verify webhook URL in `.env.local`
- Check browser console for errors

**CORS errors**
- n8n needs CORS enabled for localhost:3000
- Add to n8n environment variables:
  ```
  N8N_CORS_ORIGIN=http://localhost:3000
  ```

**Webhook not receiving data**
- Check n8n workflow is active (toggle in top right)
- Verify webhook path matches `.env.local`
- Check n8n execution logs

## Next Steps

1. Start with the basic echo workflow
2. Add OpenAI for intelligent responses
3. Integrate with your backend APIs
4. Add database storage for conversations
5. Implement specific actions (venue booking, candidate sourcing)

## Example Complete Workflow

See `n8n-example-workflow.json` (coming soon) for a complete working example with:
- Message routing
- OpenAI integration
- Action handling
- Error handling
- Response formatting
