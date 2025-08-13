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

// Gold Airdrop System - Monthly exclusive NFTs
app.post('/api/gold-airdrop', async (req, res) => {
  try {
    const { nftTitle = "Gold Monthly Airdrop", nftDescription = "Exclusive monthly airdrop for Gold VIP members" } = req.body;
    
    if (!global.members) {
      return res.json({ success: false, message: 'No members found' });
    }
    
    // Get all Gold members
    const goldMembers = [];
    for (const [address, memberData] of global.members.entries()) {
      if (memberData.Gold) {
        goldMembers.push({
          address,
          email: memberData.Gold.email,
          discord: memberData.Gold.discord
        });
      }
    }
    
    console.log(`🎁 Starting Gold Airdrop for ${goldMembers.length} members`);
    
    // Create special Gold airdrop metadata
    const airdropMetadata = {
      name: nftTitle,
      description: nftDescription,
      image: "https://gateway.pinata.cloud/ipfs/QmYourGoldAirdropImageHash", // Replace with actual image
      attributes: [
        { trait_type: "Type", value: "Gold Airdrop" },
        { trait_type: "Month", value: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }) },
        { trait_type: "Recipient Count", value: goldMembers.length.toString() },
        { trait_type: "Exclusivity", value: "Gold VIP Only" },
        { trait_type: "Airdrop Date", value: new Date().toISOString().split('T')[0] }
      ],
    };
    
    // Upload metadata to IPFS
    const metaRes = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PINATA_JWT}`
      },
      body: JSON.stringify(airdropMetadata)
    });
    
    const metaData = await metaRes.json();
    const tokenURI = `https://gateway.pinata.cloud/ipfs/${metaData.IpfsHash}`;
    
    console.log('✅ Airdrop metadata uploaded:', tokenURI);
    
    // Send airdrop notification emails
    const airdropResults = [];
    for (const member of goldMembers) {
      try {
        if (member.email && member.email !== 'suganthan.27it@licet.ac.in') { // Skip test email
          await sendGoldAirdropEmail(member.email, member.address, nftTitle, tokenURI);
          airdropResults.push({ address: member.address, status: 'email_sent' });
        } else {
          airdropResults.push({ address: member.address, status: 'no_email' });
        }
      } catch (error) {
        console.error(`Failed to send airdrop email to ${member.address}:`, error.message);
        airdropResults.push({ address: member.address, status: 'email_failed' });
      }
    }
    
    res.json({
      success: true,
      message: `Gold airdrop processed for ${goldMembers.length} members`,
      tokenURI,
      recipients: airdropResults
    });
    
  } catch (error) {
    console.error('❌ Gold airdrop failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Gold Analytics endpoint - VIP insights
app.get('/api/gold-analytics/:address', (req, res) => {
  try {
    const { address } = req.params;
    
    if (!global.members) {
      return res.json({ 
        portfolioValue: '0', 
        totalAirdrops: '0', 
        vipDays: '0', 
        totalSavings: '0' 
      });
    }
    
    const memberData = global.members.get(address.toLowerCase());
    const goldData = memberData?.Gold;
    
    if (!goldData) {
      return res.json({ 
        portfolioValue: '0', 
        totalAirdrops: '0', 
        vipDays: '0', 
        totalSavings: '0' 
      });
    }
    
    // Calculate VIP days since Gold membership
    const goldClaimDate = new Date(goldData.timestamp);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - goldClaimDate.getTime();
    const vipDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    // Calculate estimated portfolio value (based on owned NFTs * average price)
    const estimatedNFTValue = (goldData.nftCount || 5) * 0.01; // Assume 0.01 ETH per NFT
    const portfolioValue = (estimatedNFTValue * 2000).toFixed(2); // Convert ETH to USD estimate
    
    // Mock analytics data (in production, this would come from real tracking)
    const analytics = {
      portfolioValue,
      totalAirdrops: goldData.airdropsReceived || '0',
      vipDays: vipDays.toString(),
      totalSavings: (parseFloat(portfolioValue) * 0.3).toFixed(2), // 30% savings from Gold discounts
      memberSince: goldData.timestamp,
      lastLogin: new Date().toISOString(),
      exclusiveNFTsOwned: goldData.exclusiveNFTsOwned || '0',
      vipEventsAttended: goldData.vipEventsAttended || '0'
    };
    
    console.log(`📊 Gold analytics for ${address}:`, analytics);
    res.json(analytics);
    
  } catch (error) {
    console.error('❌ Gold analytics error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Gold VIP Events system
app.get('/api/gold-vip-events', (req, res) => {
  // Mock VIP events data (in production, this would come from a database)
  const vipEvents = [
    {
      id: 1,
      title: "Gold Ape Collection Reveal",
      description: "Exclusive preview of the new premium ape NFT collection with artist discussion and early access minting.",
      emoji: "🦍",
      date: "Feb 25, 2025",
      time: "7:00 PM EST",
      spotsLeft: 15,
      maxSpots: 20
    },
    {
      id: 2,
      title: "VIP NFT Trading Masterclass",
      description: "Private session with top NFT traders sharing advanced strategies and insights on premium collections.",
      emoji: "📈",
      date: "Mar 5, 2025", 
      time: "6:00 PM EST",
      spotsLeft: 8,
      maxSpots: 15
    },
    {
      id: 3,
      title: "Gold Ape Holders Discord AMA",
      description: "Live AMA with NFT Treasury founders, roadmap reveals, and exclusive Gold ape collection insights.",
      emoji: "🎤",
      date: "Mar 12, 2025",
      time: "8:00 PM EST", 
      spotsLeft: 25,
      maxSpots: 50
    }
  ];
  
  res.json(vipEvents);
});

// RSVP for Gold VIP Events
app.post('/api/gold-event-rsvp', async (req, res) => {
  try {
    const { eventId, userAddress, eventTitle } = req.body;
    
    if (!global.members) {
      return res.status(400).json({ error: 'No members data available' });
    }
    
    const memberData = global.members.get(userAddress.toLowerCase());
    const goldData = memberData?.Gold;
    
    if (!goldData) {
      return res.status(403).json({ error: 'Gold membership required for VIP events' });
    }
    
    // Send RSVP confirmation email
    if (goldData.email && goldData.email !== 'suganthan.27it@licet.ac.in') {
      await sendVipEventRSVPEmail(goldData.email, userAddress, eventTitle, eventId);
    }
    
    console.log(`🎫 VIP Event RSVP: ${userAddress} -> ${eventTitle}`);
    
    res.json({
      success: true,
      message: `RSVP confirmed for ${eventTitle}`,
      eventId,
      userAddress
    });
    
  } catch (error) {
    console.error('❌ VIP Event RSVP failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Send VIP Event RSVP confirmation email
async function sendVipEventRSVPEmail(email, walletAddress, eventTitle, eventId) {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `🎫 VIP Event RSVP Confirmed - ${eventTitle}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: linear-gradient(135deg, #000, #1a1a1a); color: white; border-radius: 20px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 2rem; text-align: center;">
          <h1 style="margin: 0; color: black; font-size: 2rem;">🎫 RSVP Confirmed!</h1>
          <p style="margin: 0.5rem 0 0 0; color: black; font-size: 1.2rem;">Gold VIP Event Access</p>
        </div>
        
        <div style="padding: 2rem;">
          <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">🥇 Your RSVP has been confirmed for this exclusive Gold VIP event!</p>
          
          <div style="background: rgba(255,215,0,0.1); border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0;">
            <h3 style="color: #FFD700; margin-top: 0;">🎪 Event Details</h3>
            <p><strong>Event:</strong> ${eventTitle}</p>
            <p><strong>Event ID:</strong> #${eventId}</p>
            <p><strong>Wallet:</strong> ${walletAddress}</p>
            <p><strong>Status:</strong> ✅ RSVP Confirmed</p>
          </div>
          
          <div style="background: rgba(255,215,0,0.1); border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0;">
            <h3 style="color: #FFD700; margin-top: 0;">📅 What's Next?</h3>
            <p>• You'll receive event details 24 hours before</p>
            <p>• Discord invite will be sent to your registered email</p>
            <p>• Special Gold VIP perks will be available during the event</p>
            <p>• Event recording access for Gold members</p>
          </div>
          
          <div style="text-align: center; margin: 2rem 0;">
            <a href="http://localhost:5174" style="background: linear-gradient(135deg, #FFD700, #FFA500); color: black; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              🎯 View More VIP Events
            </a>
          </div>
          
          <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 1.5rem; margin-top: 2rem; text-align: center; color: #aaa;">
            <p>Can't make it? Reply to this email to cancel your RSVP.</p>
            <p>Thank you for being a Gold VIP member! 👑</p>
          </div>
        </div>
      </div>
    `
  };

  const result = await transporter.sendMail(mailOptions);
  return result;
}

// Discord invite system for Silver+ members
app.post('/api/discord-invite', async (req, res) => {
  try {
    const { userAddress, tier } = req.body;
    
    if (!global.members) {
      return res.status(400).json({ error: 'No members data available' });
    }
    
    const memberData = global.members.get(userAddress.toLowerCase());
    
    // Check if user has required tier
    if (tier === 'Silver' && !(memberData?.Silver || memberData?.Gold)) {
      return res.status(403).json({ error: 'Silver or Gold membership required for Discord access' });
    }
    
    const userData = memberData?.Silver || memberData?.Gold;
    if (!userData || !userData.email || userData.email === 'suganthan.27it@licet.ac.in') {
      return res.status(400).json({ error: 'Valid email required for Discord invite' });
    }
    
    // Send Discord invite email
    await sendDiscordInviteEmail(userData.email, userAddress, tier);
    
    console.log(`🎮 Discord invite sent: ${userAddress} (${tier} tier)`);
    
    res.json({
      success: true,
      message: `Discord invite sent to ${userData.email}`,
      tier,
      userAddress
    });
    
  } catch (error) {
    console.error('❌ Discord invite failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Send Discord invite email
async function sendDiscordInviteEmail(email, walletAddress, tier) {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const tierColors = {
    'Silver': '#C0C0C0',
    'Gold': '#FFD700'
  };

  const discordInvites = {
    'Silver': 'https://discord.gg/nft-treasury-silver-vip',
    'Gold': 'https://discord.gg/nft-treasury-gold-vip'
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `🎮 ${tier} Discord Invite - NFT Treasury VIP Community`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: linear-gradient(135deg, #000, #1a1a1a); color: white; border-radius: 20px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, ${tierColors[tier]}, #7289DA); padding: 2rem; text-align: center;">
          <h1 style="margin: 0; color: black; font-size: 2rem;">🎮 Discord Invite</h1>
          <p style="margin: 0.5rem 0 0 0; color: black; font-size: 1.2rem;">${tier} VIP Community Access</p>
        </div>
        
        <div style="padding: 2rem;">
          <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">🥇 Welcome to the exclusive ${tier} Discord community!</p>
          
          <div style="background: rgba(114, 137, 218, 0.1); border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0;">
            <h3 style="color: #7289DA; margin-top: 0;">🎮 Your Discord Access</h3>
            <p><strong>Tier:</strong> ${tier} VIP Member</p>
            <p><strong>Wallet:</strong> ${walletAddress}</p>
            <p><strong>Invite Link:</strong> <a href="${discordInvites[tier]}" style="color: #7289DA; text-decoration: none;">${discordInvites[tier]}</a></p>
          </div>
          
          <div style="background: rgba(114, 137, 218, 0.1); border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0;">
            <h3 style="color: #7289DA; margin-top: 0;">🌟 Your ${tier} Benefits</h3>
            <p>• 💬 Private ${tier}+ member channels</p>
            <p>• 📈 Exclusive trading signals and market analysis</p>
            <p>• 🎨 Early access to new NFT drops</p>
            <p>• 🔔 Real-time alerts for rare NFT listings</p>
            ${tier === 'Gold' ? '<p>• 👑 Gold VIP exclusive events and AMAs</p>' : ''}
            <p>• 🤝 Direct access to NFT Treasury team</p>
          </div>
          
          <div style="text-align: center; margin: 2rem 0;">
            <a href="${discordInvites[tier]}" style="background: linear-gradient(135deg, #7289DA, #5B6EBF); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              🎮 Join ${tier} Discord Now
            </a>
          </div>
          
          <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 1.5rem; margin-top: 2rem; text-align: center; color: #aaa;">
            <p><strong>Important:</strong> This invite is exclusive to verified ${tier} members.</p>
            <p>Keep your invite link private and don't share with non-members.</p>
            <p>Thank you for being part of our VIP community! 🚀</p>
          </div>
        </div>
      </div>
    `
  };

  const result = await transporter.sendMail(mailOptions);
  return result;
}

// Send Gold airdrop notification email
async function sendGoldAirdropEmail(email, walletAddress, nftTitle, tokenURI) {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `🎁 Gold VIP Airdrop - ${nftTitle} Has Arrived!`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: linear-gradient(135deg, #000, #1a1a1a); color: white; border-radius: 20px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 2rem; text-align: center;">
          <h1 style="margin: 0; color: black; font-size: 2rem;">🎁 Gold VIP Airdrop!</h1>
          <p style="margin: 0.5rem 0 0 0; color: black; font-size: 1.2rem;">Exclusive NFT Delivered</p>
        </div>
        
        <div style="padding: 2rem;">
          <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">🥇 Congratulations! As a Gold VIP member, you've received an exclusive airdrop NFT!</p>
          
          <div style="background: rgba(255,215,0,0.1); border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0;">
            <h3 style="color: #FFD700; margin-top: 0;">🎨 Your Airdrop NFT</h3>
            <p><strong>Name:</strong> ${nftTitle}</p>
            <p><strong>Wallet:</strong> ${walletAddress}</p>
            <p><strong>Type:</strong> Gold VIP Exclusive Airdrop</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background: rgba(255,215,0,0.1); border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0;">
            <h3 style="color: #FFD700; margin-top: 0;">📋 NFT Details</h3>
            <p><strong>Token URI:</strong></p>
            <p style="word-break: break-all; font-size: 0.9rem; color: #ccc;">${tokenURI}</p>
            <p style="margin-top: 1rem; color: #FFA500;">This NFT has been automatically prepared for minting to your wallet!</p>
          </div>
          
          <div style="text-align: center; margin: 2rem 0;">
            <a href="http://localhost:5174" style="background: linear-gradient(135deg, #FFD700, #FFA500); color: black; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              🎯 View Your Gold Dashboard
            </a>
          </div>
          
          <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 1.5rem; margin-top: 2rem; text-align: center; color: #aaa;">
            <p>Thank you for being a Gold VIP member! 👑</p>
            <p>More exclusive airdrops coming soon...</p>
          </div>
        </div>
      </div>
    `
  };

  const result = await transporter.sendMail(mailOptions);
  return result;
}

app.listen(PORT, () => {
  console.log(`🚀 NFT Treasury Server running on http://localhost:${PORT}`);
  console.log('📧 Email system ready');
  console.log('🎣 BitBadges webhook endpoint: /api/bitbadges-webhook');
});
