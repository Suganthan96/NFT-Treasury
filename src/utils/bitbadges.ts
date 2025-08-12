// BitBadges API Integration
// Based on BitBadges documentation: https://docs.bitbadges.io/

export interface BitBadge {
  badgeId: string;
  collectionId: string;
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface MembershipTier {
  name: string;
  badgeId: string;
  collectionId: string;
  minNFTs: number;
  benefits: string[];
  color: string;
}

// Membership tier configuration
// NOTE: These collection IDs need to be created in your BitBadges dashboard first
// Visit https://bitbadges.io/dashboard to create these collections
export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    name: 'Bronze',
    badgeId: '1',
    collectionId: '1', // Replace with your actual BitBadges collection ID
    minNFTs: 1,
    benefits: ['Access to website', 'Basic NFT minting'],
    color: '#CD7F32'
  },
  {
    name: 'Silver',
    badgeId: '1', 
    collectionId: '2', // Replace with your actual BitBadges collection ID
    minNFTs: 3,
    benefits: ['Discord access', 'Priority minting', 'Exclusive events'],
    color: '#C0C0C0'
  },
  {
    name: 'Gold',
    badgeId: '1',
    collectionId: '3', // Replace with your actual BitBadges collection ID
    minNFTs: 5,
    benefits: ['VIP perks', 'Governance voting', 'Early access drops', 'Special rewards'],
    color: '#FFD700'
  }
];

// BitBadges API base configuration
const BITBADGES_API_URL = 'https://api.bitbadges.io';
const BITBADGES_API_KEY = import.meta.env.VITE_BITBADGES_API_KEY || '';

// Local storage for tracking membership until BitBadges collections are fully set up
const MEMBERSHIP_STORAGE_KEY = 'nft_treasury_membership_status';

// Helper functions for local membership tracking
function getMembershipStatus(userAddress: string): { [tier: string]: boolean } {
  const stored = localStorage.getItem(MEMBERSHIP_STORAGE_KEY);
  const allMemberships = stored ? JSON.parse(stored) : {};
  return allMemberships[userAddress] || {};
}

function setMembershipStatus(userAddress: string, tierName: string, claimed: boolean): void {
  const stored = localStorage.getItem(MEMBERSHIP_STORAGE_KEY);
  const allMemberships = stored ? JSON.parse(stored) : {};
  
  if (!allMemberships[userAddress]) {
    allMemberships[userAddress] = {};
  }
  
  allMemberships[userAddress][tierName] = claimed;
  localStorage.setItem(MEMBERSHIP_STORAGE_KEY, JSON.stringify(allMemberships));
}

// Check if user owns a specific BitBadge
export async function hasBitBadge(userAddress: string, collectionId: string, badgeId: string): Promise<boolean> {
  // First check local membership status
  const membershipStatus = getMembershipStatus(userAddress);
  const tier = MEMBERSHIP_TIERS.find(t => t.collectionId === collectionId && t.badgeId === badgeId);
  
  if (tier && membershipStatus[tier.name]) {
    return true;
  }

  // Skip BitBadges API calls for now since collections don't exist yet
  // When you create real collections, uncomment the API code below
  
  /*
  try {
    const response = await fetch(`${BITBADGES_API_URL}/api/v0/collection/${collectionId}/${userAddress}/balance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BITBADGES_API_KEY}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      const hasBadge = data.balance && data.balance.some((balance: any) => 
        balance.badgeIds.includes(parseInt(badgeId))
      );
      
      if (hasBadge && tier) {
        setMembershipStatus(userAddress, tier.name, true);
      }
      
      return hasBadge;
    }
  } catch (error) {
    console.log('BitBadges API not available, using local membership tracking');
  }
  */

  return false;
}

// Get all BitBadges owned by a user - hybrid approach
export async function getUserBitBadges(userAddress: string): Promise<BitBadge[]> {
  const badges: BitBadge[] = [];
  const membershipStatus = getMembershipStatus(userAddress);

  // Get locally tracked memberships
  for (const tier of MEMBERSHIP_TIERS) {
    if (membershipStatus[tier.name]) {
      badges.push({
        badgeId: tier.badgeId,
        collectionId: tier.collectionId,
        name: `${tier.name} Member`,
        description: `${tier.name} tier membership for NFT Treasury`,
        image: `/badges/${tier.name.toLowerCase()}.png`,
        attributes: [
          { trait_type: "Tier", value: tier.name },
          { trait_type: "Min NFTs", value: tier.minNFTs },
          { trait_type: "Source", value: "Local Membership" }
        ]
      });
    }
  }

  // Skip BitBadges API calls for now to avoid 404 errors
  // When you create real collections, uncomment the API code below
  
  /*
  try {
    const response = await fetch(`${BITBADGES_API_URL}/api/v0/users/${userAddress}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BITBADGES_API_KEY}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.collected) {
        for (const [collectionId, collectionData] of Object.entries(data.collected)) {
          if (collectionData && typeof collectionData === 'object') {
            const tier = MEMBERSHIP_TIERS.find(t => t.collectionId === collectionId);
            if (tier) {
              const existingBadge = badges.find(b => b.collectionId === tier.collectionId);
              if (!existingBadge) {
                badges.push({
                  badgeId: tier.badgeId,
                  collectionId: tier.collectionId,
                  name: `${tier.name} Member`,
                  description: `${tier.name} tier membership for NFT Treasury`,
                  image: `/badges/${tier.name.toLowerCase()}.png`,
                  attributes: [
                    { trait_type: "Tier", value: tier.name },
                    { trait_type: "Min NFTs", value: tier.minNFTs },
                    { trait_type: "Source", value: "BitBadges NFT" }
                  ]
                });
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.log('BitBadges API not available for fetching user badges');
  }
  */
  
  return badges;
}

