#!/bin/bash

# Wealth Planner AWS Infrastructure Setup
# Run this script to create all necessary AWS resources

set -e

REGION="us-east-1"
APP_NAME="wealth-planner"

echo "🚀 Setting up AWS infrastructure for Wealth Planner..."

# 1. Create DynamoDB Tables
echo "📊 Creating DynamoDB tables..."

aws dynamodb create-table \
  --table-name ${APP_NAME}-scenarios \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=scenarioId,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=scenarioId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION

aws dynamodb create-table \
  --table-name ${APP_NAME}-networth-items \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=itemId,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=itemId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION

aws dynamodb create-table \
  --table-name ${APP_NAME}-stock-prices \
  --attribute-definitions \
    AttributeName=symbol,AttributeType=S \
  --key-schema \
    AttributeName=symbol,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION

# 2. Create Cognito User Pool
echo "🔐 Creating Cognito User Pool..."

USER_POOL_ID=$(aws cognito-idp create-user-pool \
  --pool-name ${APP_NAME}-users \
  --auto-verified-attributes email \
  --username-attributes email \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}" \
  --region $REGION \
  --query 'UserPool.Id' \
  --output text)

echo "User Pool ID: $USER_POOL_ID"

# 3. Create Cognito User Pool Client
echo "📱 Creating User Pool Client..."

CLIENT_ID=$(aws cognito-idp create-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-name ${APP_NAME}-client \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --region $REGION \
  --query 'UserPoolClient.ClientId' \
  --output text)

echo "Client ID: $CLIENT_ID"

# 4. Create Identity Pool
echo "🆔 Creating Identity Pool..."

IDENTITY_POOL_ID=$(aws cognito-identity create-identity-pool \
  --identity-pool-name ${APP_NAME}_identity \
  --allow-unauthenticated-identities \
  --cognito-identity-providers ProviderName=cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID},ClientId=${CLIENT_ID} \
  --region $REGION \
  --query 'IdentityPoolId' \
  --output text)

echo "Identity Pool ID: $IDENTITY_POOL_ID"

# 5. Create IAM roles for Cognito
echo "👤 Creating IAM roles..."

# Authenticated role
cat > /tmp/auth-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Federated": "cognito-identity.amazonaws.com"},
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {"cognito-identity.amazonaws.com:aud": "$IDENTITY_POOL_ID"},
      "ForAnyValue:StringLike": {"cognito-identity.amazonaws.com:amr": "authenticated"}
    }
  }]
}
EOF

AUTH_ROLE_ARN=$(aws iam create-role \
  --role-name ${APP_NAME}-auth-role \
  --assume-role-policy-document file:///tmp/auth-trust-policy.json \
  --query 'Role.Arn' \
  --output text)

# Attach policy to authenticated role
cat > /tmp/auth-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Query"
    ],
    "Resource": [
      "arn:aws:dynamodb:${REGION}:*:table/${APP_NAME}-scenarios",
      "arn:aws:dynamodb:${REGION}:*:table/${APP_NAME}-networth-items",
      "arn:aws:dynamodb:${REGION}:*:table/${APP_NAME}-stock-prices"
    ],
    "Condition": {
      "ForAllValues:StringEquals": {
        "dynamodb:LeadingKeys": ["\${cognito-identity.amazonaws.com:sub}"]
      }
    }
  }]
}
EOF

aws iam put-role-policy \
  --role-name ${APP_NAME}-auth-role \
  --policy-name ${APP_NAME}-dynamodb-policy \
  --policy-document file:///tmp/auth-policy.json

# Set identity pool roles
aws cognito-identity set-identity-pool-roles \
  --identity-pool-id $IDENTITY_POOL_ID \
  --roles authenticated=$AUTH_ROLE_ARN \
  --region $REGION

# 6. Output configuration
echo ""
echo "✅ Setup complete! Add these to your .env file:"
echo ""
echo "VITE_AWS_REGION=$REGION"
echo "VITE_USER_POOL_ID=$USER_POOL_ID"
echo "VITE_USER_POOL_CLIENT_ID=$CLIENT_ID"
echo "VITE_IDENTITY_POOL_ID=$IDENTITY_POOL_ID"
echo ""
echo "Save these values - you'll need them!"
