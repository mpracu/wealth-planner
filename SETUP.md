# Wealth Planner v2 - Setup Guide

## New Features
- 🔐 User authentication with AWS Cognito
- 💾 Save and load wealth planning scenarios
- 💼 Net worth tracker with:
  - Multiple asset types (liquid, stocks, real estate, etc.)
  - Automatic stock price updates
  - Debt/liability tracking
  - Tags for organization
- 📊 Switch between Simulator and Net Worth views

## Prerequisites
- AWS CLI configured (`aws configure`)
- Node.js 16+
- Alpha Vantage API key (free at https://www.alphavantage.co/support/#api-key)

## Step 1: Install Dependencies

```bash
cd wealth-planner
npm install
```

## Step 2: Set Up AWS Infrastructure

```bash
# Make scripts executable
chmod +x aws-setup.sh deploy-lambda.sh

# Create DynamoDB tables, Cognito, IAM roles
./aws-setup.sh

# Copy the output values - you'll need them for .env
```

## Step 3: Deploy Lambda Functions

```bash
# Deploy API handler and stock price updater
./deploy-lambda.sh

# Copy the API endpoint from output
```

## Step 4: Get Alpha Vantage API Key

1. Go to https://www.alphavantage.co/support/#api-key
2. Get your free API key
3. Update the Lambda function:

```bash
aws lambda update-function-configuration \
  --function-name wealth-planner-stock-updater \
  --environment "Variables={ALPHA_VANTAGE_KEY=YOUR_KEY_HERE}" \
  --region us-east-1
```

## Step 5: Configure Environment Variables

Create `.env` file from the template:

```bash
cp .env.example .env
```

Edit `.env` with the values from Step 2 and 3:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_IDENTITY_POOL_ID=us-east-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
VITE_API_ENDPOINT=https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/prod
```

## Step 6: Test Locally

```bash
npm run dev
```

Visit http://localhost:5173 and:
1. Sign up with your email
2. Check email for confirmation code
3. Sign in
4. Test the simulator and net worth features

## Step 7: Deploy to Production

```bash
# Build the app
npm run build

# Sync to S3 (replace with your bucket name)
aws s3 sync dist/ s3://your-wealth-planner-bucket --delete

# Invalidate CloudFront cache (replace with your distribution ID)
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## Cost Estimate (Monthly)

With minimal usage (< 100 users):
- **Cognito**: Free (up to 50k MAUs)
- **DynamoDB**: Free tier (25GB, 25 WCU/RCU)
- **Lambda**: ~$0.20 (1M requests free tier)
- **API Gateway**: ~$3.50 (1M requests)
- **S3**: ~$0.50
- **CloudFront**: ~$1.00

**Total: ~$5/month** (mostly API Gateway)

## Architecture

```
User Browser
    ↓
CloudFront (CDN)
    ↓
S3 (Static Site)
    ↓
Cognito (Auth) → API Gateway → Lambda → DynamoDB
    ↓
EventBridge (Daily) → Lambda (Stock Updater) → Alpha Vantage API
```

## Data Model

### Scenarios Table
```
userId (PK) | scenarioId (SK) | name | data | createdAt
```

### Net Worth Items Table
```
userId (PK) | itemId (SK) | name | type | category | value | symbol | shares | tags | updatedAt
```

### Stock Prices Table
```
symbol (PK) | price | updatedAt
```

## Security Notes

- All API calls require authentication via Cognito
- DynamoDB access is scoped to user's own data via IAM conditions
- Stock prices are cached to minimize API calls
- No sensitive data stored in frontend

## Troubleshooting

### "User is not authenticated"
- Check that Cognito User Pool ID and Client ID are correct in .env
- Verify you've confirmed your email

### "Network error" when saving
- Check API endpoint in .env
- Verify Lambda has correct IAM permissions
- Check CloudWatch logs: `aws logs tail /aws/lambda/wealth-planner-api --follow`

### Stock prices not updating
- Verify Alpha Vantage API key is set in Lambda environment
- Check EventBridge rule is enabled
- Free tier has 5 calls/minute limit

### Build fails
- Delete node_modules and package-lock.json
- Run `npm install` again
- Check Node.js version (needs 16+)

## Next Steps

- Add more asset categories
- Export net worth to CSV
- Historical net worth tracking
- Budget planning integration
- Multi-currency support
