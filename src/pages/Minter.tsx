import { useState, useRef } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useWriteContract } from 'wagmi';
import contractABI from '../abi/abi.json';
import Navbar from "../components/Navbar";

// Use the correct contract address for minting
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0xd92c6FFB0f70B85AeD6eAA72DBaf149263ebD40f';

export default function Minter() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', attr1Name: '', attr1Value: '' });
  const [isMinting, setIsMinting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { writeContract, isPending, isSuccess, data: txData, error } = useWriteContract();

  const handleImageUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target) {
        setImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const validateForm = () => {
    return form.name.trim() && form.description.trim() && selectedImage;
  };

  const handleMint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm() || isMinting) return;
    if (!isConnected || !address) {
      alert('Please connect your wallet first.');
      return;
    }
    setIsMinting(true);
    setSuccess(false);
    setTxHash('');
    setIpfsHash('');
    try {
      // 1. Upload image to Pinata (API endpoint must be implemented in your backend)
      // Updated to use backend server
      const imageFormData = new FormData();
      if (selectedImage) {
        imageFormData.append('file', selectedImage);
      }
      const imageRes = await fetch('http://localhost:3001/api/pinata-upload', {
        method: 'POST',
        body: imageFormData,
      });
      if (!imageRes.ok) throw new Error('Failed to upload image to Pinata');
      const imageData = await imageRes.json();
      const imageCID = imageData.IpfsHash;
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageCID}`;
      setIpfsHash(imageCID);

      // 2. Upload metadata to Pinata (via backend)
      const metadata = {
        name: form.name,
        description: form.description,
        image: imageUrl,
        attributes: form.attr1Name && form.attr1Value ? [
          { trait_type: form.attr1Name, value: form.attr1Value }
        ] : [],
      };
      const metaRes = await fetch('http://localhost:3001/api/pinata-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      });
      if (!metaRes.ok) throw new Error('Failed to upload metadata to Pinata');
      const metaData = await metaRes.json();
      const metaCID = metaData.IpfsHash;
      const tokenURI = `https://gateway.pinata.cloud/ipfs/${metaCID}`;
      setIpfsHash(metaCID);

      // 3. Mint NFT on blockchain using wagmi (tokenURI is the image IPFS URL)
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'mint',
        args: [address as string, tokenURI],
        chainId: 11155111, // Sepolia
      });

      setForm({ name: '', description: '', attr1Name: '', attr1Value: '' });
      setSelectedImage(null);
      setImagePreview(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
    } catch (err) {
      const error = err as Error & { reason?: string };
      alert('Minting failed: ' + (error.reason || error.message));
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="page modern-bg">
      <Navbar />
      <div className="content-wrapper">
        <ConnectButton />
        {isConnected && address && (
          <div className="text-green-400 font-semibold">
            Connected: {address.slice(0, 6)}...{address.slice(-4)} ({balance?.formatted} {balance?.symbol})
          </div>
        )}
        <form onSubmit={handleMint} className="minter-form">
          <label>
            Name:
            <input type="text" id="name" value={form.name} onChange={handleInputChange} required />
          </label>
          <label>
            Description:
            <input type="text" id="description" value={form.description} onChange={handleInputChange} required />
          </label>
          <label>
            Image:
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={e => {
                const files = e.target.files;
                if (files && files.length > 0) handleImageUpload(files[0]);
              }}
            />
          </label>
          {imagePreview && (
            <div>
              <img src={imagePreview} alt="Preview" style={{ maxWidth: 200 }} />
              <button type="button" onClick={handleRemoveImage}>Remove</button>
            </div>
          )}
          <label>
            Trait name (optional):
            <input type="text" id="attr1Name" value={form.attr1Name} onChange={handleInputChange} />
          </label>
          <label>
            Trait value (optional):
            <input type="text" id="attr1Value" value={form.attr1Value} onChange={handleInputChange} />
          </label>
          <button type="submit" disabled={!validateForm() || isMinting}>
            {isMinting ? 'Minting...' : 'Mint NFT'}
          </button>
        </form>
        {isSuccess && txData && (
          <div>
            <p>NFT Minted!</p>
            <a
              href={`https://sepolia.etherscan.io/tx/${txData}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#4F46E5', textDecoration: 'underline' }}
            >
              View Transaction on Etherscan
            </a>
          </div>
        )}
        {error && <div style={{ color: 'red' }}>{(error as Error).message}</div>}
      </div>
    </div>
  );
}