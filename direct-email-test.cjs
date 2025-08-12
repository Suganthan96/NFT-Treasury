// Direct email test script
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('🧪 Direct Email Test');
  console.log('📧 Email config check:');
  console.log('- EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
  console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET (App Password)' : 'NOT SET');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Missing email credentials in .env file');
    console.log('💡 Make sure you have:');
    console.log('   EMAIL_USER=suganthan.27it@licet.ac.in');
    console.log('   EMAIL_PASS=rlgh xdad hqbp upvb');
    return;
  }
  
  try {
    console.log('🔄 Creating transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('✅ Transporter created');
    console.log('📤 Sending test email...');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'suganthan.27it@licet.ac.in',
      subject: '🥇 Email Test - NFT Treasury Gold Membership!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: linear-gradient(135deg, #000, #1a1a1a); color: white; border-radius: 20px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 2rem; text-align: center;">
            <h1 style="margin: 0; color: black; font-size: 2rem;">🥇 Email Test Successful!</h1>
            <p style="margin: 0.5rem 0 0 0; color: black; font-size: 1.2rem;">NFT Treasury Email System Working</p>
          </div>
          
          <div style="padding: 2rem;">
            <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">Great news! Your email system is working perfectly.</p>
            
            <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0;">
              <h3 style="color: #FFD700; margin-top: 0;">✅ Test Results</h3>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Status:</strong> Email delivery successful</p>
              <p><strong>Gmail App Password:</strong> Working</p>
            </div>
            
            <div style="text-align: center; margin: 2rem 0;">
              <p style="color: #4CAF50; font-size: 1.2rem;">🎉 Your membership emails will work perfectly!</p>
            </div>
            
            <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 1.5rem; margin-top: 2rem; text-align: center; color: #aaa;">
              <p>NFT Treasury Email System - Test Complete</p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('💡 Check your inbox (and spam folder) for the test email');
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('💡 Gmail Authentication Issue:');
      console.log('   1. Make sure you\'re using Gmail App Password, not regular password');
      console.log('   2. Visit: https://myaccount.google.com/apppasswords');
      console.log('   3. Generate new App Password for "Mail"');
      console.log('   4. Update .env file with the new App Password');
    }
    
    if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('💡 Network Issue:');
      console.log('   - Check your internet connection');
      console.log('   - Try again in a few moments');
    }
  }
}

testEmail().catch(console.error);
