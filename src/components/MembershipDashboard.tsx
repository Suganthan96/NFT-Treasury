import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  getUserMembershipStatus, 
  MEMBERSHIP_TIERS, 
  MembershipTier 
} from '../utils/bitbadges';
import { useMembershipNFTs } from '../hooks/useNFTCount';

interface MembershipDashboardProps {
  compact?: boolean;
}

export default function MembershipDashboard({ compact = false }: MembershipDashboardProps) {
  const { address, isConnected } = useAccount();
  const { nftCount, loading } = useMembershipNFTs();
  const [currentTier, setCurrentTier] = useState<MembershipTier | null>(null);
  const [ownedBadges, setOwnedBadges] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    async function fetchMembershipData() {
      if (address && !loading) {
        try {
          const status = await getUserMembershipStatus(address, nftCount);
          setCurrentTier(status.eligibleTier);
          setOwnedBadges(status.ownedBadges);
        } catch (error) {
          console.error('Error fetching membership data:', error);
        }
      }
    }

    fetchMembershipData();
  }, [address, nftCount, loading]);

  if (!isConnected) {
    return (
      <div style={{
        padding: compact ? '1rem' : '2rem',
        background: '#1f1f1f',
        borderRadius: '8px',
        border: '1px solid #333',
        textAlign: 'center',
        color: '#ccc'
      }}>
        Connect wallet to view membership status
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        padding: compact ? '1rem' : '2rem',
        background: '#1f1f1f',
        borderRadius: '8px',
        border: '1px solid #333',
        textAlign: 'center',
        color: '#ccc'
      }}>
        Loading membership data...
      </div>
    );
  }

  const getHighestOwnedTier = () => {
    for (let i = MEMBERSHIP_TIERS.length - 1; i >= 0; i--) {
      if (ownedBadges[MEMBERSHIP_TIERS[i].name]) {
        return MEMBERSHIP_TIERS[i];
      }
    }
    return null;
  };

  const highestOwnedTier = getHighestOwnedTier();

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.75rem',
        background: highestOwnedTier ? `${highestOwnedTier.color}20` : '#1f1f1f',
        border: highestOwnedTier ? `1px solid ${highestOwnedTier.color}` : '1px solid #333',
        borderRadius: '8px'
      }}>
        <div style={{ 
          fontSize: '1.5rem',
          color: highestOwnedTier?.color || '#ccc'
        }}>
          {highestOwnedTier ? 
            (highestOwnedTier.name === 'Gold' ? '🥇' : 
             highestOwnedTier.name === 'Silver' ? '🥈' : '🥉') : 
            '👤'}
        </div>
        <div>
          <div style={{ 
            fontWeight: 'bold', 
            color: highestOwnedTier?.color || '#ccc',
            fontSize: '0.9rem'
          }}>
            {highestOwnedTier ? `${highestOwnedTier.name} Member` : 'No Membership'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#888' }}>
            {nftCount} NFT{nftCount !== 1 ? 's' : ''} owned
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '2rem',
      background: 'linear-gradient(135deg, #1f1f1f, #2a2a2a)',
      borderRadius: '16px',
      border: '1px solid #333'
    }}>
      <h3 style={{ 
        color: '#fff', 
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        Membership Dashboard
      </h3>

      {/* Current Status */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: '#2a2a2a',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <div style={{ color: '#ccc', fontSize: '0.9rem' }}>NFTs Owned</div>
          <div style={{ color: '#10B981', fontSize: '1.8rem', fontWeight: 'bold' }}>
            {nftCount}
          </div>
        </div>

        <div style={{
          background: '#2a2a2a',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {highestOwnedTier ? 
              (highestOwnedTier.name === 'Gold' ? '🥇' : 
               highestOwnedTier.name === 'Silver' ? '🥈' : '🥉') : 
              '❌'}
          </div>
          <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Current Tier</div>
          <div style={{ 
            color: highestOwnedTier?.color || '#888', 
            fontSize: '1.2rem', 
            fontWeight: 'bold' 
          }}>
            {highestOwnedTier?.name || 'None'}
          </div>
        </div>

        <div style={{
          background: '#2a2a2a',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
          <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Eligible For</div>
          <div style={{ 
            color: currentTier?.color || '#888', 
            fontSize: '1.2rem', 
            fontWeight: 'bold' 
          }}>
            {currentTier?.name || 'None'}
          </div>
        </div>
      </div>

      {/* Benefits */}
      {highestOwnedTier && (
        <div>
          <h4 style={{ color: '#fff', marginBottom: '1rem' }}>Your Benefits</h4>
          <div style={{
            background: `${highestOwnedTier.color}10`,
            border: `1px solid ${highestOwnedTier.color}40`,
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#ccc' }}>
              {highestOwnedTier.benefits.map((benefit, index) => (
                <li key={index} style={{ margin: '0.5rem 0' }}>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Upgrade Path */}
      {currentTier && currentTier !== highestOwnedTier && (
        <div style={{ marginTop: '2rem' }}>
          <h4 style={{ color: '#F59E0B', marginBottom: '1rem' }}>
            🚀 Upgrade Available
          </h4>
          <p style={{ color: '#ccc', marginBottom: '1rem' }}>
            You're eligible for {currentTier.name} tier! 
            Visit the membership page to claim your badge.
          </p>
          <a 
            href="/membership"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: `linear-gradient(135deg, ${currentTier.color}, ${currentTier.color}CC)`,
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}
          >
            Claim {currentTier.name} Badge
          </a>
        </div>
      )}
    </div>
  );
}
