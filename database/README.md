# Chat History Database Setup

## Overview
This database stores AI chatbot conversations, user sessions, and analytics for the Travello application.

## Database Structure

### Tables

1. **users** - User information
2. **chat_sessions** - Chat session tracking
3. **chat_messages** - Individual chat messages
4. **ai_analytics** - AI performance analytics

## Setup Instructions

### 1. Create Database
```sql
-- Import the SQL file in phpMyAdmin or run:
mysql -u root -p < chat_history.sql
```

### 2. Configure PHP API
Edit `api/chat_history.php` and update the database configuration:

```php
$db_config = [
    'host' => 'localhost',        // Your MySQL host
    'username' => 'root',        // Your MySQL username
    'password' => '',            // Your MySQL password
    'database' => 'travello_chat' // Database name
];
```

### 3. Configure Frontend
Update your `.env` file:

```env
VITE_API_URL=http://localhost/travello/api
```

### 4. Web Server Configuration
Make sure your web server (Apache/Nginx) is configured to serve PHP files.

## API Endpoints

### Save Message
```
POST /api/chat_history.php
Content-Type: application/json

{
  "action": "save_message",
  "session_id": "session_123456",
  "content": "Hello, how can I help you?",
  "role": "ai",
  "name": "Travello Assistant",
  "timestamp": "14:30",
  "language": "en",
  "suggestions": ["What are destinations?", "Travel tips"],
  "follow_up_questions": ["Need more details?"]
}
```

### End Session
```
POST /api/chat_history.php

{
  "action": "end_session",
  "session_id": "session_123456"
}
```

### Get Sessions
```
GET /api/chat_history.php?action=get_sessions&limit=10&offset=0
```

### Get Messages
```
GET /api/chat_history.php?action=get_messages&session_id=session_123456
```

### Save Analytics
```
POST /api/chat_history.php

{
  "action": "save_analytics",
  "session_id": "session_123456",
  "message_category": "destinations",
  "language_used": "en",
  "response_time_ms": 1200,
  "user_satisfaction": "positive"
}
```

## Frontend Integration

The chat history is automatically saved when users interact with the chatbot. The service handles:

- ✅ User message saving
- ✅ AI response saving
- ✅ Session management
- ✅ Language tracking
- ✅ Suggestions and follow-up questions
- ✅ Error handling (fails gracefully if DB is down)

## Features

### Automatic Saving
- All user messages are saved to database
- AI responses are saved with suggestions
- Session information is tracked
- Language preferences are stored

### Analytics
- Response time tracking
- Message categorization
- User satisfaction metrics
- Language usage statistics

### Privacy & Security
- User data is anonymized by default
- Sessions can be ended manually
- Data retention policies can be implemented
- GDPR compliance considerations

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL credentials in `chat_history.php`
   - Ensure MySQL service is running
   - Verify database exists

2. **CORS Errors**
   - Check API URL in `.env` file
   - Ensure headers are properly set in PHP

3. **Messages Not Saving**
   - Check browser console for errors
   - Verify API endpoint is accessible
   - Check network tab in browser dev tools

### Testing

You can test the API using curl:

```bash
# Test save message
curl -X POST http://localhost/travello/api/chat_history.php \
  -H "Content-Type: application/json" \
  -d '{
    "action": "save_message",
    "session_id": "test_session",
    "content": "Test message",
    "role": "user",
    "name": "Test User",
    "timestamp": "14:30"
  }'
```

## Performance Considerations

- Database indexes are optimized for common queries
- JSON fields are used for flexible data storage
- Sessions are automatically cleaned up when inactive
- Consider implementing data archiving for long-term storage

## Future Enhancements

- [ ] Message search functionality
- [ ] Export chat history
- [ ] Real-time analytics dashboard
- [ ] Sentiment analysis
- [ ] Multi-language content moderation
- [ ] Integration with CRM systems
