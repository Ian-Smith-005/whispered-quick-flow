# Diacare App - Production Implementation Documentation

## Overview

Diacare is a comprehensive diabetes management web application that helps users track meals, monitor glucose levels, log health metrics, and receive AI-powered health insights. The app features real-time data synchronization, AI-powered meal analysis from images, and personalized health recommendations.

## Architecture

### Frontend
- **Technology Stack**: HTML, CSS (Bootstrap 5), Vanilla JavaScript (ES6 Modules)
- **Key Pages**:
  - `index.html` - Landing page
  - `login.html` / `register.html` - Authentication
  - `dashboard.html` - Main application interface
  - `about-us.html`, `ai-services.html`, `contact-us.html` - Informational pages

### Backend (Lovable Cloud / Supabase)
- **Database**: PostgreSQL with Row-Level Security (RLS)
- **Authentication**: Supabase Auth with email/password
- **Edge Functions**: Serverless functions for AI integration
- **AI Services**: Lovable AI Gateway (Gemini 2.5 Flash)

## Database Schema

### Tables

#### 1. `profiles`
User profile information linked to authentication
```sql
- id (UUID, PK)
- user_id (UUID, FK to auth.users, UNIQUE)
- full_name (TEXT)
- date_of_birth (DATE)
- diabetes_type (TEXT: type1, type2, prediabetes, gestational)
- diagnosis_date (DATE)
- created_at, updated_at (TIMESTAMP)
```

#### 2. `meals`
Meal tracking with nutritional information
```sql
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- meal_name (TEXT, required)
- meal_type (TEXT: breakfast, lunch, dinner, snack)
- description (TEXT)
- calories, carbohydrates, protein, fat, fiber (NUMERIC)
- image_url (TEXT)
- ai_analyzed (BOOLEAN)
- meal_time (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

#### 3. `glucose_readings`
Blood glucose monitoring
```sql
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- glucose_value (NUMERIC, required)
- reading_time (TIMESTAMP)
- reading_context (TEXT: fasting, before_meal, after_meal, bedtime, random)
- notes (TEXT)
- created_at, updated_at (TIMESTAMP)
```

#### 4. `user_metrics`
General health metrics storage
```sql
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- metric_type (TEXT: weight, blood_pressure, a1c, medication, exercise)
- value (JSONB) - flexible structure for different metric types
- recorded_at (TIMESTAMP)
- notes (TEXT)
- created_at, updated_at (TIMESTAMP)
```

#### 5. `ai_insights`
AI-generated recommendations and chat history
```sql
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- insight_type (TEXT: meal_suggestion, glucose_pattern, health_tip, chat_response)
- content (TEXT, required)
- metadata (JSONB)
- created_at (TIMESTAMP)
```

### Security (Row-Level Security)

All tables have RLS enabled with policies ensuring:
- Users can only view their own data
- Users can only insert/update/delete their own records
- No cross-user data access possible

## Core Features

### 1. Authentication System
**Files**: `assets/js/auth.js`, `assets/js/session-check.js`

**Functionality**:
- Email/password registration with validation
- Secure login with session management
- Auto-confirm email (for testing/development)
- Session persistence across page refreshes
- Protected routes with automatic redirect
- Logout functionality

**Key Functions**:
```javascript
- handleSignUp(email, password, fullName)
- handleLogin(email, password)
- handleLogout()
- checkAuth() // Validates current session
```

### 2. Meal Tracking & Analysis
**Files**: `assets/js/dashboard-data.js`, `assets/js/meal-image-analysis.js`

**Functionality**:
- Manual meal logging with nutritional data
- AI-powered image analysis (upload or camera)
- Meal history viewing and management
- Real-time meal updates

**AI Image Analysis Flow**:
1. User uploads/captures food image
2. Image converted to base64
3. Sent to `analyze-meal-image` edge function
4. Gemini 2.5 Flash analyzes image
5. Returns: food identification, nutrition, glycemic impact, recommendations
6. Meal automatically saved to database
7. Results displayed in UI

**Key Functions**:
```javascript
- addMeal(mealData)
- getMeals(limit)
- updateMeal(mealId, updates)
- deleteMeal(mealId)
- analyzeMealImage(file)
```

### 3. Glucose Monitoring
**Files**: `assets/js/dashboard-data.js`

**Functionality**:
- Log glucose readings with context
- View reading history
- Calculate statistics (average, trends)
- Display on dashboard charts

**Key Functions**:
```javascript
- addGlucoseReading(readingData)
- getGlucoseReadings(limit)
- deleteGlucoseReading(readingId)
```

### 4. Health Metrics Tracking
**Files**: `assets/js/dashboard-data.js`

**Functionality**:
- Track weight, blood pressure, A1c, medications, exercise
- Flexible JSONB storage for various metric types
- Historical data viewing
- Trend visualization

**Key Functions**:
```javascript
- addUserMetric(metricData)
- getUserMetrics(metricType, limit)
```

### 5. AI Health Assistant (Chatbot)
**Files**: `assets/js/ai-chat.js`

**Functionality**:
- Conversational AI powered by Gemini 2.5 Flash
- Context-aware responses using user's health data
- Streaming responses for real-time interaction
- Chat history persistence
- Personalized recommendations

**Data Access**:
The AI chatbot automatically fetches:
- User's recent 10 meals
- User's recent 10 glucose readings
- User's recent 10 health metrics

This context is provided to the AI to generate personalized advice.

**Key Functions**:
```javascript
- initializeChat()
- sendMessage(messageText)
- streamChat({ messages, token, onDelta, onDone })
```

## Edge Functions

### 1. `ai-health-chat`
**Purpose**: Streaming AI chatbot with user health context

**Endpoint**: `/functions/v1/ai-health-chat`

**Authentication**: Requires Bearer token

**Process**:
1. Validates user authentication
2. Fetches user's recent health data
3. Builds context prompt with data
4. Streams AI response from Lovable AI Gateway
5. Saves chat interactions to `ai_insights` table

**Request Body**:
```json
{
  "messages": [
    { "role": "user", "content": "What should I eat for dinner?" }
  ]
}
```

**Response**: Server-Sent Events (SSE) stream

### 2. `analyze-meal-image`
**Purpose**: AI-powered food image recognition and nutritional analysis

**Endpoint**: `/functions/v1/analyze-meal-image`

**Authentication**: Requires Bearer token

**Process**:
1. Validates user authentication
2. Receives image (base64 or URL)
3. Sends to Gemini 2.5 Flash with vision
4. Parses JSON response with nutrition data
5. Saves meal to `meals` table
6. Saves recommendation to `ai_insights` table

**Request Body**:
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "imageUrl": "https://example.com/food.jpg" // alternative to base64
}
```

