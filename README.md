# Wealth Planner

A modern financial calculator to project when you'll reach $1 million based on your current situation.

## Features

- Interactive sliders for all parameters
- Real-time chart updates
- Inflation-adjusted calculations
- Clean, modern UI
- Fully responsive

## Local Development

```bash
npm install
npm run dev
```

## AWS Deployment (S3 + CloudFront)

### 1. Create S3 Bucket

```bash
# Replace with your unique bucket name
BUCKET_NAME="wealth-planner-app"
REGION="us-east-1"

# Create bucket
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Enable static website hosting
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Set bucket policy for public read
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
  }]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json
```

### 2. Create CloudFront Distribution

```bash
# Create distribution
aws cloudfront create-distribution \
  --origin-domain-name $BUCKET_NAME.s3-website-$REGION.amazonaws.com \
  --default-root-object index.html

# Note the distribution ID from the output
```

### 3. Deploy

```bash
# Build the app
npm run build

# Upload to S3
aws s3 sync dist/ s3://$BUCKET_NAME --delete

# Invalidate CloudFront cache (replace DISTRIBUTION_ID)
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Cost Estimate

- S3: ~$0.50/month (1GB storage + 10k requests)
- CloudFront: Free tier covers 1TB transfer/month, then $0.085/GB
- **Total: ~$0.50-2/month for typical usage**

## Tech Stack

- React 19
- Vite
- Recharts
- AWS S3 + CloudFront
