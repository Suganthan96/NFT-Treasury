import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { hasBitBadge, MEMBERSHIP_TIERS } from '../utils/bitbadges';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredTier?: 'Bronze' | 'Silver' | 'Gold';
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredTier = 'Bronze', 
  fallback 
}: ProtectedRouteProps) {
  const { address, isConnected } = useAccount();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAccess() {
      if (!isConnected || !address) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        const tier = MEMBERSHIP_TIERS.find(t => t.name === requiredTier);
        if (!tier) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        const hasRequiredBadge = await hasBitBadge(address, tier.collectionId, tier.badgeId);
        setHasAccess(hasRequiredBadge);
      } catch (error) {
        console.error('Error checking badge access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [address, isConnected, requiredTier]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        color: '#ccc',
        fontSize: '1.2rem'
      }}>
        Checking membership access...
      </div>
    );
  }

  if (!hasAccess) {
    return fallback || (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        background: '#1f1f1f',
        borderRadius: '12px',
        border: '1px solid #ef4444',
        margin: '2rem',
        color: '#ef4444'
      }}>
        <h2>Access Denied</h2>
        <p>You need a {requiredTier} membership badge to access this feature.</p>
        <p>Visit the <a href="/membership" style={{ color: '#4F46E5' }}>Membership</a> page to claim your badge.</p>
      </div>
    );
  }

  return <>{children}</>;
}

// Higher-order component for protecting entire pages
export function withMembershipProtection<T extends object>(
  Component: React.ComponentType<T>,
  requiredTier: 'Bronze' | 'Silver' | 'Gold' = 'Bronze'
) {
  return function ProtectedComponent(props: T) {
    return (
      <ProtectedRoute requiredTier={requiredTier}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
