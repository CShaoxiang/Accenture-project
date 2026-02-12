# 🚀 Event Chat Assistant - Quick Start Guide

## What You Have

✅ **Chat UI** - Beautiful modal that appears after event creation
✅ **n8n Integration** - Ready to connect to workflows
✅ **Agent Prompt** - Restaurant-style conversational flow adapted for events
✅ **Workflow Template** - Import-ready n8n workflow

## 🎯 Quick Test (5 minutes)

### 1. Test Without n8n (Immediate)

```bash
cd packages/frontend
npm run dev
```

1. Go to http://localhost:3000
2. Click "Create New Event"
3. Fill in event details
4. Click "Create Event & Get AI Help"
5. Chat window appears with fallback responses!

### 2. Set Up n8n (10 minutes)

#### Install n8n
```bash
npm install -g n8n
```

#### Start n8n
```bash
n8n start
```

Access at: http://localhost:5678

#### Import Workflow
1. Go to http://localhost:5678
2. Click "Import from File"
3. Select `n8n-event-assistant-workflow.json`
4. Click "Save" and "Activate"

#### Configure Frontend
Create `packages/frontend/.env.local`:
```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/event-assistant
```

#### Restart Frontend
```bash
# Stop frontend (Ctrl+C)
npm run dev
```

### 3. Test Full Flow

1. Create a new event
2. Chat opens
3. Type: "Find me some venues"
4. See AI response with venue options!
5. Click action buttons
6. Continue conversation

## 📋 What the Agent Does

### Venue Search Flow
```
User: "Find venues"
  ↓
Agent: "What city?"
  ↓
User: "San Francisco"
  ↓
Agent: Shows 3 venue options with [Book] buttons
  ↓
User: Clicks "Book Tech Hub"
  ↓
Agent: "✅ Venue booked! What's next?"
```

### Candidate Sourcing Flow
```
User: Clicks "👥 Source Candidates"
  ↓
Agent: "What skills?"
  ↓
User: "Python, Machine Learning"
  ↓
Agent: "Which platforms? [GitHub] [Kaggle] [Both]"
  ↓
User: Clicks "Both"
  ↓
Agent: Shows top 5 candidates with [Invite] buttons
```

### Task Generation Flow
```
User: Clicks "✅ Generate Tasks"
  ↓
Agent: Analyzes event progress
  ↓
Agent: Shows personalized checklist
  ↓
Agent: "Set up reminders? [Yes] [No]"
```

## 🎨 Customization

### Change Agent Personality

Edit the Function node in n8n workflow:

```javascript
// Make it more casual
response = {
  message: `Hey! Let's find you an awesome venue 🎉`,
  actions: [...]
};

// Make it more formal
response = {
  message: `I shall assist you in securing an appropriate venue.`,
  actions: [...]
};
```

### Add Real API Calls

Replace mock data with real API calls:

```javascript
// In n8n, add HTTP Request node
// URL: https://api.venues.com/search
// Method: GET
// Query: { city: $json.city, capacity: 100 }

// Then format response
const venues = $json.results;
response = {
  message: `Found ${venues.length} venues:\n\n${venues.map(v => 
    `🏢 ${v.name}\n   • ${v.capacity} people\n   • $${v.price}/day`
  ).join('\n\n')}`,
  actions: venues.map(v => ({
    id: v.id,
    label: `Book ${v.name}`,
    type: 'venue_search',
    data: { venueId: v.id }
  }))
};
```

### Connect to Your Backend

Add HTTP Request node to save data:

```javascript
// After venue booking
// HTTP Request node:
// URL: http://localhost:3001/api/v1/venues
// Method: POST
// Body: {
//   "eventId": "{{ $json.eventData.id }}",
//   "venueId": "{{ $json.venueId }}",
//   "status": "REQUESTED"
// }
```

## 🔥 Advanced: Add OpenAI

1. Add OpenAI node in n8n
2. Configure with your API key
3. Use the agent prompt from `N8N-EVENT-AGENT-PROMPT.md`

```
Webhook → OpenAI → Format Response → Respond
```

**OpenAI Node Settings:**
- Model: gpt-4
- System Message: [Copy from N8N-EVENT-AGENT-PROMPT.md]
- User Message: `{{ $json.message }}`
- Temperature: 0.7

## 📊 Response Format

Your n8n workflow must return:

```json
{
  "message": "Text to show user",
  "actions": [
    {
      "id": "unique_id",
      "label": "Button Text",
      "type": "venue_search|candidate_source|task_generate|custom",
      "data": { "any": "data" }
    }
  ]
}
```

## 🐛 Troubleshooting

**Chat shows fallback responses**
- Check n8n is running: http://localhost:5678
- Verify `.env.local` has correct webhook URL
- Check n8n workflow is activated (toggle in top right)

**CORS errors**
- Add to n8n environment:
  ```bash
  export N8N_CORS_ORIGIN=http://localhost:3000
  n8n start
  ```

**Webhook not receiving data**
- Check n8n execution logs (click workflow → Executions)
- Verify webhook path matches `.env.local`
- Check browser console for errors

## 📚 Files Reference

- `EventChatAssistant.tsx` - Chat UI component
- `N8N-EVENT-AGENT-PROMPT.md` - Full agent prompt (restaurant-style flow)
- `n8n-event-assistant-workflow.json` - Import-ready workflow
- `N8N-CHAT-SETUP.md` - Detailed setup guide

## 🎯 Next Steps

1. ✅ Test chat UI (works immediately)
2. ✅ Import n8n workflow
3. ⬜ Add OpenAI for intelligent responses
4. ⬜ Connect to real venue APIs
5. ⬜ Integrate with backend database
6. ⬜ Add candidate sourcing from GitHub/Kaggle
7. ⬜ Implement task generation logic

## 💡 Pro Tips

- Start with the basic workflow, then add complexity
- Test each flow (venue, candidates, tasks) separately
- Use n8n's execution logs to debug
- The agent prompt is your guide - follow the flow structure
- Action buttons make the UX much better than pure text

Ready to test? Just run `npm run dev` and create an event! 🚀
