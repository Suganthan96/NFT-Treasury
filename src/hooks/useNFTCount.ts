import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ownsAnyERC721 } from '../pages/Home';

// Custom hook to get user's NFT count
export function useNFTCount(address?: string) {
  const [nftCount, setNftCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNFTCount() {
      if (!address) {
        setNftCount(0);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Using the existing ownsAnyERC721 function from Home.tsx
        const contracts = await ownsAnyERC721(address);
        setNftCount(contracts.length);
      } catch (err) {
        console.error('Error fetching NFT count:', err);
        setError('Failed to fetch NFT count');
        setNftCount(0);
      } finally {
        setLoading(false);
      }
    }

    fetchNFTCount();
  }, [address]);

  return { nftCount, loading, error };
}

// Hook specifically for membership-related NFT data
export function useMembershipNFTs() {
  const { address } = useAccount();
  const { nftCount, loading, error } = useNFTCount(address);

  return {
    address,
    nftCount,
    loading,
    error,
    isConnected: !!address
  };
}
