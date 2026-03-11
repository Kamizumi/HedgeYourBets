# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for both local development and production (EC2) environments.

## Prerequisites

- Google Cloud Console access
- AWS DynamoDB credentials (already configured)
- Access to your EC2 instance and domain (hedgeyourbets.duckdns.org)

## Step 1: Create Google OAuth Credentials

### 1.1 Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**

### 1.2 Configure OAuth Consent Screen

1. Click on **OAuth consent screen** in the left sidebar
2. Select **External** user type
3. Fill in the required information:
   - **App name**: Hedge Your Bets
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Add the following scopes:
   - `userinfo.email`
   - `userinfo.profile`
5. Add test users (for development)
6. Click **Save and Continue**

### 1.3 Create OAuth Client ID

1. Go to **Credentials** tab
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Select **Web application**
4. Configure for **Local Development**:

   - **Name**: Hedge Your Bets (Local)
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
   - Click **Create**
   - **Save the Client ID and Client Secret**

5. Create another OAuth Client ID for **Production**:
   - **Name**: Hedge Your Bets (Production)
   - **Authorized JavaScript origins**:
     - `http://hedgeyourbets.duckdns.org`
     - `https://hedgeyourbets.duckdns.org` (if you have SSL)
     - `http://54.68.83.130`
   - **Authorized redirect URIs**:
     - `http://hedgeyourbets.duckdns.org/api/auth/callback/google`
     - `https://hedgeyourbets.duckdns.org/api/auth/callback/google` (if SSL)
     - `http://54.68.83.130/api/auth/callback/google`
   - Click **Create**
   - **Save the Client ID and Client Secret**

## Step 2: Configure Environment Variables

### 2.1 Local Development (.env.local)

Update your `frontend/.env.local` file:

```bash
# NextAuth Configuration
AUTH_SECRET="Jpt+7xR4vU1fifcerZgIS2/eSEVaEcW/pGs2rJ2lvDg="
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Local)
AUTH_GOOGLE_ID="your-local-google-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-local-google-client-secret"

# GitHub OAuth (optional)
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

# DynamoDB Configurations
AUTH_DYNAMODB_ID="your-aws-access-key-id"
AUTH_DYNAMODB_SECRET="your-aws-secret-access-key"
AUTH_DYNAMODB_REGION="us-west-2"
```

### 2.2 Production Environment (.env.production)

Create `frontend/.env.production` file:

```bash
# NextAuth Configuration
AUTH_SECRET="Jpt+7xR4vU1fifcerZgIS2/eSEVaEcW/pGs2rJ2lvDg="
NEXTAUTH_URL="http://hedgeyourbets.duckdns.org"

# Google OAuth (Production)
AUTH_GOOGLE_ID="your-production-google-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-production-google-client-secret"

# GitHub OAuth (optional)
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

# DynamoDB Configurations
AUTH_DYNAMODB_ID="your-aws-access-key-id"
AUTH_DYNAMODB_SECRET="your-aws-secret-access-key"
AUTH_DYNAMODB_REGION="us-west-2"
```

## Step 3: Verify DynamoDB Table Setup

### 3.1 Check DynamoDB Table

The NextAuth DynamoDB adapter expects a table named `users` with the following schema:

**Table Name**: `users`

**Primary Key**:

- Partition Key: `pk` (String)
- Sort Key: `sk` (String)

**Global Secondary Indexes**:

- GSI1: `GSI1PK` (String) / `GSI1SK` (String)
- GSI2: `GSI2PK` (String) / `GSI2SK` (String)

### 3.2 Create DynamoDB Table (if needed)

If the table doesn't exist, create it using AWS CLI:

```bash
aws dynamodb create-table \
  --table-name users \
  --attribute-definitions \
    AttributeName=pk,AttributeType=S \
    AttributeName=sk,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
    AttributeName=GSI2PK,AttributeType=S \
    AttributeName=GSI2SK,AttributeType=S \
  --key-schema \
    AttributeName=pk,KeyType=HASH \
    AttributeName=sk,KeyType=RANGE \
  --global-secondary-indexes \
    "[{\"IndexName\":\"GSI1\",\"KeySchema\":[{\"AttributeName\":\"GSI1PK\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"GSI1SK\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}},{\"IndexName\":\"GSI2\",\"KeySchema\":[{\"AttributeName\":\"GSI2PK\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"GSI2SK\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]" \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-west-2
```

Or use the AWS Console:

1. Go to DynamoDB in AWS Console
2. Create table with the specifications above
3. Ensure the table is in the `us-west-2` region

## Step 4: Test Local Setup

1. Start your frontend development server:

   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. Click "Sign in with Google"
4. Authorize the application
5. Verify you are redirected back and signed in
6. Check DynamoDB console to confirm user was created

## Step 5: Deploy to Production (EC2)

### 5.1 Upload Environment File

SSH into your EC2 instance and create the production environment file:

```bash
ssh -i your-key.pem ubuntu@54.68.83.130
cd /path/to/hedge-your-bets/frontend
nano .env.production
# Paste the production environment variables
```

### 5.2 Build and Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server (using PM2 or similar)
pm2 start npm --name "hedge-bets-frontend" -- start
# OR use a different process manager
```

### 5.3 Verify Production Setup

1. Navigate to `http://hedgeyourbets.duckdns.org`
2. Test Google sign-in
3. Verify user creation in DynamoDB

## Step 6: Verify Everything Works

### Test Checklist:

- [ ] Local: Google sign-in works
- [ ] Local: User appears in DynamoDB after sign-in
- [ ] Local: User can access protected routes after sign-in
- [ ] Production: Google sign-in works
- [ ] Production: User appears in DynamoDB after sign-in
- [ ] Production: User can access protected routes after sign-in
- [ ] Sign-out works in both environments
- [ ] Session persists on page refresh

## Troubleshooting

### Error: "redirect_uri_mismatch"

- Verify the redirect URI in Google Cloud Console matches exactly
- Check NEXTAUTH_URL is set correctly
- Ensure no trailing slashes in URLs

### Error: "Access blocked: This app's request is invalid"

- Verify OAuth consent screen is properly configured
- Check that test users are added (for development)
- Ensure scopes are configured

### User not appearing in DynamoDB

- Verify AWS credentials are correct
- Check DynamoDB table exists and has correct schema
- Review CloudWatch logs for errors
- Ensure IAM user has proper permissions

### Session not persisting

- Check AUTH_SECRET is the same across environments
- Verify cookies are being set (check browser dev tools)
- Ensure NEXTAUTH_URL matches your actual URL

## Security Notes

1. **Never commit .env files to git** - They contain sensitive credentials
2. Generate a new AUTH_SECRET for production: `openssl rand -base64 32`
3. Rotate AWS credentials regularly
4. Use HTTPS in production (consider setting up SSL certificate)
5. Keep Google OAuth credentials secure
6. Review and limit OAuth scopes to minimum required

## Next Steps

1. Set up SSL certificate for production (Let's Encrypt recommended)
2. Update NEXTAUTH_URL to use HTTPS
3. Update Google OAuth redirect URIs to use HTTPS
4. Consider implementing additional security measures (CSRF protection, rate limiting)
5. Set up monitoring and error logging (CloudWatch, Sentry, etc.)
