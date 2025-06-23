import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  phantomWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { WagmiProvider, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        walletConnectWallet,
        phantomWallet,
      ],
    },
  ],
  {
    appName: 'NFT Minter',
    projectId: '64f747071044dfdaf878267ba0e66076',
  }
);

const config = createConfig({
  connectors,
  chains: [sepolia],
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
