const express = require('express');
const cors = require('cors');
const formidable = require('formidable');
const fs = require('fs');
const FormData = require('form-data');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
// Use dynamic import for fetch in CommonJS:
const fetch = (...args) => import('node-fetch// Send Gold Welcome Email
async function sendGoldWelcomeEmail(email, walletAddress, discord) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials not configured in environment variables');
  }

  // Create transporter for this specific email (ensures fresh config)
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: '🥇 Welcome to Gold VIP - NFT Treasury!',
    html: generateGoldEmailHTML(walletAddress, discord)
  };

  const result = await transporter.sendMail(mailOptions);
  return result;
}

// Universal tier-based email sender
async function sendTierWelcomeEmail(email, walletAddress, tier, discord, benefits) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials not configured');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const emailTemplate = generateTierEmailHTML(tier, walletAddress, discord, benefits);
  
  const tierEmojis = { Bronze: '🥉', Silver: '🥈', Gold: '🥇' };
  const tierColors = { Bronze: '#CD7F32', Silver: '#C0C0C0', Gold: '#FFD700' };

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: `${tierEmojis[tier] || '🎉'} Welcome to ${tier} Membership - NFT Treasury!`,
    html: emailTemplate
  };

  const result = await transporter.sendMail(mailOptions);
  return result;
}

