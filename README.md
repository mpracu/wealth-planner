# 💰 Wealth Planner

An interactive wealth planning calculator that helps you visualize your path to financial independence. See exactly when you'll reach your $1 million goal based on your current situation and investment strategy.

![Wealth Planner Demo](https://img.shields.io/badge/React-19.0-blue) ![Vite](https://img.shields.io/badge/Vite-6.0-purple) ![License](https://img.shields.io/badge/license-MIT-green)

## 🌐 Live Demo

**[Try it now →](https://d2787qonhlkw2.cloudfront.net/)**

## ✨ Features

- **Real-time Projections**: Instantly see how your wealth grows over time
- **Inflation-Adjusted**: View both nominal and real (inflation-adjusted) values
- **Interactive Controls**: Adjust all parameters with intuitive sliders
- **Visual Charts**: Beautiful, responsive charts powered by Recharts
- **Milestone Tracking**: Know exactly when you'll reach $1M in today's dollars
- **Mobile Responsive**: Works seamlessly on all devices
- **Analytics Tracking**: Built-in Google Analytics 4 for user behavior insights

## 🎯 What You Can Calculate

- Current age and starting capital
- Monthly investment contributions
- Expected annual returns (0-15%)
- Inflation rate adjustments (0-10%)
- Projected wealth up to 50 years into the future

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/mpracu/wealth-planner.git

# Navigate to project directory
cd wealth-planner

# Install dependencies
npm install

# (Optional) Set up Google Analytics
# Copy .env.example to .env and add your GA4 Measurement ID
cp .env.example .env
# Edit .env and replace G-XXXXXXXXXX with your actual ID

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app in action!

## 📦 Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` directory, ready to deploy to any static hosting service.

## ☁️ Deploy to AWS

This app is currently hosted on AWS using S3 + CloudFront. Here's how to deploy your own instance:

### Prerequisites

- AWS CLI installed and configured (`aws configure`)
- An AWS account with appropriate permissions

### Step 1: Create S3 Bucket

```bash
# Create bucket (replace with your unique bucket name)
aws s3 mb s3://your-wealth-planner-bucket

# Enable static website hosting
aws s3 website s3://your-wealth-planner-bucket --index-document index.html
```

### Step 2: Create CloudFront Distribution

1. Go to AWS CloudFront Console
2. Create a new distribution
3. Set origin to your S3 bucket
4. Configure default root object as `index.html`
5. Note your CloudFront distribution ID and domain

### Step 3: Add Deployment Script

Add this to your `package.json` scripts:

```json
"deploy": "npm run build && aws s3 sync dist/ s3://your-wealth-planner-bucket --delete && aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths '/*'"
```

Replace:
- `your-wealth-planner-bucket` with your S3 bucket name
- `YOUR_DISTRIBUTION_ID` with your CloudFront distribution ID

### Step 4: Deploy

```bash
npm run deploy
```

Your app will be live at your CloudFront URL (e.g., `https://d2787qonhlkw2.cloudfront.net/`)

### Alternative: One-Command Setup

You can also use AWS Amplify for simpler deployment:

```bash
npm install -g @aws-amplify/cli
amplify init
amplify add hosting
amplify publish
```

## 🛠️ Technology Stack

- **React 19** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Recharts** - Powerful charting library
- **Google Analytics 4** - User behavior tracking
- **CSS3** - Custom styling with modern features

## 📊 Analytics Setup

The app includes Google Analytics 4 integration to track user behavior.

### Get Your GA4 Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property (or use existing)
3. Set up a Web data stream
4. Copy your Measurement ID (format: `G-XXXXXXXXXX`)

### Configure Analytics

Create a `.env` file in the project root:

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

### What Gets Tracked

- **Page Views**: Every time someone visits
- **User Interactions**: Slider adjustments (age, capital, investments, returns, inflation)
- **Milestone Events**: When users reach the $1M goal
- **Session Duration**: How long users engage with the calculator
- **Demographics**: Location, device type, browser

### View Your Analytics

Visit your [Google Analytics Dashboard](https://analytics.google.com/) to see:
- Real-time active users
- Most adjusted parameters
- Average user age/investment inputs
- Geographic distribution
- User retention and engagement

## 📈 How It Works

The calculator uses compound interest formulas to project your wealth:

1. **Monthly Compounding**: Returns are calculated monthly for accuracy
2. **Inflation Adjustment**: Real values show purchasing power in today's dollars
3. **Visual Comparison**: See both nominal and inflation-adjusted projections side-by-side

## 🎨 Customization

The app uses a clean, dark theme that's easy on the eyes. You can customize colors and styling in:

- `src/App.css` - Main application styles
- `src/index.css` - Global styles and theme variables

## 📝 Use Cases

- **Retirement Planning**: Calculate when you can retire comfortably
- **Financial Goal Setting**: Visualize your path to specific wealth targets
- **Investment Strategy**: Compare different contribution and return scenarios
- **Education**: Learn about compound interest and inflation impact

## 🚀 Deployment

This app is deployed on AWS using S3 for static hosting and CloudFront for global CDN distribution.

### Deployment Process

```bash
# 1. Build the production app
npm run build

# 2. Sync to S3 bucket
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Environment Variables

For production deployment, set your Google Analytics Measurement ID:

```bash
# Create .env file
echo "VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX" > .env

# Then build
npm run build
```

The app will automatically use the GA4 ID from the environment variable during build.

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

Built with modern web technologies to help people make informed financial decisions.

---

**Disclaimer**: This calculator provides estimates based on the inputs you provide. Past performance doesn't guarantee future results. Consult with a financial advisor for personalized advice.
