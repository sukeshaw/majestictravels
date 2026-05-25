# majesticholidays.online Website - Complete Setup Guide

## 📋 Table of Contents
1. [Project Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running the Application](#running)
6. [Database Setup](#database)
7. [Email Configuration](#email)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## <a name="overview"></a>Project Overview

**majesticholidays.online** is a complete travel agency booking website with:
- Professional landing page
- Service listings (Tours, Cabs, Buses)
- Dynamic enquiry forms for each service type
- Contact page with location, phone, email
- Backend API for processing submissions
- Email notifications (admin + customer)
- Database integration
- Responsive design

### Project Structure
```
travel-agency-website/
├── travel_agency_website.html      (Frontend - single page)
├── travel_agency_backend.js         (Backend API - Node.js)
├── package.json                     (Dependencies)
├── .env                             (Environment variables)
├── .env.example                     (Template)
├── database.sql                     (SQL setup scripts)
├── README.md                        (Documentation)
├── routes/                          (API routes - optional modular structure)
│   ├── enquiries.js
│   └── contact.js
└── public/                          (Static files if needed)
```

---

## <a name="prerequisites"></a>Prerequisites

### Required Software
1. **Node.js** (v14.0.0 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version` && `npm --version`

2. **MySQL** (v5.7 or higher)
   - Download: https://dev.mysql.com/downloads/
   - Or use MariaDB: https://mariadb.org/

3. **Git** (optional, for version control)
   - Download: https://git-scm.com/

4. **Postman** (optional, for API testing)
   - Download: https://www.postman.com/

### Accounts Needed
- **Email account** (Gmail or other) for sending notifications
- **SendGrid account** (optional, alternative to Nodemailer)
- **Web hosting** (for deployment)

---

## <a name="installation"></a>Installation

### Step 1: Set Up Project Directory
```bash
# Create project folder
mkdir travel-agency-website
cd travel-agency-website

# Initialize Node project
npm init -y
```

### Step 2: Install Dependencies
```bash
npm install express cors dotenv mysql2 nodemailer validator express-rate-limit
```

**Dependencies Explained:**
- `express` - Web framework
- `cors` - Cross-Origin Resource Sharing
- `dotenv` - Environment variable management
- `mysql2` - MySQL database driver
- `nodemailer` - Email sending
- `validator` - Input validation
- `express-rate-limit` - Rate limiting

### Step 3: Development Dependencies (Optional)
```bash
npm install --save-dev nodemon
```

### Step 4: Copy Files
1. Save the website HTML as `travel_agency_website.html`
2. Save the backend code as `travel_agency_backend.js`
3. Create `.env` file (see Configuration section)

---

## <a name="configuration"></a>Configuration

### Step 1: Create `.env` File
Create a new file named `.env` in your project root:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=travel_agency

# Email Configuration (Gmail Example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@majesticholidays.online.com

# Alternatively, use SendGrid
# SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Step 2: Email Configuration Details

#### Option A: Using Gmail (Recommended for testing)

1. Enable 2-Factor Authentication on your Gmail account
2. Create an App Password:
   - Go to myaccount.google.com/security
   - Find "App passwords" (appears if 2FA is enabled)
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password
   - Paste in `.env` as `EMAIL_PASSWORD`

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

#### Option B: Using SendGrid (Production recommended)

```bash
npm install @sendgrid/mail
```

Update backend code to use SendGrid:
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Then use:
sgMail.send({
    to: 'user@example.com',
    from: 'info@majesticholidays.online.com',
    subject: 'Enquiry Confirmation',
    html: htmlContent
});
```

#### Option C: Using Mailgun
```bash
npm install mailgun.js
```

---

## <a name="database"></a>Database Setup

### Step 1: Create Database
```bash
# Open MySQL CLI
mysql -u root -p

# Create database
CREATE DATABASE travel_agency;
USE travel_agency;
```

### Step 2: Create Required Tables
```sql
-- Enquiries table
CREATE TABLE enquiries (
    enquiry_id INT AUTO_INCREMENT PRIMARY KEY,
    guest_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(150) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    enquiry_status ENUM('New', 'In Progress', 'Responded', 'Converted', 'Cancelled') DEFAULT 'New',
    notes JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (enquiry_status),
    INDEX idx_email (guest_email)
);

-- Contact messages table
CREATE TABLE contact_messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status ENUM('New', 'Read', 'Responded') DEFAULT 'New',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created (created_at)
);

-- Admin users table (for managing enquiries)
CREATE TABLE admin_users (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 3: Verify Connection
```bash
# Test MySQL connection
mysql -u root -p -h localhost -D travel_agency -e "SELECT 1;"
```

---

## <a name="running"></a>Running the Application

### Development Mode

#### Terminal 1: Start Backend Server
```bash
node travel_agency_backend.js
```

Expected output:
```
🚀 majesticholidays.online API Server running on port 5000
Environment: development
```

#### Terminal 2: Serve Frontend
```bash
# Simple HTTP server
npx http-server .

# Or using Python (if installed)
python -m http.server 8000

# Then visit: http://localhost:8000/travel_agency_website.html
```

### Production Mode

Update `.env`:
```
NODE_ENV=production
PORT=80
```

Run with process manager:
```bash
npm install -g pm2

pm2 start travel_agency_backend.js --name "majesticholidays.online-api"
pm2 save
pm2 startup
```

---

## <a name="email"></a>Email Customization

### Custom Email Templates

Edit `travel_agency_backend.js` email functions to customize:

1. **Admin notification** - `sendAdminNotification()` function
2. **Customer confirmation** - `sendCustomerConfirmation()` function
3. **Contact response** - `sendContactFormResponse()` function

### Testing Email Sending

```bash
# Install test tool
npm install -g mailhog

# Run mailhog server (catches all emails locally)
mailhog

# Emails visible at http://localhost:1025
```

---

## <a name="deployment"></a>Deployment

### Option 1: Deploy to Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create travel-ventures-app

# Set environment variables
heroku config:set DB_HOST=your-db-host
heroku config:set DB_USER=your-db-user
heroku config:set EMAIL_USER=your-email@gmail.com

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Option 2: Deploy to AWS/DigitalOcean

1. Create EC2 instance or Droplet
2. Install Node.js and MySQL
3. Clone project repository
4. Install dependencies
5. Configure `.env` file
6. Run with PM2

```bash
# On your server
git clone your-repo-url
cd travel-agency-website
npm install
pm2 start travel_agency_backend.js
```

### Option 3: Deploy to Vercel (Frontend only)

For static frontend hosting:
```bash
npm install -g vercel
vercel deploy
```

Backend should be deployed separately on Node.js hosting.

---

## <a name="troubleshooting"></a>Troubleshooting

### Common Issues & Solutions

#### 1. **"Cannot find module 'express'"**
```bash
# Solution: Install dependencies
npm install
```

#### 2. **"ECONNREFUSED 127.0.0.1:3306"**
```bash
# MySQL connection failed - check:
# 1. MySQL is running
# 2. DB credentials in .env are correct
# 3. Database exists

# Verify MySQL:
mysql -u root -p -e "SELECT 1;"
```

#### 3. **"Error: EMAIL_PASSWORD is undefined"**
```bash
# Solution: Check .env file
cat .env

# Verify variables are set correctly
echo $EMAIL_PASSWORD
```

#### 4. **CORS Error: "No 'Access-Control-Allow-Origin' header"**
```bash
# Already handled in backend with:
app.use(cors());

# If still occurring:
# - Check if backend is running
# - Verify FRONTEND_URL in .env
# - Check browser console for exact error
```

#### 5. **Form submissions not working**
```bash
# Debug steps:
# 1. Open browser console (F12)
# 2. Check for JavaScript errors
# 3. Check Network tab for failed requests
# 4. Verify backend API endpoint in code
# 5. Check backend logs
```

#### 6. **Emails not sending**
```bash
# Troubleshoot:
# 1. Verify EMAIL_USER and EMAIL_PASSWORD in .env
# 2. For Gmail: Check App Password is correct (16 characters)
# 3. Check ADMIN_EMAIL is valid
# 4. Look for error in backend logs
# 5. Test with simpler email first (no special characters)
```

#### 7. **Rate limiting blocking submissions**
```bash
# In backend.js, change limits:
const enquiryLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 10  // Increase from 5 to 10
});
```

### Checking Logs

```bash
# Backend logs
pm2 logs majesticholidays.online-api

# MySQL logs
tail -f /var/log/mysql/error.log

# Email test
npm run test-email
```

---

## 📱 Testing Enquiry Form

### Test Cases

```javascript
// Test Tour Package Enquiry
{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "type": "Tour Package",
    "destination": "Munnar",
    "num_travelers": 4,
    "duration": "3-4 days",
    "travel_date": "2024-07-15",
    "budget": "₹10000-20000"
}

// Test Cab Service
{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+919000000001",
    "type": "Cab Service",
    "pickup_location": "Kozhikode Railway Station",
    "dropoff_location": "Munnar Main Road",
    "num_passengers": 2,
    "travel_date": "2024-06-20",
    "travel_time": "14:30"
}

// Test Bus Booking
{
    "name": "Bob Wilson",
    "email": "bob@example.com",
    "phone": "+919123456789",
    "type": "Bus Booking",
    "departure_city": "Kozhikode",
    "destination_city": "Kochi",
    "num_passengers": 5,
    "travel_date": "2024-06-22"
}
```

### Using Postman

1. Open Postman
2. Create new POST request
3. URL: `http://localhost:5000/api/enquiries`
4. Headers: 
   ```
   Content-Type: application/json
   ```
5. Body (raw JSON): Use test cases above
6. Send and check response

---

## 🔐 Security Checklist

- [ ] Environment variables not committed to git
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] HTTPS enabled (use certbot for SSL)
- [ ] Database passwords are strong
- [ ] Email credentials stored securely
- [ ] No sensitive data in logs
- [ ] CORS properly configured
- [ ] SQL injection prevention (using prepared statements)
- [ ] XSS prevention (input sanitization)

---

## 📞 Customer Contact Information in Website

The website includes contact details:
- **Office**: 123 Tour Street, Kozhikode, Kerala 673001
- **Email**: 
  - General: info@majesticholidays.online.com
  - Enquiries: enquiry@majesticholidays.online.com
  - Support: support@majesticholidays.online.com
- **Phone**:
  - Toll Free: +91-800-123-4567
  - Mobile: +91-9876-543-210
  - Support: +91-9000-000-001
- **Hours**: Mon-Fri 9AM-6PM, Sat 10AM-4PM

**Update these with your actual contact details!**

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Nodemailer Guide](https://nodemailer.com/)
- [REST API Best Practices](https://restfulapi.net/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 🚀 Next Steps

After setup, consider:
1. Add user authentication (JWT)
2. Create admin dashboard
3. Add payment integration (Razorpay)
4. Implement booking system
5. Add WhatsApp notifications
6. Create mobile app
7. Setup analytics (Google Analytics)
8. Add SEO optimization

---

## 📄 License

This project is provided as-is for use by majesticholidays.online.

---

## ✅ Setup Verification Checklist

- [ ] Node.js installed
- [ ] Supabase running
- [ ] Database created
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with all variables
- [ ] Email account configured
- [ ] Backend starts without errors
- [ ] Frontend loads in browser
- [ ] Form submission works
- [ ] Admin email receives notification
- [ ] Customer receives confirmation email
- [ ] Database records are created

Once all items are checked, your website is ready to go live! 🎉

---

**Questions or Issues?** Contact the development team or check the troubleshooting section above.
