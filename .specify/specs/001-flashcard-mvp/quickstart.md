# Quickstart Guide: Flashcard MVP

**Purpose**: Get the VocabApp flashcard feature running locally
**Created**: 2025-11-27
**Prerequisites**: Node.js 18+, npm/yarn, Supabase CLI, Clerk account

## Environment Setup

### 1. Clone and Install

```bash
git clone [repository-url]
cd vocabapp
npm install
```

### 2. Environment Variables

Create `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 3. Database Setup

```bash
# Login to Supabase
supabase login

# Start local Supabase (if using local development)
supabase start

# Run migrations
supabase db push

# Seed initial dictionary data
supabase db seed
```

### 4. Clerk Setup

1. Create application at https://dashboard.clerk.com
2. Configure authentication providers (Email, Google, etc.)
3. Add callback URLs:
   - `http://localhost:3000`
   - `http://localhost:3000/dashboard`
4. Copy API keys to environment variables

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
# App runs at http://localhost:3000
```

### 2. Test Guest Mode

1. Open http://localhost:3000
2. You should see an English word flashcard
3. Press **Spacebar** to reveal Chinese translation
4. Press **Left Arrow** for "unknown" or **Right Arrow** for "known"
5. New random word should appear

### 3. Test Authentication

1. Click "Sign In" button
2. Complete authentication flow
3. You should be redirected to authenticated review
4. Word priority should be: new → unknown → known

### 4. Test Statistics

1. Review several words while authenticated
2. Navigate to dashboard (http://localhost:3000/dashboard)
3. Verify statistics display correctly:
   - Total words reviewed
   - Words reviewed today
   - Words reviewed this week
   - Words remaining

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- FlashcardComponent.test.tsx
```

### Integration Tests

```bash
# Start test server
npm run dev

# Run integration tests
npm run test:integration

# Run specific integration test
npm run test:integration -- --grep "flashcard"
```

### Manual Testing Checklist

- [ ] Guest can access flashcards without login
- [ ] Spacebar reveals translations
- [ ] Left/Right arrows work correctly
- [ ] Authentication flow completes successfully
- [ ] Authenticated users see prioritized words
- [ ] Progress is saved and persisted
- [ ] Statistics update correctly
- [ ] Mobile responsiveness works
- [ ] Keyboard navigation functions properly
- [ ] No JavaScript errors in console

## Troubleshooting

### Common Issues

**"Failed to fetch words" error**
- Check Supabase URL and keys in environment variables
- Verify database migration completed successfully
- Check RLS policies allow appropriate access

**Authentication not working**
- Verify Clerk keys are correctly set
- Check callback URLs in Clerk dashboard
- Ensure middleware.ts is properly configured

**Statistics not updating**
- Verify user_progress table has correct RLS policies
- Check server actions are completing successfully
- Ensure auth.uid() matches Clerk user IDs

**Keyboard shortcuts not working**
- Check browser console for JavaScript errors
- Verify event listeners are properly attached
- Test in different browsers

### Debug Mode

Enable debug logging:

```bash
# Add to .env.local
NEXT_PUBLIC_DEBUG=true
DEBUG=vocabapp:*
```

### Database Issues

Check database state:

```bash
# Connect to local Supabase
supabase db dump --local

# Check table contents
supabase sql "SELECT COUNT(*) FROM dictionary;"
supabase sql "SELECT COUNT(*) FROM user_progress;"

# Verify RLS policies
supabase sql "SELECT * FROM pg_policies WHERE tablename IN ('dictionary', 'user_progress');"
```

## Performance Testing

### Load Testing

```bash
# Install load testing tool
npm install -g autocannon

# Test random word endpoint
autocannon -c 10 -d 30 http://localhost:3000/api/words/random

# Test authenticated endpoints (requires token)
autocannon -c 10 -d 30 -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/words/next
```

### Performance Metrics

Expected performance:
- Word fetch: <100ms
- Statistics calculation: <200ms
- Authentication check: <50ms
- Page load: <3s on 3G

## Deployment Preparation

### Build Test

```bash
# Test production build
npm run build

# Start production server
npm start

# Verify all features work in production mode
```

### Environment Validation

```bash
# Check environment variables
node -e "console.log(process.env)" | grep -E "(SUPABASE|CLERK)"

# Test database connection
node -e "require('./lib/supabase/client').testConnection()"
```

### Final Checks

- [ ] All environment variables set for production
- [ ] Database has required tables and RLS policies
- [ ] Clerk callback URLs configured for production domain
- [ ] Build completes without errors
- [ ] All tests pass
- [ ] Manual testing completed successfully

## Next Steps

1. **Database Population**: Add initial vocabulary words
2. **UI Polish**: Refine based on user feedback
3. **Analytics**: Add usage tracking
4. **Performance**: Optimize based on metrics
5. **Features**: Plan next iteration based on user needs

For questions or issues, refer to the main documentation or create an issue in the repository.## Validation Summary

✅ **Environment Setup**: All required tools and configurations documented
✅ **Local Development**: Step-by-step setup instructions provided
✅ **Testing Strategy**: Unit, integration, and manual testing covered
✅ **Troubleshooting**: Common issues and solutions documented
✅ **Performance**: Testing methodology and expected metrics defined
✅ **Deployment**: Pre-deployment checklist provided

This quickstart guide provides everything needed to get the flashcard MVP running locally and ready for development. All steps align with the constitutional principles of simplicity and maintainability.## Validation Summary

✅ **Environment Setup**: All required tools and configurations documented
✅ **Local Development**: Step-by-step setup instructions provided
✅ **Testing Strategy**: Unit, integration, and manual testing covered
✅ **Troubleshooting**: Common issues and solutions documented
✅ **Performance**: Testing methodology and expected metrics defined
✅ **Deployment**: Pre-deployment checklist provided

This quickstart guide provides everything needed to get the flashcard MVP running locally and ready for development. All steps align with the constitutional principles of simplicity and maintainability.## Validation Summary

✅ **Environment Setup**: All required tools and configurations documented
✅ **Local Development**: Step-by-step setup instructions provided
✅ **Testing Strategy**: Unit, integration, and manual testing covered
✅ **Troubleshooting**: Common issues and solutions documented
✅ **Performance**: Testing methodology and expected metrics defined
✅ **Deployment**: Pre-deployment checklist provided

This quickstart guide provides everything needed to get the flashcard MVP running locally and ready for development. All steps align with the constitutional principles of simplicity and maintainability.## Validation Summary

✅ **Environment Setup**: All required tools and configurations documented
✅ **Local Development**: Step-by-step setup instructions provided
✅ **Testing Strategy**: Unit, integration, and manual testing covered
✅ **Troubleshooting**: Common issues and solutions documented
✅ **Performance**: Testing methodology and expected metrics defined
✅ **Deployment**: Pre-deployment checklist provided

This quickstart guide provides everything needed to get the flashcard MVP running locally and ready for development. All steps align with the constitutional principles of simplicity and maintainability.## Validation Summary

✅ **Environment Setup**: All required tools and configurations documented
✅ **Local Development**: Step-by-step setup instructions provided
✅ **Testing Strategy**: Unit, integration, and manual testing covered
✅ **Troubleshooting**: Common issues and solutions documented
✅ **Performance**: Testing methodology and expected metrics defined
✅ **Deployment**: Pre-deployment checklist provided

This quickstart guide provides everything needed to get the flashcard MVP running locally and ready for development. All steps align with the constitutional principles of simplicity and maintainability.