---

# NFT-Treasury

*NFT-Treasury* is a Vite-powered React + TypeScript project designed to serve as a decentralized platform for managing and showcasing NFTs. This project provides a foundational frontend for a Web3-based NFT treasury system where users can view, mint, and track NFTs efficiently.

## Technology Stack

* *Frontend*: React, TypeScript, Vite
* *Linting*: ESLint (configured for TypeScript and React)
* *Styling*: CSS (planned)
* *Smart Contract Integration*: Planned using Ethers.js or Web3.js
* *Wallet Connection*: Planned with MetaMask via @web3-react or wagmi

## Setup Instructions

### 1. Clone the Repository

bash
git clone https://github.com/Suganthan96/NFT-Treasury.git
cd NFT-Treasury


### 2. Install Dependencies

bash
npm install


### 3. Generate and Install SSL Certificate (Optional for HTTPS)

To use https://localhost and avoid MetaMask blocking http connections:

1. *Generate SSL certificate using OpenSSL:*

   bash
   mkdir cert
   openssl req -x509 -newkey rsa:2048 -nodes -keyout cert/key.pem -out cert/cert.pem -days 365
   

2. *Trust the certificate:*

   * On Windows:

     * Double-click cert/cert.pem
     * Click "Install Certificate"
     * Select "Local Machine"
     * Choose "Place all certificates in the following store"
     * Browse and select "Trusted Root Certification Authorities"

   * On macOS:

     * Open cert/cert.pem in Keychain Access
     * Set Trust to "Always Trust"

### 4. Configure Vite to Use HTTPS

Edit vite.config.ts to include:

ts
import fs from 'fs';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('./cert/key.pem'),
      cert: fs.readFileSync('./cert/cert.pem'),
    },
    port: 5173,
  }
});


### 5. Run the Development Server

npm run dev


Application will run at https://localhost:5173

## Linting

To run ESLint:

npm run lint


## Build for Production

npm run build


## Planned Features

* ERC-721 and ERC-1155 support
* MetaMask wallet authentication
* Display NFT metadata from decentralized storage (IPFS, Arweave, etc.)
* Smart contract interaction support

## Contributing

Pull requests are welcome. For significant feature proposals, please open an issue first to discuss changes.

## License

This project is licensed under the MIT License.


---

