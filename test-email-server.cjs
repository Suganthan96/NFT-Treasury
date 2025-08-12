// Simple test server just for email testing
const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());

// Test email endpoint
app.post('/test-email', async (req, res) => {
  console.log('🧪 Testing email system...');
  
  const { email = 'suganthan.27it@licet.ac.in', tier = 'Gold' } = req.body;
  
  console.log('📧 Email config:', {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS ? '****' : 'NOT SET'
  });
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const tierEmojis = { Bronze: '🥉', Silver: '🥈', Gold: '🥇' };
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${tierEmojis[tier]} Test Email - ${tier} Membership!`,
      html: `
        <div style="padding: 20px; font-family: Arial;">
          <h1>${tierEmojis[tier]} ${tier} Membership Test</h1>
          <p>This is a test email from NFT Treasury!</p>
          <p><strong>Tier:</strong> ${tier}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p style="color: green;">✅ Email system is working!</p>
        </div>
      `
    };

    console.log('📤 Sending email...');
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', result.messageId);
    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: result.messageId 
    });
    
  } catch (error) {
    console.error('❌ Email error:', error.message);
    res.status(500).json({ 
      error: error.message,
      details: 'Check your Gmail App Password in .env file'
    });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🧪 Test server running on http://localhost:${PORT}`);
  console.log('📧 Test the email with: POST /test-email');
});