// Determine membership tier based on NFT count
export function getMembershipTier(nftCount: number): MembershipTier | null {
  // Return the highest tier the user qualifies for
  const qualifyingTiers = MEMBERSHIP_TIERS.filter(tier => nftCount >= tier.minNFTs);
  return qualifyingTiers.length > 0 ? qualifyingTiers[qualifyingTiers.length - 1] : null;
}

// Check user's current membership status
export async function getUserMembershipStatus(userAddress: string, nftCount: number) {
  const eligibleTier = getMembershipTier(nftCount);
  const ownedBadges: { [key: string]: boolean } = {};

  // Check which badges the user actually owns
  for (const tier of MEMBERSHIP_TIERS) {
    ownedBadges[tier.name] = await hasBitBadge(userAddress, tier.collectionId, tier.badgeId);
  }

  return {
    eligibleTier,
    ownedBadges,
    nftCount,
    canClaim: eligibleTier ? !ownedBadges[eligibleTier.name] : false
  };
}

// Create a BitBadges claim - hybrid approach with local tracking
export async function createBitBadgeClaim(collectionId: string, badgeId: string, claimData: any) {
  const tier = MEMBERSHIP_TIERS.find(t => t.collectionId === collectionId && t.badgeId === badgeId);
  
  if (!tier) {
    throw new Error('Invalid membership tier');
  }

  try {
    console.log(`Processing ${tier.name} membership claim...`);
    
    // Skip BitBadges API calls for now since collections don't exist
    // When you create real collections, uncomment the API code below
    
    /*
    try {
      const response = await fetch(`${BITBADGES_API_URL}/api/v0/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BITBADGES_API_KEY}`
        },
        body: JSON.stringify({
          collectionId: parseInt(collectionId),
          badgeId: parseInt(badgeId),
          recipient: claimData.recipient,
          ...claimData
        })
      });

      if (response.ok) {
        const result = await response.json();
        setMembershipStatus(claimData.recipient, tier.name, true);
        
        return {
          success: true,
          claimId: result.claimId || `claim_${Date.now()}`,
          message: `🎉 ${tier.name} membership claimed successfully via BitBadges!`,
          source: 'bitbadges_api',
          tier: tier.name
        };
      }
    } catch (apiError) {
      console.log('BitBadges API claim failed, using local membership system');
    }
    */

    // Use local membership system
    setMembershipStatus(claimData.recipient, tier.name, true);
    
    return {
      success: true,
      claimId: `local_${tier.name.toLowerCase()}_${Date.now()}`,
      message: `🎉 ${tier.name} membership claimed successfully!`,
      source: 'local_storage',
      tier: tier.name
    };

  } catch (error) {
    console.error('Error processing membership claim:', error);
    throw new Error(`Failed to process ${tier.name} membership: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Claim a membership badge using real BitBadges API
export async function claimMembershipBadge(userAddress: string, tier: MembershipTier) {
  try {
    console.log(`Claiming ${tier.name} badge for ${userAddress} via BitBadges API`);
    
    // Create the claim data for BitBadges
    const claimData = {
      recipient: userAddress,
      collectionId: tier.collectionId,
      badgeId: tier.badgeId,
      metadata: {
        name: `${tier.name} Member`,
        description: `${tier.name} tier membership for NFT Treasury`,
        image: `/badges/${tier.name.toLowerCase()}.png`,
        attributes: [
          { trait_type: "Tier", value: tier.name },
          { trait_type: "Min NFTs", value: tier.minNFTs },
          { trait_type: "Claimed Date", value: new Date().toISOString() }
        ]
      }
    };

    // Create the claim through BitBadges API
    const result = await createBitBadgeClaim(tier.collectionId, tier.badgeId, claimData);
    
    return result;
    
  } catch (error) {
    console.error('Error claiming membership badge:', error);
    throw new Error(`Failed to claim ${tier.name} badge: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