// Generate tier-specific email HTML
function generateTierEmailHTML(tier, walletAddress, discord, benefits) {
  const tierEmojis = { Bronze: '🥉', Silver: '🥈', Gold: '🥇' };
  const tierColors = { Bronze: '#CD7F32', Silver: '#C0C0C0', Gold: '#FFD700' };
  const tierGradients = { 
    Bronze: 'linear-gradient(135deg, #CD7F32, #8B4513)',
    Silver: 'linear-gradient(135deg, #C0C0C0, #708090)', 
    Gold: 'linear-gradient(135deg, #FFD700, #FFA500)'
  };

  const benefitsList = Object.keys(benefits).map(key => {
    const benefitName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    return `<li style="margin: 0.5rem 0; color: #ffffff;">${benefitName}</li>`;
  }).join('');

  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: linear-gradient(135deg, #000, #1a1a1a); color: white; border-radius: 20px; overflow: hidden;">
      <!-- Header -->
      <div style="background: ${tierGradients[tier]}; padding: 2rem; text-align: center;">
        <h1 style="margin: 0; color: black; font-size: 2rem;">${tierEmojis[tier]} Welcome to ${tier} Membership!</h1>
        <p style="margin: 0.5rem 0 0 0; color: black; font-size: 1.2rem;">NFT Treasury ${tier} Benefits</p>
      </div>
      
      <!-- Main Content -->
      <div style="padding: 2rem;">
        <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">Congratulations! Your ${tier} membership has been activated instantly via our webhook system.</p>
        
        <!-- Account Details -->
        <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0;">
          <h3 style="color: ${tierColors[tier]}; margin-top: 0;">Account Information</h3>
          <p><strong>Wallet Address:</strong> ${walletAddress}</p>
          <p><strong>Discord:</strong> ${discord?.username || 'Not Connected'}</p>
          <p><strong>Membership Tier:</strong> ${tier}</p>
          <p><strong>Activated:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <!-- Benefits -->
        <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0;">
          <h3 style="color: ${tierColors[tier]}; margin-top: 0;">${tier} Membership Benefits</h3>
          <ul style="padding-left: 1.5rem;">
            ${benefitsList}
          </ul>
        </div>
        
        <!-- CTA -->
        <div style="text-align: center; margin: 2rem 0;">
          <a href="http://localhost:5173" style="background: ${tierGradients[tier]}; color: black; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            Access Your ${tier} Dashboard
          </a>
        </div>
        
        <!-- Footer -->
        <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 1.5rem; margin-top: 2rem; text-align: center; color: #aaa;">
          <p>Welcome to the NFT Treasury ${tier} community!</p>
          <p>If you have any questions, reply to this email or join our Discord.</p>
        </div>
      </div>
    </div>
  `;
}

// Generate Gold-specific email HTML (keeping for backward compatibility)
function generateGoldEmailHTML(walletAddress, discord) {
  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: linear-gradient(135deg, #000, #1a1a1a); color: white; border-radius: 20px; overflow: hidden;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 2rem; text-align: center;">
        <h1 style="margin: 0; color: black; font-size: 2rem;">👑 Welcome to Gold VIP!</h1>
        <p style="margin: 0.5rem 0 0 0; color: black; font-size: 1.2rem;">NFT Treasury Premium Membership</p>
      </div>
      
      <!-- Main Content -->
      <div style="padding: 2rem;">
        <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">Congratulations! Your Gold membership has been activated instantly via our webhook system.</p>
        
        <!-- Account Details -->
        <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0;">
          <h3 style="color: #FFD700; margin-top: 0;">🏆 Gold VIP Account</h3>
          <p><strong>Wallet Address:</strong> ${walletAddress}</p>
          <p><strong>Discord:</strong> ${discord?.username || 'Not Connected'}</p>
          <p><strong>Membership Level:</strong> Gold VIP</p>
          <p><strong>Activated:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <!-- Benefits -->
        <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0;">
          <h3 style="color: #FFD700; margin-top: 0;">🌟 Your Gold VIP Benefits</h3>
          <ul style="padding-left: 1.5rem;">
            <li style="margin: 0.5rem 0; color: #ffffff;">🎨 Exclusive NFT Collections</li>
            <li style="margin: 0.5rem 0; color: #ffffff;">📊 Premium Analytics Dashboard</li>
            <li style="margin: 0.5rem 0; color: #ffffff;">🎫 VIP Access to Events</li>
            <li style="margin: 0.5rem 0; color: #ffffff;">🎁 100 Bonus Tokens</li>
            <li style="margin: 0.5rem 0; color: #ffffff;">📈 Personalized Portfolio</li>
            <li style="margin: 0.5rem 0; color: #ffffff;">🚀 Early Access to New Features</li>
            <li style="margin: 0.5rem 0; color: #ffffff;">⭐ VIP Customer Support</li>
          </ul>
        </div>
        
        <!-- CTA -->
        <div style="text-align: center; margin: 2rem 0;">
          <a href="http://localhost:5173" style="background: linear-gradient(135deg, #FFD700, #FFA500); color: black; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            Access Your Gold Dashboard
          </a>
        </div>
        
        <!-- Footer -->
        <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 1.5rem; margin-top: 2rem; text-align: center; color: #aaa;">
          <p>Welcome to the Gold VIP community!</p>
          <p>If you have any questions, reply to this email or join our Discord.</p>
        </div>
      </div>
    </div>
  `;
}
require('dotenv').config();

const app = express();
const PORT = 3001;

// Email configuration
const emailTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Enable CORS for all origins (or restrict to your frontend origin)
app.use(cors()); // or: app.use(cors({ origin: 'https://localhost:5173' }));

// Pinata file upload endpoint
app.post('/api/pinata-upload', (req, res) => {
  const form = new formidable.IncomingForm({ maxFileSize: 10 * 1024 * 1024 });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Formidable error:', err);
      return res.status(400).json({ error: err.message });
    }
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      console.error('No file provided');
      return res.status(400).json({ error: 'No file provided' });
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.filepath), file.originalFilename);

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PINATA_JWT}`,
          ...formData.getHeaders(),
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Pinata error:', data);
        return res.status(500).json({ error: data.error || 'Failed to upload to Pinata' });
      }

      fs.unlinkSync(file.filepath);
      res.status(200).json(data);
    } catch (e) {
      console.error('Fetch error:', e);
      res.status(500).json({ error: e.message });
    }
  });
});

// Pinata metadata upload endpoint
app.use(express.json());
app.post('/api/pinata-metadata', async (req, res) => {
  const metadata = req.body;
  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: { name: `${metadata.name}-metadata.json` },
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Pinata metadata error:', data);
      return res.status(500).json({ error: data.error || 'Failed to upload metadata to Pinata' });
    }
    res.status(200).json(data);
  } catch (e) {
    console.error('Metadata fetch error:', e);
    res.status(500).json({ error: e.message });
  }
});

// BitBadges Webhook Handler for All Membership Tiers
app.post('/api/bitbadges-webhook', express.json(), async (req, res) => {
  try {
    const { 
      pluginSecret,
      claimId,
      claimAttemptId,
      ethAddress,
      bitbadgesAddress,
      email,
      discord,
      _attemptStatus,
      _isSimulation,
      badgeId,
      collectionId
    } = req.body;

    // Verify webhook authenticity
    const expectedSecret = process.env.BITBADGES_WEBHOOK_SECRET;
    if (expectedSecret && pluginSecret !== expectedSecret) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }

    console.log('🎉 BitBadges Webhook Received:', {
      claimId,
      claimAttemptId,
      ethAddress,
      badgeId,
      collectionId,
      attemptStatus: _attemptStatus,
      isSimulation: _isSimulation
    });

    // Check if this is a successful claim (not simulation)
    const isSuccessfulClaim = _attemptStatus === 'success' && !_isSimulation;
    
    if (isSuccessfulClaim && ethAddress) {
      // Determine membership tier from badge/collection info
      let tier = 'Bronze'; // Default
      
      if (badgeId?.toLowerCase().includes('gold') || collectionId?.toLowerCase().includes('gold')) {
        tier = 'Gold';
      } else if (badgeId?.toLowerCase().includes('silver') || collectionId?.toLowerCase().includes('silver')) {
        tier = 'Silver';
      } else if (badgeId?.toLowerCase().includes('bronze') || collectionId?.toLowerCase().includes('bronze')) {
        tier = 'Bronze';
      }
      
      console.log(`🏆 ${tier} membership claimed by:`, ethAddress);
      
      // Trigger tier-specific benefits
      await handleMembershipClaim({
        userAddress: ethAddress,
        tier,
        claimId,
        claimAttemptId,
        email,
        discord,
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully',
      benefits: isSuccessfulClaim ? `${tier || 'Membership'} tier benefits activated` : 'No benefits activated (simulation or failed claim)'
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Gold Membership Benefits Handler
async function handleGoldMembershipClaim({ userAddress, claimId, claimAttemptId, email, discord, timestamp }) {
  const goldBenefits = {
    userAddress,
    claimId,
    claimAttemptId,
    email,
    discord,
    timestamp,
    benefits: {
      exclusiveNFTs: true,
      premiumAnalytics: true,
      vipAccess: true,
      bonusTokens: 100,
      personalizedPortfolio: true,
      exclusiveEvents: true,
      earlyAccess: true
    }
  };

  // Store in memory (in production, use a database)
  if (!global.goldMembers) {
    global.goldMembers = new Map();
  }
  
  global.goldMembers.set(userAddress.toLowerCase(), goldBenefits);
  
  console.log('✨ Gold benefits activated for:', userAddress);
  console.log('📧 Email:', email);
  console.log('🎮 Discord:', discord?.username);
  
  // Send welcome email if email is configured
  console.log('🔍 Email config check:', {
    email,
    hasEmailUser: !!process.env.EMAIL_USER,
    hasEmailPass: !!process.env.EMAIL_PASS,
    emailUser: process.env.EMAIL_USER
  });
  
  if (email && email !== 'your-email@example.com') {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await sendGoldWelcomeEmail(email, userAddress, discord);
        console.log('📬 Welcome email sent successfully to:', email);
      } catch (emailError) {
        console.log('❌ Failed to send email:', emailError.message);
        console.log('� If Gmail error, you need App Password not regular password');
        console.log('�📧 Visit: https://myaccount.google.com/apppasswords');
        
        // Show email preview instead
        console.log('🎨 Email preview that would be sent:');
        console.log(`
        📧 TO: ${email}
        📧 SUBJECT: 🥇 Welcome to Gold VIP - NFT Treasury!
        📧 CONTENT: HTML welcome email with:
           - Gold VIP welcome message
           - Wallet: ${userAddress}
           - Discord: ${discord?.username || 'N/A'}
           - All Gold tier benefits listed
           - Link to dashboard
        `);
      }
    } else {
      console.log('⚠️ Email credentials not configured in environment variables');
      console.log('💡 Add EMAIL_USER and EMAIL_PASS to .env file');
    }
  } else {
    console.log('📝 Email not sent - using example email or no email provided');
  }
  
  // Here you could trigger additional actions:
  // - Add Discord role for: discord.id
  // - Create personalized investment report
  // - Mint exclusive NFTs to: userAddress
  // - Generate access codes for events
  
  return goldBenefits;
}

// Universal Membership Benefits Handler
async function handleMembershipClaim({ userAddress, tier, claimId, claimAttemptId, email, discord, timestamp }) {
  const tierBenefits = getTierBenefits(tier);
  
  const membershipData = {
    userAddress,
    tier,
    claimId,
    claimAttemptId,
    email,
    discord,
    timestamp,
    benefits: tierBenefits
  };

  // Store membership data
  if (!global.members) {
    global.members = new Map();
  }
  
  // Store by address and tier
  const existingData = global.members.get(userAddress.toLowerCase()) || {};
  existingData[tier] = membershipData;
  global.members.set(userAddress.toLowerCase(), existingData);
  
  console.log(`✨ ${tier} benefits activated for:`, userAddress);
  console.log('📧 Email:', email);
  console.log('🎮 Discord:', discord?.username);
  
  // Send tier-specific welcome email
  if (email && email !== 'your-email@example.com') {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await sendTierWelcomeEmail(email, userAddress, tier, discord, tierBenefits);
        console.log(`📬 ${tier} welcome email sent successfully to:`, email);
      } catch (emailError) {
        console.log('❌ Failed to send email:', emailError.message);
        console.log('💡 If Gmail error, check your App Password');
        
        // Show email preview
        console.log(`🎨 ${tier} Email preview that would be sent:`, {
          to: email,
          subject: `🎉 Welcome to ${tier} Membership - NFT Treasury!`,
          tier,
          benefits: Object.keys(tierBenefits).length
        });
      }
    } else {
      console.log('⚠️ Email credentials not configured');
    }
  }
  
  return membershipData;
}

// Get tier-specific benefits
function getTierBenefits(tier) {
  const benefits = {
    Bronze: {
      basicAccess: true,
      communityChat: true,
      monthlyReports: true,
      standardSupport: true
    },
    Silver: {
      basicAccess: true,
      communityChat: true,
      monthlyReports: true,
      standardSupport: true,
      discordAccess: true,
      priorityMinting: true,
      weeklyAnalytics: true,
      premiumSupport: true,
      bonusTokens: 50
    },
    Gold: {
      basicAccess: true,
      communityChat: true,
      monthlyReports: true,
      standardSupport: true,
      discordAccess: true,
      priorityMinting: true,
      weeklyAnalytics: true,
      premiumSupport: true,
      exclusiveNFTs: true,
      premiumAnalytics: true,
      vipAccess: true,
      bonusTokens: 100,
      personalizedPortfolio: true,
      exclusiveEvents: true,
      earlyAccess: true,
      vipSupport: true
    }
  };
  
  return benefits[tier] || benefits.Bronze;
}

// Send Gold Welcome Email
async function sendGoldWelcomeEmail(email, walletAddress, discord) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials not configured in environment variables');
  }

  // Create transporter for this specific email (ensures fresh config)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: '🥇 Welcome to Gold VIP - NFT Treasury!',
    html: `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: linear-gradient(135deg, #000, #1a1a1a); color: white; border-radius: 20px; overflow: hidden;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 2rem; text-align: center;">
        <h1 style="margin: 0; color: black; font-size: 2rem;">👑 Welcome to Gold VIP!</h1>
        <p style="margin: 0.5rem 0 0 0; color: black; font-size: 1.2rem;">NFT Treasury Premium Membership</p>
      </div>
      
      <!-- Main Content -->
      <div style="padding: 2rem;">
        <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">Congratulations! Your Gold membership has been activated instantly via our webhook system.</p>
        
        <!-- Wallet Info -->
        <div style="background: rgba(255,215,0,0.1); border: 1px solid rgba(255,215,0,0.3); border-radius: 10px; padding: 1rem; margin: 1rem 0;">
          <h3 style="color: #FFD700; margin-top: 0;">📍 Your Details:</h3>
          <p><strong>Wallet:</strong> ${walletAddress}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${discord?.username ? `<p><strong>Discord:</strong> ${discord.username}</p>` : ''}
        </div>
        
        <!-- Benefits -->
        <h3 style="color: #FFD700;">🎯 Your Gold VIP Benefits:</h3>
        <div style="display: grid; gap: 1rem; margin: 1rem 0;">
          <div style="background: rgba(255,215,0,0.05); border-left: 4px solid #FFD700; padding: 1rem;">
            <strong>🎨 Exclusive NFTs</strong><br>
            Access to premium, limited-edition NFT drops
          </div>
          <div style="background: rgba(255,215,0,0.05); border-left: 4px solid #FFD700; padding: 1rem;">
            <strong>📊 Premium Analytics</strong><br>
            Real-time market insights and personalized reports
          </div>
          <div style="background: rgba(255,215,0,0.05); border-left: 4px solid #FFD700; padding: 1rem;">
            <strong>🪙 100 Bonus Tokens</strong><br>
            Instantly credited to your account
          </div>
          <div style="background: rgba(255,215,0,0.05); border-left: 4px solid #FFD700; padding: 1rem;">
            <strong>🎪 VIP Events</strong><br>
            Exclusive Gold-only events and private meetups
          </div>
          <div style="background: rgba(255,215,0,0.05); border-left: 4px solid #FFD700; padding: 1rem;">
            <strong>🚀 Early Access</strong><br>
            First access to new features and beta testing
          </div>
        </div>
        
        <!-- CTA -->
        <div style="text-align: center; margin: 2rem 0;">
          <a href="http://localhost:5174/" style="display: inline-block; background: linear-gradient(135deg, #FFD700, #FFA500); color: black; padding: 1rem 2rem; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 1.1rem;">
            🎯 Access Your VIP Dashboard
          </a>
        </div>
        
        <!-- Footer -->
        <div style="border-top: 1px solid rgba(255,215,0,0.3); padding-top: 1rem; margin-top: 2rem; text-align: center; color: #888; font-size: 0.9rem;">
          <p>This email was triggered automatically by BitBadges webhook integration</p>
          <p>NFT Treasury - Premium Web3 Membership System</p>
        </div>
      </div>
    </div>
    `
  };

  console.log('📧 Attempting to send email with config:', {
    service: 'gmail',
    user: process.env.EMAIL_USER,
    to: email,
    subject: mailOptions.subject
  });

  const result = await transporter.sendMail(mailOptions);
  return result;
}

// API endpoint to check Gold benefits
app.get('/api/gold-benefits/:address', (req, res) => {
  const { address } = req.params;
  
  if (!global.goldMembers) {
    return res.json({ hasGoldBenefits: false });
  }
  
  const benefits = global.goldMembers.get(address.toLowerCase());
  
  if (benefits) {
    res.json({
      hasGoldBenefits: true,
      benefits: benefits.benefits,
      claimedAt: benefits.timestamp
    });
  } else {
    res.json({ hasGoldBenefits: false });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));