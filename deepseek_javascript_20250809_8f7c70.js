// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Lead Model
const Lead = mongoose.model('Lead', new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    business: String,
    industry: String,
    services: [String],
    details: String,
    createdAt: { type: Date, default: Date.now }
}));

// Email Transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// API Routes
app.post('/api/register', async (req, res) => {
    try {
        const lead = new Lead(req.body);
        await lead.save();
        
        // Send confirmation email to client
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: req.body.email,
            subject: 'Thanks for contacting GMM Agency',
            html: `<p>Hi ${req.body.name},</p>
                  <p>We've received your request and will contact you shortly.</p>
                  <p>You can schedule a call directly here: <a href="${process.env.BASE_URL}/schedule-call">Schedule Call</a></p>`
        });
        
        // Notification email to admin
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: 'New Lead Registration',
            html: `<p>New lead from ${req.body.name} (${req.body.business})</p>
                  <p>Services needed: ${req.body.services.join(', ')}</p>
                  <p>Details: ${req.body.details}</p>`
        });
        
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Schedule Call Route
app.get('/schedule-call', (req, res) => {
    // This would redirect to your Calendly/Google Calendar integration
    res.redirect(process.env.CALENDLY_LINK);
});

// Admin Dashboard Routes
app.get('/api/leads', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));