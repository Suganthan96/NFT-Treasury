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
  // const [success, setSuccess] = useState(false);
  // const [txHash, setTxHash] = useState('');
  // const [ipfsHash, setIpfsHash] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { writeContract, isSuccess, data: txData, error } = useWriteContract();

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
    // setSuccess(false);
    // setTxHash('');
    // setIpfsHash('');
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
      // setIpfsHash(imageCID);

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
      // setIpfsHash(metaCID);

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
    <div className="minter-page">
      <Navbar />
      
      <div className="minter-container">
        <div className="minter-header">
          <h1 className="minter-title">Create Your NFT</h1>
          <p className="minter-subtitle">Mint unique digital assets on the blockchain</p>
        </div>

        {/* Wallet Connection Section */}
        <div className="wallet-section">
          <ConnectButton />
          {isConnected && address && (
            <div className="wallet-info">
              <div className="wallet-address">
                <span className="label">Connected:</span>
                <span className="address">{address.slice(0, 6)}...{address.slice(-4)}</span>
              </div>
              <div className="wallet-balance">
                <span className="balance">{balance?.formatted} {balance?.symbol}</span>
              </div>
            </div>
          )}
        </div>

        <div className="minter-content">
          {/* Preview Section */}
          <div className="preview-section">
            <h3>NFT Preview</h3>
            <div className="nft-preview-card">
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="NFT Preview" />
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={handleRemoveImage}
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="image-placeholder">
                  <div className="placeholder-icon">🖼️</div>
                  <p>Upload an image to see preview</p>
                </div>
              )}
              
              <div className="preview-info">
                <h4 className="preview-name">{form.name || 'NFT Name'}</h4>
                <p className="preview-description">{form.description || 'NFT Description'}</p>
                {form.attr1Name && form.attr1Value && (
                  <div className="preview-attributes">
                    <span className="attr-label">{form.attr1Name}:</span>
                    <span className="attr-value">{form.attr1Value}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="form-section">
            <h3>NFT Details</h3>
            <form onSubmit={handleMint} className="minter-form">
              
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Name <span className="required">*</span>
                </label>
                <input 
                  type="text" 
                  id="name" 
                  className="form-input"
                  value={form.name} 
                  onChange={handleInputChange} 
                  placeholder="Enter NFT name"
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description <span className="required">*</span>
                </label>
                <textarea 
                  id="description" 
                  className="form-textarea"
                  value={form.description} 
                  onChange={handleInputChange} 
                  placeholder="Describe your NFT"
                  rows={4}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Image <span className="required">*</span>
                </label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    ref={imageInputRef}
                    className="file-input"
                    onChange={e => {
                      const files = e.target.files;
                      if (files && files.length > 0) handleImageUpload(files[0]);
                    }}
                    required
                  />
                  <div className="file-input-label">
                    <span className="file-icon">📁</span>
                    <span>{selectedImage ? selectedImage.name : 'Choose image file'}</span>
                    <span className="file-hint">Max size: 10MB</span>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="attr1Name" className="form-label">
                    Trait Name <span className="optional">(optional)</span>
                  </label>
                  <input 
                    type="text" 
                    id="attr1Name" 
                    className="form-input"
                    value={form.attr1Name} 
                    onChange={handleInputChange} 
                    placeholder="e.g., Rarity"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="attr1Value" className="form-label">
                    Trait Value <span className="optional">(optional)</span>
                  </label>
                  <input 
                    type="text" 
                    id="attr1Value" 
                    className="form-input"
                    value={form.attr1Value} 
                    onChange={handleInputChange} 
                    placeholder="e.g., Legendary"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="mint-button"
                disabled={!validateForm() || isMinting}
              >
                {isMinting ? (
                  <>
                    <span className="loading-spinner"></span>
                    Minting...
                  </>
                ) : (
                  <>
                    <span className="mint-icon">✨</span>
                    Mint NFT
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Success Message */}
        {isSuccess && txData && (
          <div className="success-message">
            <div className="success-icon">🎉</div>
            <h3>NFT Minted Successfully!</h3>
            <p>Your NFT has been created and minted to the blockchain.</p>
            <a
              href={`https://sepolia.etherscan.io/tx/${txData}`}
              target="_blank"
              rel="noopener noreferrer"
              className="etherscan-link"
            >
              View on Etherscan →
            </a>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <p>{(error as Error).message}</p>
          </div>
        )}
      </div>
    </div>
  );
}