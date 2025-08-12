const express = require('express');
const cors = require('cors');
const formidable = require('formidable');
const fs = require('fs');
const FormData = require('form-data');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
// Use dynamic import for fetch in CommonJS:
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

require('dotenv').config();

const app = express();
const PORT = 3001;

// Email configuration
const emailTransporter = nodemailer.createTransporter({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// BitBadges webhook endpoint
app.post('/api/bitbadges-webhook', express.json(), (req, res) => {
  console.log('🎣 BitBadges webhook received!');
  console.log('📦 Full payload:', JSON.stringify(req.body, null, 2));

  try {
    const {
      claimId,
      claimAttemptId,
      attemptStatus: _attemptStatus,
      isSimulation: _isSimulation,
      address: ethAddress,
      badgeId,
      collectionId,
      metadata
    } = req.body;

    // Extract user information
    const email = metadata?.email || 'your-email@example.com';
    const discord = metadata?.discord || null;

    console.log('🔍 Processing claim:', {
      claimId,
      claimAttemptId,
      status: _attemptStatus,
      simulation: _isSimulation,
      ethAddress,
      badgeId,
      collectionId,
      email,
      discord: discord?.username
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
      handleMembershipClaim({
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

// Universal tier-based email sender
async function sendTierWelcomeEmail(email, walletAddress, tier, discord, benefits) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials not configured');
  }

  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const emailTemplate = generateTierEmailHTML(tier, walletAddress, discord, benefits);
  
  const tierEmojis = { Bronze: '🥉', Silver: '🥈', Gold: '🥇' };

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

// Legacy Gold benefits handler (for backward compatibility)
async function handleGoldMembershipClaim({ userAddress, claimId, claimAttemptId, email, discord, timestamp }) {
  return handleMembershipClaim({
    userAddress,
    tier: 'Gold',
    claimId,
    claimAttemptId,
    email,
    discord,
    timestamp
  });
}

// API endpoint to check membership benefits
app.get('/api/membership-benefits/:address', (req, res) => {
  const { address } = req.params;
  
  if (!global.members) {
    return res.json({ hasMembership: false });
  }
  
  const memberData = global.members.get(address.toLowerCase());
  
  if (memberData) {
    res.json({
      hasMembership: true,
      tiers: Object.keys(memberData),
      membershipData: memberData
    });
  } else {
    res.json({ hasMembership: false });
  }
});

// Legacy API endpoint for Gold benefits (backward compatibility)
app.get('/api/gold-benefits/:address', (req, res) => {
  const { address } = req.params;
  
  if (!global.members) {
    return res.json({ hasGoldBenefits: false });
  }
  
  const memberData = global.members.get(address.toLowerCase());
  const goldData = memberData?.Gold;
  
  if (goldData) {
    res.json({
      hasGoldBenefits: true,
      benefits: goldData.benefits,
      claimedAt: goldData.timestamp
    });
  } else {
    res.json({ hasGoldBenefits: false });
  }
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  const { email, tier = 'Gold' } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    const testBenefits = getTierBenefits(tier);
    await sendTierWelcomeEmail(email, '0x1234...test', tier, { username: 'TestUser' }, testBenefits);
    res.json({ success: true, message: `Test ${tier} email sent successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
