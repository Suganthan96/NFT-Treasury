
# 🎨 NFT-Treasury

NFT-Treasury is a Vite-powered React + TypeScript project scaffolded to build a decentralized platform for managing and showcasing NFTs. This project is intended as the foundation for a Web3-based treasury system where users can view, mint, and track NFTs in a performant and modular frontend.

## 🚀 Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Linting**: ESLint (with recommended TypeScript and React rules)
- **Styling**: Tailwind CSS (planned)
- **Smart Contract Integration**: (Planned using Ethers.js / Web3.js)
- **Wallet Connection**: (Planned with MetaMask via `@web3-react` or `wagmi`)

## 📁 Folder Structure

```
NFT-Treasury/
├── public/               # Static files
├── src/
│   ├── assets/           # Images, logos, and media
│   ├── components/       # Reusable React components
│   ├── pages/            # Page-level React components (e.g., Home, Dashboard)
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main app wrapper
│   └── main.tsx          # Entry point
├── scripts/              # Deployment scripts or blockchain interaction
├── .eslintrc             # ESLint config
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite configuration
└── package.json
```

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Suganthan96/NFT-Treasury.git
cd NFT-Treasury
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Your app should now be running at [http://localhost:5173](http://localhost:5173)

## ✅ Linting

Run the linter with:

```bash
npm run lint
```

## 📦 Build for Production

```bash
npm run build
```

## 🔍 Future Improvements

- Integrate ERC-721 and ERC-1155 support
- Add MetaMask wallet authentication
- Display NFT metadata from IPFS or other decentralized storage
- Implement smart contract interactions

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change or add.

---

## 📄 License

This project is licensed under the MIT License.

---

## ✨ Author

Made with 💻 by [Suganthan](https://github.com/Suganthan96)
