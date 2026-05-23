/**
 * Travel Agency - Backend API Handler
 * Handles enquiry submissions, email notifications, and contact form submissions
 * 
 * Technology: Node.js + Express
 * Email Service: Nodemailer / SendGrid
 * Database: MySQL
 */

const express = require('express');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');
const validator = require('validator');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE SETUP
// ============================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Rate limiting - prevent spam submissions
const enquiryLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 enquiries per IP
    message: 'Too many enquiries sent. Please try again later.'
});

// ============================================
// EMAIL CONFIGURATION
// ============================================

const emailTransporter = nodemailer.createTransport({
    service: 'gmail', // Or use SendGrid, Mailgun, etc.
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Alternative: Using SendGrid
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ============================================
// DATABASE CONNECTION POOL
// ============================================

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'travel_agency',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate enquiry data
 */
function validateEnquiryData(data) {
    const errors = {};

    if (!data.name || data.name.trim().length < 2) {
        errors.name = 'Name is required (minimum 2 characters)';
    }

    if (!validator.isEmail(data.email)) {
        errors.email = 'Valid email is required';
    }

    if (!validator.isMobilePhone(data.phone, 'en-IN')) {
        errors.phone = 'Valid Indian phone number is required';
    }

    if (!data.type || !['Tour Package', 'Cab Service', 'Bus Booking'].includes(data.type)) {
        errors.type = 'Valid service type is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
}

/**
 * Send Email Notification to Admin
 */
async function sendAdminNotification(enquiryData) {
    const htmlContent = `
        <h2>New ${enquiryData.type} Enquiry Received</h2>
        
        <h3>Customer Details:</h3>
        <ul>
            <li><strong>Name:</strong> ${enquiryData.name}</li>
            <li><strong>Email:</strong> ${enquiryData.email}</li>
            <li><strong>Phone:</strong> ${enquiryData.phone}</li>
            <li><strong>Submitted At:</strong> ${new Date(enquiryData.submitted_at).toLocaleString()}</li>
        </ul>

        ${enquiryData.type === 'Tour Package' ? `
        <h3>Tour Details:</h3>
        <ul>
            <li><strong>Destination:</strong> ${enquiryData.destination}</li>
            <li><strong>Number of Travelers:</strong> ${enquiryData.num_travelers}</li>
            <li><strong>Duration:</strong> ${enquiryData.duration}</li>
            <li><strong>Travel Date:</strong> ${enquiryData.travel_date}</li>
            <li><strong>Budget:</strong> ${enquiryData.budget}</li>
            ${enquiryData.special_requests ? `<li><strong>Special Requests:</strong> ${enquiryData.special_requests}</li>` : ''}
        </ul>
        ` : ''}

        ${enquiryData.type === 'Cab Service' ? `
        <h3>Cab Service Details:</h3>
        <ul>
            <li><strong>Pickup Location:</strong> ${enquiryData.pickup_location}</li>
            <li><strong>Drop Location:</strong> ${enquiryData.dropoff_location}</li>
            <li><strong>Number of Passengers:</strong> ${enquiryData.num_passengers}</li>
            <li><strong>Travel Date:</strong> ${enquiryData.travel_date}</li>
            <li><strong>Travel Time:</strong> ${enquiryData.travel_time}</li>
            <li><strong>Vehicle Type:</strong> ${enquiryData.vehicle_type || 'Any'}</li>
            ${enquiryData.special_requests ? `<li><strong>Special Requests:</strong> ${enquiryData.special_requests}</li>` : ''}
        </ul>
        ` : ''}

        ${enquiryData.type === 'Bus Booking' ? `
        <h3>Bus Booking Details:</h3>
        <ul>
            <li><strong>From:</strong> ${enquiryData.departure_city}</li>
            <li><strong>To:</strong> ${enquiryData.destination_city}</li>
            <li><strong>Number of Passengers:</strong> ${enquiryData.num_passengers}</li>
            <li><strong>Travel Date:</strong> ${enquiryData.travel_date}</li>
            ${enquiryData.return_date ? `<li><strong>Return Date:</strong> ${enquiryData.return_date}</li>` : ''}
            <li><strong>Bus Type:</strong> ${enquiryData.bus_type || 'Any'}</li>
            ${enquiryData.special_requests ? `<li><strong>Special Requests:</strong> ${enquiryData.special_requests}</li>` : ''}
        </ul>
        ` : ''}

        <hr>
        <p style="color: #666; font-size: 12px;">
            This is an automated notification from Majestic Holidays Enquiry System.
        </p>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `New ${enquiryData.type} Enquiry - ${enquiryData.name}`,
        html: htmlContent
    };

    try {
        await emailTransporter.sendMail(mailOptions);
        console.log('Admin notification sent');
    } catch (error) {
        console.error('Error sending admin email:', error);
        throw error;
    }
}

/**
 * Send Confirmation Email to Customer
 */
async function sendCustomerConfirmation(enquiryData, enquiryId) {
    const htmlContent = `
        <h2>Thank You for Your Enquiry!</h2>
        
        <p>Dear ${enquiryData.name},</p>

        <p>We have received your ${enquiryData.type.toLowerCase()} enquiry and will review it shortly.</p>

        <p><strong>Your Enquiry Reference Number:</strong> ${enquiryId}</p>

        <h3>What happens next?</h3>
        <ol>
            <li>Our team will review your enquiry within 2-4 business hours</li>
            <li>We will contact you via phone or email with the best available options</li>
            <li>You can also check your enquiry status using your reference number</li>
        </ol>

        <h3>Your Enquiry Details:</h3>
        <p><strong>Service Type:</strong> ${enquiryData.type}<br>
        <strong>Submitted On:</strong> ${new Date(enquiryData.submitted_at).toLocaleString()}</p>

        <hr>

        <h3>Contact Information</h3>
        <p>
            If you need to reach us:<br>
            <strong>Email:</strong> enquiry@Majestic Holidays.com<br>
            <strong>Phone:</strong> +91-9876543210<br>
            <strong>WhatsApp:</strong> +91-9000000001<br>
            <strong>Working Hours:</strong> Monday - Saturday, 9:00 AM - 6:00 PM
        </p>

        <hr>

        <p>Best regards,<br>
        <strong>Majestic Holidays Team</strong><br>
        Making your travel dreams come true!</p>

        <p style="color: #999; font-size: 12px;">
            Please do not reply to this email. Use the contact information above instead.
        </p>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: enquiryData.email,
        subject: `Enquiry Confirmation - Reference: ${enquiryId}`,
        html: htmlContent
    };

    try {
        await emailTransporter.sendMail(mailOptions);
        console.log('Customer confirmation sent');
    } catch (error) {
        console.error('Error sending customer email:', error);
        throw error;
    }
}

/**
 * Send Contact Form Response Email
 */
async function sendContactFormResponse(contactData) {
    const htmlContent = `
        <h2>We Received Your Message</h2>
        
        <p>Dear ${contactData.name},</p>

        <p>Thank you for reaching out to Majestic Holidays. We have received your message and will respond as soon as possible.</p>

        <p><strong>Your Message Subject:</strong> ${contactData.subject}</p>

        <p>Our team typically responds to messages within 24 business hours. If your matter is urgent, 
        please feel free to call us directly at <strong>+91-9876543210</strong>.</p>

        <hr>

        <h3>Our Contact Details</h3>
        <p>
            <strong>Email:</strong> info@Majestic Holidays.com<br>
            <strong>Phone:</strong> +91-9876543210<br>
            <strong>WhatsApp:</strong> +91-9000000001<br>
            <strong>Office Address:</strong> 123 Tour Street, Kozhikode, Kerala 673001<br>
            <strong>Working Hours:</strong> Monday - Saturday, 9:00 AM - 6:00 PM
        </p>

        <hr>

        <p>Best regards,<br>
        <strong>Majestic Holidays Team</strong></p>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: contactData.email,
        subject: 'We Received Your Message - Majestic Holidays',
        html: htmlContent
    };

    try {
        await emailTransporter.sendMail(mailOptions);
        console.log('Contact form response sent');
    } catch (error) {
        console.error('Error sending contact response email:', error);
        // Don't throw - we want to save the contact form even if email fails
    }
}

// ============================================
// API ENDPOINTS
// ============================================

/**
 * POST /api/enquiries
 * Submit a new travel enquiry
 */
app.post('/api/enquiries', enquiryLimiter, async (req, res) => {
    try {
        const enquiryData = req.body;

        // Validate input
        const validation = validateEnquiryData(enquiryData);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                errors: validation.errors
            });
        }

        // Get database connection
        const connection = await pool.getConnection();

        try {
            // Insert enquiry into database
            const [result] = await connection.execute(
                `INSERT INTO enquiries 
                (guest_name, guest_email, guest_phone, service_type, enquiry_status, created_at, notes)
                VALUES (?, ?, ?, ?, 'New', NOW(), ?)`,
                [
                    enquiryData.name,
                    enquiryData.email,
                    enquiryData.phone,
                    enquiryData.type,
                    JSON.stringify({
                        destination: enquiryData.destination,
                        num_travelers: enquiryData.num_travelers,
                        duration: enquiryData.duration,
                        travel_date: enquiryData.travel_date,
                        budget: enquiryData.budget,
                        pickup_location: enquiryData.pickup_location,
                        dropoff_location: enquiryData.dropoff_location,
                        travel_time: enquiryData.travel_time,
                        vehicle_type: enquiryData.vehicle_type,
                        departure_city: enquiryData.departure_city,
                        destination_city: enquiryData.destination_city,
                        return_date: enquiryData.return_date,
                        bus_type: enquiryData.bus_type,
                        special_requests: enquiryData.special_requests
                    })
                ]
            );

            const enquiryId = `TRV${Date.now()}${result.insertId}`;

            // Send emails
            await Promise.all([
                sendAdminNotification(enquiryData),
                sendCustomerConfirmation(enquiryData, enquiryId)
            ]);

            // Return success response
            res.status(201).json({
                success: true,
                message: 'Enquiry submitted successfully',
                enquiryId: enquiryId,
                data: {
                    id: result.insertId,
                    reference: enquiryId,
                    email: enquiryData.email,
                    phone: enquiryData.phone
                }
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Enquiry submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing your enquiry. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * POST /api/contact
 * Submit a contact form message
 */
app.post('/api/contact', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3
}), async (req, res) => {
    try {
        const contactData = req.body;

        // Validation
        if (!contactData.name || contactData.name.trim().length < 2) {
            return res.status(400).json({ success: false, message: 'Valid name required' });
        }

        if (!validator.isEmail(contactData.email)) {
            return res.status(400).json({ success: false, message: 'Valid email required' });
        }

        if (!contactData.message || contactData.message.trim().length < 10) {
            return res.status(400).json({ success: false, message: 'Message must be at least 10 characters' });
        }

        // Get database connection
        const connection = await pool.getConnection();

        try {
            // Save contact message to database
            await connection.execute(
                `INSERT INTO contact_messages (name, email, phone, subject, message, created_at)
                 VALUES (?, ?, ?, ?, ?, NOW())`,
                [
                    contactData.name,
                    contactData.email,
                    contactData.phone || null,
                    contactData.subject || 'General Enquiry',
                    contactData.message
                ]
            );

            // Send confirmation email
            await sendContactFormResponse(contactData);

            res.status(201).json({
                success: true,
                message: 'Your message has been sent successfully'
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting your message. Please try again.'
        });
    }
});

/**
 * GET /api/enquiries/:enquiryId
 * Get enquiry details (for tracking)
 */
app.get('/api/enquiries/:enquiryId', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            const [rows] = await connection.execute(
                'SELECT * FROM enquiries WHERE enquiry_id = ? LIMIT 1',
                [req.params.enquiryId]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Enquiry not found'
                });
            }

            res.json({
                success: true,
                data: rows[0]
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error fetching enquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching enquiry details'
        });
    }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Majestic Holidays API',
        version: '1.0.0'
    });
});

/**
 * GET /
 * Serve the website homepage
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'travel_agency_website.html'));
});

/**
 * 404 Handler
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

/**
 * Error Handler
 */
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`🚀 Majestic Holidays API Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await pool.end();
    process.exit(0);
});

module.exports = app;
