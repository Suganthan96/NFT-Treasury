const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const formidable = require('formidable');
const fs = require('fs');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pinata upload endpoint
app.post('/api/pinata-upload', (req, res) => {
  const form = new formidable.IncomingForm({ multiples: true });
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Formidable error:', err);
      return res.status(500).json({ error: 'File parsing failed' });
    }

    try {
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log('📤 Uploading to Pinata:', file.originalFilename);

      const formData = new FormData();
      formData.append('file', fs.createReadStream(file.filepath), file.originalFilename);

      const pinataRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PINATA_JWT}`,
          ...formData.getHeaders()
        },
        body: formData
      });

      if (!pinataRes.ok) {
        const errorData = await pinataRes.text();
        console.error('❌ Pinata error:', errorData);
        throw new Error(`Pinata upload failed: ${pinataRes.statusText}`);
      }

      const result = await pinataRes.json();
      console.log('✅ Upload successful:', result.IpfsHash);
      res.json(result);

    } catch (uploadError) {
      console.error('❌ Upload error:', uploadError.message);
      res.status(500).json({ error: uploadError.message });
    }
  });
});

// Pinata metadata upload endpoint
app.post('/api/pinata-metadata', async (req, res) => {
  try {
    console.log('📝 Uploading metadata to Pinata...');

    const pinataRes = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PINATA_JWT}`
      },
      body: JSON.stringify(req.body)
    });

    if (!pinataRes.ok) {
      const errorData = await pinataRes.text();
      console.error('❌ Pinata metadata error:', errorData);
      throw new Error(`Pinata metadata upload failed: ${pinataRes.statusText}`);
    }

    const result = await pinataRes.json();
    console.log('✅ Metadata upload successful:', result.IpfsHash);
    res.json(result);

  } catch (error) {
    console.error('❌ Metadata upload error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// BitBadges webhook endpoint
app.post('/api/bitbadges-webhook', (req, res) => {
  console.log('🎣 BitBadges webhook received!');
  console.log('📦 Payload:', JSON.stringify(req.body, null, 2));

  try {
    const {
      claimId,
      claimAttemptId,
      _attemptStatus,
      _isSimulation,
      ethAddress,
      badgeId,
      collectionId,
      metadata,
      email: directEmail,
      discord: directDiscord
    } = req.body;

    // Extract user information from multiple possible locations
    const email = metadata?.email || directEmail || 'suganthan.27it@licet.ac.in';
    const discord = metadata?.discord || directDiscord || { username: 'User', id: 'unknown' };

    console.log('🔍 Processing:', {
      claimId,
      attemptStatus: _attemptStatus,
      isSimulation: _isSimulation,
      ethAddress,
      badgeId,
      collectionId,
      email,
      discord: discord?.username
    });

    // Check if this is a successful claim (not simulation)
    const isSuccessfulClaim = _attemptStatus === 'success' && !_isSimulation;
    
    if (isSuccessfulClaim && ethAddress) {
      // Determine membership tier
      let tier = 'Gold'; // Default to Gold for testing
      
      if (badgeId?.toLowerCase().includes('bronze') || collectionId?.toLowerCase().includes('bronze')) {
        tier = 'Bronze';
      } else if (badgeId?.toLowerCase().includes('silver') || collectionId?.toLowerCase().includes('silver')) {
        tier = 'Silver';
      } else if (badgeId?.toLowerCase().includes('gold') || collectionId?.toLowerCase().includes('gold')) {
        tier = 'Gold';
      }
      
      console.log(`🏆 ${tier} membership claimed by: ${ethAddress}`);
      
      // Activate benefits and send email
      activateMembershipBenefits(ethAddress, tier, email, discord, claimId);
      
      res.status(200).json({ 
        success: true, 
        message: 'Webhook processed successfully',
        tier,
        benefits: `${tier} tier benefits activated`,
        email: email !== 'suganthan.27it@licet.ac.in' ? 'Email sent' : 'Test email sent'
      });
    } else {
      console.log('⏭️ Skipping - simulation or failed claim');
      res.status(200).json({ 
        success: true, 
        message: 'Webhook processed (no benefits activated)',
        reason: _isSimulation ? 'simulation' : 'not successful claim'
      });
    }

  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    res.status(500).json({ error: 'Webhook processing failed', details: error.message });
  }
});

// Activate membership benefits and send email
async function activateMembershipBenefits(userAddress, tier, email, discord, claimId) {
  const benefits = getTierBenefits(tier);
  
  // Store membership data
  if (!global.members) {
    global.members = new Map();
  }
  
  const membershipData = {
    userAddress,
    tier,
    claimId,
    email,
    discord,
    timestamp: new Date().toISOString(),
    benefits
  };
  
  const existingData = global.members.get(userAddress.toLowerCase()) || {};
  existingData[tier] = membershipData;
  global.members.set(userAddress.toLowerCase(), existingData);
  
  console.log(`✨ ${tier} benefits activated for: ${userAddress}`);
  console.log('📧 Email:', email);
  console.log('🎮 Discord:', discord?.username);
  
  // Send welcome email
  if (email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      await sendWelcomeEmail(email, userAddress, tier, discord, benefits);
      console.log(`📬 ${tier} welcome email sent to: ${email}`);
    } catch (emailError) {
      console.log('❌ Email error:', emailError.message);
    }
  } else {
    console.log('⚠️ Email not sent - missing credentials or email');
  }
}

// Send tier-specific welcome email
async function sendWelcomeEmail(email, walletAddress, tier, discord, benefits) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const tierEmojis = { Bronze: '🥉', Silver: '🥈', Gold: '🥇' };
  const tierColors = { Bronze: '#CD7F32', Silver: '#C0C0C0', Gold: '#FFD700' };
  const tierGradients = { 
    Bronze: 'linear-gradient(135deg, #CD7F32, #8B4513)',
    Silver: 'linear-gradient(135deg, #C0C0C0, #708090)', 
    Gold: 'linear-gradient(135deg, #FFD700, #FFA500)'
  };

  const benefitsList = Object.keys(benefits).map(key => {
    const benefitName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    return `<li style="margin: 0.5rem 0; color: #ffffff;">✅ ${benefitName}</li>`;
  }).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `${tierEmojis[tier]} Welcome to ${tier} Membership - NFT Treasury!`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: linear-gradient(135deg, #000, #1a1a1a); color: white; border-radius: 20px; overflow: hidden;">
        <div style="background: ${tierGradients[tier]}; padding: 2rem; text-align: center;">
          <h1 style="margin: 0; color: black; font-size: 2rem;">${tierEmojis[tier]} Welcome to ${tier} Membership!</h1>
          <p style="margin: 0.5rem 0 0 0; color: black; font-size: 1.2rem;">NFT Treasury ${tier} Benefits Activated</p>
        </div>
        
        <div style="padding: 2rem;">
          <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">🎉 Congratulations! Your ${tier} membership has been activated instantly via our BitBadges webhook system.</p>
          
          <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0;">
            <h3 style="color: ${tierColors[tier]}; margin-top: 0;">👤 Account Information</h3>
            <p><strong>Wallet Address:</strong> ${walletAddress}</p>
            <p><strong>Discord:</strong> ${discord?.username || 'Not Connected'}</p>
            <p><strong>Membership Tier:</strong> ${tier}</p>
            <p><strong>Activated:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0;">
            <h3 style="color: ${tierColors[tier]}; margin-top: 0;">🌟 Your ${tier} Benefits</h3>
            <ul style="padding-left: 1.5rem; list-style: none;">
              ${benefitsList}
            </ul>
          </div>
          
          <div style="text-align: center; margin: 2rem 0;">
            <a href="http://localhost:5173" style="background: ${tierGradients[tier]}; color: black; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              🚀 Access Your ${tier} Dashboard
            </a>
          </div>
          
          <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 1.5rem; margin-top: 2rem; text-align: center; color: #aaa;">
            <p>Welcome to the NFT Treasury ${tier} community! 🎊</p>
            <p>If you have any questions, reply to this email or join our Discord.</p>
          </div>
        </div>
      </div>
    `
  };

  const result = await transporter.sendMail(mailOptions);
  return result;
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

// Legacy Gold benefits endpoint
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

app.listen(PORT, () => {
  console.log(`🚀 NFT Treasury Server running on http://localhost:${PORT}`);
  console.log('📧 Email system ready');
  console.log('🎣 BitBadges webhook endpoint: /api/bitbadges-webhook');
});
