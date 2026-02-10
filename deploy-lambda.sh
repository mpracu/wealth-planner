#!/bin/bash

# Deploy Lambda functions

set -e

REGION="us-east-1"
APP_NAME="wealth-planner"

echo "📦 Deploying Lambda functions..."

# Create Lambda execution role
cat > /tmp/lambda-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "lambda.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
EOF

LAMBDA_ROLE_ARN=$(aws iam create-role \
  --role-name ${APP_NAME}-lambda-role \
  --assume-role-policy-document file:///tmp/lambda-trust-policy.json \
  --query 'Role.Arn' \
  --output text 2>/dev/null || aws iam get-role --role-name ${APP_NAME}-lambda-role --query 'Role.Arn' --output text)

# Attach policies
aws iam attach-role-policy \
  --role-name ${APP_NAME}-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
  --role-name ${APP_NAME}-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

echo "Waiting for role to propagate..."
sleep 10

# Package and deploy API handler
cd lambda
npm init -y
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
zip -r api-handler.zip api-handler.js node_modules

aws lambda create-function \
  --function-name ${APP_NAME}-api \
  --runtime nodejs20.x \
  --role $LAMBDA_ROLE_ARN \
  --handler api-handler.handler \
  --zip-file fileb://api-handler.zip \
  --timeout 30 \
  --region $REGION 2>/dev/null || \
aws lambda update-function-code \
  --function-name ${APP_NAME}-api \
  --zip-file fileb://api-handler.zip \
  --region $REGION

# Deploy stock price updater
zip -r stock-updater.zip stock-price-updater.js node_modules

aws lambda create-function \
  --function-name ${APP_NAME}-stock-updater \
  --runtime nodejs20.x \
  --role $LAMBDA_ROLE_ARN \
  --handler stock-price-updater.handler \
  --zip-file fileb://stock-updater.zip \
  --timeout 300 \
  --environment "Variables={ALPHA_VANTAGE_KEY=demo}" \
  --region $REGION 2>/dev/null || \
aws lambda update-function-code \
  --function-name ${APP_NAME}-stock-updater \
  --zip-file fileb://stock-updater.zip \
  --region $REGION

cd ..

# Create API Gateway
API_ID=$(aws apigatewayv2 create-api \
  --name ${APP_NAME}-api \
  --protocol-type HTTP \
  --region $REGION \
  --query 'ApiId' \
  --output text 2>/dev/null || aws apigatewayv2 get-apis --region $REGION --query "Items[?Name=='${APP_NAME}-api'].ApiId" --output text)

# Create Lambda integration
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:${REGION}:$(aws sts get-caller-identity --query Account --output text):function:${APP_NAME}-api \
  --payload-format-version 2.0 \
  --region $REGION \
  --query 'IntegrationId' \
  --output text)

# Create routes
for route in "GET /scenarios" "POST /scenarios" "DELETE /scenarios/{id}" "GET /networth" "POST /networth" "PUT /networth/{id}" "DELETE /networth/{id}" "GET /stock-price"; do
  aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key "$route" \
    --target integrations/$INTEGRATION_ID \
    --region $REGION 2>/dev/null || echo "Route $route already exists"
done

# Create stage
aws apigatewayv2 create-stage \
  --api-id $API_ID \
  --stage-name prod \
  --auto-deploy \
  --region $REGION 2>/dev/null || echo "Stage already exists"

# Grant API Gateway permission to invoke Lambda
aws lambda add-permission \
  --function-name ${APP_NAME}-api \
  --statement-id apigateway \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:$(aws sts get-caller-identity --query Account --output text):${API_ID}/*/*" \
  --region $REGION 2>/dev/null || echo "Permission already exists"

# Create EventBridge rule for daily stock updates (9 AM EST)
aws events put-rule \
  --name ${APP_NAME}-daily-stock-update \
  --schedule-expression "cron(0 14 * * ? *)" \
  --region $REGION

aws events put-targets \
  --rule ${APP_NAME}-daily-stock-update \
  --targets "Id=1,Arn=arn:aws:lambda:${REGION}:$(aws sts get-caller-identity --query Account --output text):function:${APP_NAME}-stock-updater" \
  --region $REGION

aws lambda add-permission \
  --function-name ${APP_NAME}-stock-updater \
  --statement-id eventbridge \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn "arn:aws:events:${REGION}:$(aws sts get-caller-identity --query Account --output text):rule/${APP_NAME}-daily-stock-update" \
  --region $REGION 2>/dev/null || echo "Permission already exists"

API_ENDPOINT="https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod"

echo ""
echo "✅ Lambda deployment complete!"
echo ""
echo "Add this to your .env file:"
echo "VITE_API_ENDPOINT=$API_ENDPOINT"