**Response**:
```json
{
  "analysis": {
    "foods": ["grilled chicken", "brown rice", "vegetables"],
    "portionSizes": "Medium plate with 6oz chicken, 1 cup rice, 2 cups vegetables",
    "nutrition": {
      "calories": 450,
      "carbohydrates": 45,
      "protein": 35,
      "fat": 10,
      "fiber": 8
    },
    "glycemicImpact": "medium",
    "recommendations": "Good balanced meal. Consider reducing rice portion to 3/4 cup...",
    "mealName": "Grilled Chicken with Brown Rice"
  },
  "mealId": "uuid-here"
}
```

## Frontend-Backend Integration

### Data Flow Architecture

```
┌─────────────────┐
│   User Action   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend JS    │
│  (ES6 Modules)  │
└────────┬────────┘
         │
         ├─── Direct Supabase Client Calls (CRUD)
         │    │
         │    ▼
         │   ┌─────────────────┐
         │   │  Supabase DB    │
         │   │  (PostgreSQL)   │
         │   └─────────────────┘
         │
         └─── Edge Function Calls (AI Features)
              │
              ▼
         ┌─────────────────┐
         │  Edge Functions │
         │  (Deno Runtime) │
         └────────┬────────┘
                  │
                  ├─── Fetch User Data (Supabase)
                  │
                  ├─── Call Lovable AI Gateway
                  │    (Gemini 2.5 Flash)
                  │
                  └─── Save Results (Supabase)
```

### Module System

The app uses ES6 modules for clean code organization:

```javascript
// Import Supabase client
import { supabase } from '../../src/integrations/supabase/client.js';

// Import data functions
import { addMeal, getMeals } from './assets/js/dashboard-data.js';

// Import AI functions
import { initializeChat } from './assets/js/ai-chat.js';
import { initializeMealImageAnalysis } from './assets/js/meal-image-analysis.js';
```

## User Workflows

### New User Registration & First Use
1. User visits `register.html`
2. Enters email, password, full name
3. System creates auth user + profile record (via trigger)
4. User redirected to `dashboard.html`
5. Empty state shown with prompts to log first meal/glucose

### Meal Logging via Image
1. User clicks "Upload Photo" or "Take Photo" in Meal Plans section
2. Selects/captures image
3. Loading indicator shown
4. Image sent to `analyze-meal-image` function
5. AI analyzes and returns structured data
6. Meal automatically saved with AI flag
7. Results displayed with nutritional breakdown and recommendations
8. Meal appears in Recent Meals table

### AI Chat Interaction
1. User types message in chat input (Analysis section)
2. Message sent to `ai-health-chat` function
3. Function fetches user's recent health data
4. Data provided as context to AI
5. AI response streamed token-by-token
6. User sees real-time typing effect
7. Conversation history saved to localStorage

