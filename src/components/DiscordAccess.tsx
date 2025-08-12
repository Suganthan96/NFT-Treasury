import { useState } from 'react';
import { useAccount } from 'wagmi';
import { getUserMembershipStatus, MEMBERSHIP_TIERS } from '../utils/bitbadges';
import { useMembershipNFTs } from '../hooks/useNFTCount';

interface DiscordAccessProps {
  compact?: boolean;
}

export default function DiscordAccess({ compact = false }: DiscordAccessProps) {
  const { address, isConnected } = useAccount();
  const { nftCount } = useMembershipNFTs();
  const [isJoining, setIsJoining] = useState(false);
  const [joinStatus, setJoinStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Discord server info - updated with your actual server
  const DISCORD_INVITE_URL = 'https://discord.gg/x4HPmQEF'; // Your actual invite link
  const DISCORD_SERVER_NAME = 'NFT Treasury server';
  const DISCORD_SERVER_ID = '1404708871964069999';

  // Role information from your BitBadges setup
  const DISCORD_ROLES = {
    BITBADGES: '1404711520151277593',
    GOLD_MEMBER: '1404710253227937823',
    NFT_TREASURY_MEMBER: '1404710257250533477',
    SILVER_MEMBER: '1404710144398463068'
  };

  const handleJoinDiscord = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setIsJoining(true);
      
      // Check membership status
      const membershipStatus = await getUserMembershipStatus(address, nftCount);
      const hasRequiredTier = membershipStatus.ownedBadges['Silver'] || membershipStatus.ownedBadges['Gold'];
      
      if (!hasRequiredTier) {
        alert('You need Silver or Gold membership to access Discord!');
        setJoinStatus('error');
        return;
      }

      // Open Discord invite in new window
      window.open(DISCORD_INVITE_URL, '_blank');
      setJoinStatus('success');
      
    } catch (error) {
      console.error('Error joining Discord:', error);
      setJoinStatus('error');
    } finally {
      setIsJoining(false);
    }
  };

  if (!isConnected) {
    return (
      <div style={{
        padding: '1rem',
        background: 'linear-gradient(135deg, #5865f2, #7289da)',
        borderRadius: '12px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔒</div>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Discord Access</div>
        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
          Connect wallet to check Discord access
        </div>
      </div>
    );
  }

  const silverTier = MEMBERSHIP_TIERS.find(t => t.name === 'Silver');
  const goldTier = MEMBERSHIP_TIERS.find(t => t.name === 'Gold');
  const canAccess = nftCount >= (silverTier?.minNFTs || 3);

  if (compact) {
    return (
      <div style={{
        padding: '0.75rem 1rem',
        background: canAccess ? 'linear-gradient(135deg, #5865f2, #7289da)' : '#2a2a2a',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        border: canAccess ? 'none' : '1px solid #444'
      }}>
        <div style={{ fontSize: '1.2rem' }}>
          {canAccess ? '💬' : '🔒'}
        </div>
        <div>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '0.9rem',
            color: canAccess ? 'white' : '#ccc'
          }}>
            Discord Access
          </div>
          <div style={{ 
            fontSize: '0.8rem', 
            opacity: 0.8,
            color: canAccess ? 'white' : '#888'
          }}>
            {canAccess ? 'Available' : `Need ${silverTier?.minNFTs}+ NFTs`}
          </div>
        </div>
        {canAccess && (
          <button
            onClick={handleJoinDiscord}
            disabled={isJoining}
            style={{
              marginLeft: 'auto',
              padding: '0.25rem 0.75rem',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              color: 'white',
              fontSize: '0.8rem',
              cursor: isJoining ? 'not-allowed' : 'pointer',
              opacity: isJoining ? 0.7 : 1
            }}
          >
            {isJoining ? '...' : 'Join'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{
      padding: '2rem',
      background: canAccess 
        ? 'linear-gradient(135deg, #5865f2, #7289da)' 
        : 'linear-gradient(135deg, #2a2a2a, #1f1f1f)',
      borderRadius: '16px',
      textAlign: 'center',
      color: 'white',
      border: canAccess ? 'none' : '1px solid #444'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        {canAccess ? '💬' : '🔒'}
      </div>
      
      <h3 style={{ 
        color: 'white', 
        marginBottom: '1rem',
        fontSize: '1.5rem'
      }}>
        {DISCORD_SERVER_NAME}
      </h3>

      {canAccess ? (
        <>
          <div style={{ 
            marginBottom: '1.5rem',
            fontSize: '1rem',
            opacity: 0.9
          }}>
            🎉 You have access to our exclusive Discord server!
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Discord Benefits:</h4>
            <ul style={{ margin: 0, paddingLeft: '1rem', color: 'rgba(255,255,255,0.9)' }}>
              <li>Exclusive Silver & Gold member channels</li>
              <li>Priority support</li>
              <li>Early announcements</li>
              <li>Community events & giveaways</li>
              <li>Direct access to the team</li>
            </ul>
          </div>

          <button
            onClick={handleJoinDiscord}
            disabled={isJoining}
            style={{
              padding: '0.75rem 2rem',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: isJoining ? 'not-allowed' : 'pointer',
              opacity: isJoining ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (!isJoining) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
              }
            }}
            onMouseOut={(e) => {
              if (!isJoining) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              }
            }}
          >
            {isJoining ? 'Opening Discord...' : `Join ${DISCORD_SERVER_NAME}`}
          </button>

          {joinStatus === 'success' && (
            <div style={{
              marginTop: '1rem',
              padding: '0.5rem',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}>
              ✅ Discord invite opened! Welcome to the community!
            </div>
          )}

          {joinStatus === 'error' && (
            <div style={{
              marginTop: '1rem',
              padding: '0.5rem',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}>
              ❌ Error accessing Discord. Please try again.
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ 
            marginBottom: '1.5rem',
            fontSize: '1rem',
            color: '#ccc'
          }}>
            Discord access is exclusive to Silver and Gold members
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #444'
          }}>
            <div style={{ color: '#ccc', marginBottom: '0.5rem' }}>Requirements:</div>
            <div style={{ color: '#10B981' }}>
              • Silver Tier: Own {silverTier?.minNFTs}+ NFTs
            </div>
            <div style={{ color: '#FFD700' }}>
              • Gold Tier: Own {goldTier?.minNFTs}+ NFTs
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#888' }}>
              You currently own {nftCount} NFT{nftCount !== 1 ? 's' : ''}
            </div>
          </div>

          <div style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(100,100,100,0.2)',
            border: '1px solid #555',
            borderRadius: '8px',
            color: '#888',
            fontSize: '0.9rem'
          }}>
            🔒 Upgrade your membership to unlock Discord access
          </div>
        </>
      )}
    </div>
  );
}
