import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { getUserMembershipStatus } from '../utils/bitbadges';
import { useMembershipNFTs } from '../hooks/useNFTCount';

interface PriorityMintingProps {
  compact?: boolean;
}

export default function PriorityMinting({ compact = false }: PriorityMintingProps) {
  const { address, isConnected } = useAccount();
  const { nftCount } = useMembershipNFTs();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      if (address && isConnected) {
        try {
          const status = await getUserMembershipStatus(address, nftCount);
          const silverOrGold = status.ownedBadges['Silver'] || status.ownedBadges['Gold'];
          setHasAccess(silverOrGold);
        } catch (error) {
          console.error('Error checking priority minting access:', error);
        }
      }
      setLoading(false);
    }
    
    checkAccess();
  }, [address, isConnected, nftCount]);

  if (loading) {
    return (
      <div style={{
        padding: '1rem',
        background: '#2a2a2a',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#ccc'
      }}>
        Loading priority access...
      </div>
    );
  }

  if (compact) {
    return (
      <div style={{
        padding: '1rem',
        background: hasAccess 
          ? 'linear-gradient(135deg, #10B981, #059669)' 
          : 'rgba(100,100,100,0.2)',
        borderRadius: '12px',
        textAlign: 'center',
        color: 'white',
        border: hasAccess ? 'none' : '1px solid #444'
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          {hasAccess ? '⚡' : '🔒'}
        </div>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Priority Minting
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
          {hasAccess ? '✅ Active' : 'Silver+ Required'}
        </div>
        {hasAccess && (
          <div style={{
            marginTop: '0.5rem',
            fontSize: '0.8rem',
            background: 'rgba(255,255,255,0.2)',
            padding: '0.25rem 0.5rem',
            borderRadius: '6px'
          }}>
            Skip queue • Early access
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      padding: '2rem',
      background: hasAccess 
        ? 'linear-gradient(135deg, #10B981, #059669)' 
        : 'linear-gradient(135deg, #2a2a2a, #1f1f1f)',
      borderRadius: '16px',
      textAlign: 'center',
      color: 'white',
      border: hasAccess ? 'none' : '1px solid #444'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        {hasAccess ? '⚡' : '🔒'}
      </div>
      
      <h3 style={{ 
        color: 'white', 
        marginBottom: '1rem',
        fontSize: '1.8rem'
      }}>
        Priority Minting Access
      </h3>

      {hasAccess ? (
        <>
          <div style={{ 
            marginBottom: '1.5rem',
            fontSize: '1.1rem',
            opacity: 0.95
          }}>
            🎉 You have priority minting privileges!
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            <h4 style={{ color: 'white', marginBottom: '1rem', textAlign: 'center' }}>
              Your Priority Benefits:
            </h4>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#FFD700' }}>⚡</span>
                <span>Skip minting queue - mint immediately</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#FFD700' }}>🚀</span>
                <span>24-hour early access to new drops</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#FFD700' }}>💎</span>
                <span>Reserved allocation guarantee</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#FFD700' }}>💰</span>
                <span>10% discount on priority mints</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#FFD700' }}>🎯</span>
                <span>Higher chance of rare traits</span>
              </div>
            </div>
          </div>

          {/* Next Drop Info */}
          <div style={{
            background: 'rgba(255,215,0,0.2)',
            border: '1px solid rgba(255,215,0,0.4)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#FFD700' }}>
              🔥 Next Priority Drop
            </div>
            <div style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              <strong>Quantum Legends Collection</strong>
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Priority Access: <strong>Tomorrow 2:00 PM EST</strong><br/>
              Public Launch: 24 hours later
            </div>
          </div>

          <button
            style={{
              padding: '0.75rem 2rem',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
            onClick={() => {
              // Navigate to minter page with priority flag
              window.location.href = '/minter?priority=true';
            }}
          >
            🚀 Access Priority Minter
          </button>
        </>
      ) : (
        <>
          <div style={{ 
            marginBottom: '1.5rem',
            fontSize: '1rem',
            color: '#ccc'
          }}>
            Priority minting is exclusive to Silver and Gold members
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '1px solid #444'
          }}>
            <div style={{ color: '#ccc', marginBottom: '1rem' }}>
              Upgrade to unlock priority minting:
            </div>
            <div style={{ display: 'grid', gap: '0.5rem', textAlign: 'left' }}>
              <div style={{ color: '#C0C0C0' }}>
                🥈 <strong>Silver Tier:</strong> Own 3+ NFTs
              </div>
              <div style={{ color: '#FFD700' }}>
                🥇 <strong>Gold Tier:</strong> Own 5+ NFTs
              </div>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#888' }}>
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
            🔒 Upgrade membership to unlock priority minting
          </div>
        </>
      )}
    </div>
  );
}
