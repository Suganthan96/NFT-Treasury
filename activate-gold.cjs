// Manual Gold VIP Activation Script
// Use this to activate Gold benefits for your real wallet address

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const activateGoldVIP = async () => {
  // 🔥 REPLACE THIS WITH YOUR REAL WALLET ADDRESS 🔥
  const YOUR_WALLET_ADDRESS = "0x588F6b3169F60176c1143f8BaB47bCf3DeEbECdc";
  
  console.log('🔥 Manual Gold VIP Activation');
  console.log('📝 Instructions:');
  console.log('1. Replace YOUR_WALLET_ADDRESS_HERE with your actual wallet address');
  console.log('2. Run: node activate-gold.cjs');
  console.log('3. Visit http://localhost:5173/ with the same wallet connected');
  console.log('');
  
  if (YOUR_WALLET_ADDRESS === "YOUR_WALLET_ADDRESS_HERE") {
    console.log('❌ Please update YOUR_WALLET_ADDRESS first!');
    return;
  }

  // Simulate a successful BitBadges claim for your wallet
  const webhookData = {
    "pluginSecret": "nft-treasury-gold-webhook-2025",
    "claimId": "manual-activation-" + Date.now(),
    "claimAttemptId": "manual-" + Date.now(),
    "lastUpdated": Date.now(),
    "createdAt": Date.now(),
    "version": "0",
    "_isSimulation": false,
    "_attemptStatus": "success",
    "isAddressSignedIn": true,
    "bitbadgesAddress": "your-bitbadges-address",
    "ethAddress": YOUR_WALLET_ADDRESS,
    "solAddress": "",
    "btcAddress": "",
    "email": "suganthan.27it@licet.ac.in", // Using your real email from Pinata config
    "discord": {
      "id": "your-discord-id-123",
      "username": "Suganthan96",
      "discriminator": "0001"
    }
  };

  try {
    console.log('🚀 Activating Gold VIP for:', YOUR_WALLET_ADDRESS);
    
    const response = await fetch('http://localhost:3001/api/bitbadges-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    const result = await response.json();
    console.log('✅ Activation successful:', result);
    
    // Check benefits
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const benefitsResponse = await fetch(`http://localhost:3001/api/gold-benefits/${YOUR_WALLET_ADDRESS}`);
    const benefits = await benefitsResponse.json();
    console.log('🥇 Gold benefits:', JSON.stringify(benefits, null, 2));
    
    console.log('');
    console.log('🎉 SUCCESS! Now visit http://localhost:5174/ with your wallet connected!');
    console.log('🔍 Make sure to connect the same wallet address:', YOUR_WALLET_ADDRESS);
    
  } catch (error) {
    console.error('❌ Activation failed:', error.message);
    console.log('💡 Make sure the server is running: node server.cjs');
  }
};

activateGoldVIP();