### Glucose Tracking
1. User clicks "Quick Add Glucose" (or uses form)
2. Enters value and context
3. Data saved to `glucose_readings` table
4. Dashboard stats automatically update
5. Charts refresh with new data point

## Security Implementation

### Authentication Security
- Passwords hashed by Supabase Auth (bcrypt)
- JWT tokens for session management
- Tokens stored in localStorage
- Auto-refresh on expiration
- HTTPS enforced in production

### Data Security
- **Row-Level Security (RLS)** on all tables
- User can only access their own data via `auth.uid()`
- Foreign keys prevent orphaned records
- Input validation on frontend
- SQL injection prevention via parameterized queries

### API Security
- Edge functions validate JWT tokens
- CORS headers properly configured
- Rate limiting via Lovable AI Gateway
- Error messages don't expose sensitive info

## Performance Optimizations

### Database
- Indexes on frequently queried columns:
  - `meals(user_id, meal_time)`
  - `glucose_readings(user_id, reading_time)`
  - `user_metrics(user_id, metric_type)`
- Queries limited to recent data (default 10-50 records)

### Frontend
- Lazy loading of data sections
- Pagination for large datasets
- Local caching of chat history
- Debouncing of API calls
- Efficient DOM updates

### AI Features
- Streaming responses reduce perceived latency
- Images compressed before upload
- Cached analysis results
- Graceful error handling

## Error Handling

### Frontend Errors
```javascript
try {
  const result = await addMeal(mealData);
  if (!result.success) {
    alert('Error: ' + result.error);
  }
} catch (error) {
  console.error('Unexpected error:', error);
  alert('Something went wrong. Please try again.');
}
```

### Backend Errors
- 401: Authentication required
- 402: AI credits depleted
- 429: Rate limit exceeded
- 500: Server error

All errors logged and returned with helpful messages.

## Environment Configuration

### Required Environment Variables
```bash
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[anon-key]
VITE_SUPABASE_PROJECT_ID=[project-id]
```

### Edge Function Secrets
```bash
LOVABLE_API_KEY=[auto-generated]
SUPABASE_URL=[auto-set]
SUPABASE_SERVICE_ROLE_KEY=[auto-set]
```

## Deployment

### Development
1. Code changes auto-deploy to preview
2. Edge functions deploy automatically
3. Database migrations require user approval

### Production
1. Click "Publish" in Lovable editor
2. All assets deployed to CDN
3. Edge functions deployed to global network
4. Custom domain can be configured

## Monitoring & Debugging

### Available Tools
- Browser console logs
- Network tab (API calls)
- Supabase logs (database queries)
- Edge function logs
- User session tracking

### Common Issues & Solutions

**Issue**: User can't see their data
**Solution**: Check RLS policies, ensure user_id matches auth.uid()

**Issue**: AI analysis fails
**Solution**: Check Lovable AI credits, verify image format

**Issue**: Chat doesn't stream
**Solution**: Verify SSE handling, check CORS headers

## Future Enhancements

### Planned Features
1. Data export (PDF reports)
2. Healthcare provider sharing
3. Medication reminders
4. Integration with glucose monitors (via APIs)
5. Predictive analytics for glucose trends
6. Social features (support groups)

### Scalability Considerations
- Database connection pooling
- CDN for static assets
- Redis caching layer
- Load balancing
- Horizontal scaling of edge functions

## Compliance & Privacy

### Health Data Handling
- Data encrypted at rest and in transit
- User owns their data
- Account deletion removes all data
- No third-party data sharing
- Regular security audits recommended

### HIPAA Considerations
For HIPAA compliance, additional steps required:
- Business Associate Agreement (BAA)
- Enhanced audit logging
- Data retention policies
- Access controls
- Breach notification procedures

## Testing Strategy

### Recommended Tests
1. **Authentication**
   - Sign up with invalid data
   - Login with wrong credentials
   - Session persistence
   
2. **CRUD Operations**
   - Create/read/update/delete for all entities
   - Concurrent updates
   - Data validation

3. **AI Features**
   - Image upload various formats
   - Chat with different contexts
   - Error handling (rate limits)

4. **Security**
   - Cross-user data access attempts
   - XSS prevention
   - CSRF protection

## Support & Maintenance

### Regular Tasks
- Monitor AI credit usage
- Review error logs
- Update dependencies
- Database backups
- Security patches

### User Support
- In-app help documentation
- Contact form for issues
- FAQ section
- Tutorial videos

## Credits

**Technologies Used**:
- Lovable Cloud (Backend)
- Supabase (Database & Auth)
- Lovable AI Gateway (AI Features)
- Bootstrap 5 (UI Framework)
- Chart.js (Data Visualization)
- Font Awesome (Icons)

---

**Version**: 1.0.0  
**Last Updated**: 2025  
**Status**: Production Ready ✅
