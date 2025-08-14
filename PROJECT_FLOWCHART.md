# NFT Treasury Project Flowchart

## Main Application Flow

```mermaid
flowchart TD
    A[User Visits Website] --> B[Connect Wallet]
    B --> C{Wallet Connected?}
    C -->|No| D[Show Connect Button]
    C -->|Yes| E[Get User Address & Balance]
    
    E --> F[Check NFT Count via Alchemy]
    F --> G[Determine Membership Tier]
    G --> H{NFT Count?}
    
    H -->|0 NFTs| I[No Membership - Bronze Only]
    H -->|1-2 NFTs| J[Bronze Tier]
    H -->|3-4 NFTs| K[Silver Tier]
    H -->|5+ NFTs| L[Gold Tier]
    
    I --> M[Show Bronze NFTs Only]
    J --> M
    K --> N[Show Bronze + Silver NFTs]
    L --> O[Show All Tiers + Gold Exclusive]
    
    M --> P[User Selects NFT]
    N --> P
    O --> P
    
    P --> Q[Calculate Price with Discounts]
    Q --> R{Gold Member?}
    R -->|Yes| S[Apply 30% Discount]
    R -->|No| T[Regular Price]
    
    S --> U[Process NFT Purchase]
    T --> U
    
    U --> V[Upload Image to IPFS]
    V --> W[Create Metadata]
    W --> X[Upload Metadata to IPFS]
    X --> Y[Mint NFT on Blockchain]
    Y --> Z[Transaction Complete]
    
    Z --> AA[Update NFT Count]
    AA --> G
```

## Membership Verification Flow

```mermaid
flowchart TD
    A[User Wallet Connected] --> B[Get NFT Count via Alchemy]
    B --> C[Query BitBadges for Existing Badges]
    C --> D[Check Webhook Benefits]
    
    D --> E{Has BitBadges?}
    E -->|Yes| F[Grant Tier Access]
    E -->|No| G{Has Webhook Benefits?}
    
    G -->|Yes| F
    G -->|No| H[Check NFT Count for Eligibility]
    
    H --> I{NFT Count >= Tier Requirement?}
    I -->|Yes| J[Show Claim Badge Option]
    I -->|No| K[Show Requirements]
    
    J --> L[User Claims Badge]
    L --> M[Store Badge in BitBadges]
    M --> N[Activate Webhook Benefits]
    N --> F
    
    F --> O[Update UI with Tier Benefits]
    O --> P[Show Exclusive Content]
```

## NFT Purchase Flow

```mermaid
flowchart TD
    A[User Clicks Buy NFT] --> B{Wallet Connected?}
    B -->|No| C[Show Connect Wallet Alert]
    B -->|Yes| D[Check Membership Status]
    
    D --> E{Gold Member?}
    E -->|Yes| F[Calculate 30% Discount]
    E -->|No| G[Use Regular Price]
    
    F --> H[Set Loading State]
    G --> H
    
    H --> I[Fetch Image from Public Folder]
    I --> J[Convert to Blob]
    J --> K[Upload to Pinata IPFS]
    
    K --> L[Create NFT Metadata]
    L --> M[Add Tier-Specific Attributes]
    M --> N[Upload Metadata to IPFS]
    
    N --> O[Call Smart Contract Mint Function]
    O --> P[Wait for Transaction]
    
    P --> Q{Transaction Success?}
    Q -->|Yes| R[Show Success Message]
    Q -->|No| S[Show Error Message]
    
    R --> T[Add to Purchased NFTs]
    T --> U[Update NFT Count]
    S --> V[Reset Loading State]
    U --> V
```

## Backend Webhook System

```mermaid
flowchart TD
    A[BitBadges Badge Claimed] --> B[Webhook Triggered]
    B --> C[Extract User Data]
    C --> D[Determine Tier from Collection ID]
    
    D --> E{Valid Claim?}
    E -->|No| F[Return Error]
    E -->|Yes| G[Store Membership Data]
    
    G --> H[Get Tier Benefits]
    H --> I[Send Welcome Email]
    I --> J{Gold Tier?}
    
    J -->|Yes| K[Activate Gold VIP Features]
    J -->|No| L[Activate Standard Benefits]
    
    K --> M[Enable Gold Analytics]
    K --> N[Enable VIP Events]
    K --> O[Enable Exclusive NFTs]
    
    L --> P[Enable Discord Access]
    P --> Q[Enable Priority Minting]
    
    M --> R[Store Benefits in Global Memory]
    N --> R
    O --> R
    Q --> R
    
    R --> S[Return Success Response]
```

## Tier System Architecture

```mermaid
flowchart LR
    A[Bronze Tier<br/>1+ NFTs] --> B[Basic Access<br/>12 Standard NFTs<br/>Website Access]
    
    C[Silver Tier<br/>3+ NFTs] --> D[Premium Access<br/>Bronze + 6 Premium NFTs<br/>Discord Access<br/>Priority Minting]
    
    E[Gold Tier<br/>5+ NFTs] --> F[VIP Access<br/>All Previous + 4 Exclusive Apes<br/>30% Discount<br/>Analytics Dashboard<br/>VIP Events<br/>Early Access]
    
    B --> G[Regular Pricing]
    D --> G
    F --> H[Discounted Pricing]
    
    G --> I[Standard Features]
    H --> J[Premium Features<br/>+ Exclusive Content]
```

## Technology Stack Integration

```mermaid
flowchart TD
    A[Frontend - React + TypeScript] --> B[Wallet Integration - Rainbow Kit + Wagmi]
    B --> C[NFT Verification - Alchemy SDK]
    C --> D[Membership System - BitBadges API]
    
    D --> E[Backend - Node.js + Express]
    E --> F[IPFS Storage - Pinata]
    F --> G[Smart Contracts - Ethereum/Sepolia]
    
    G --> H[Email System - Nodemailer]
    H --> I[Webhook System - Real-time Benefits]
    I --> J[Database - In-Memory Storage]
    
    A --> K[UI Components<br/>- MembershipGatedFeature<br/>- GoldVIPDashboard<br/>- NFTCard Grid]
    
    E --> L[API Endpoints<br/>- /api/webhook<br/>- /api/gold-benefits<br/>- /api/discord-invite<br/>- /api/pinata-upload]
```

## Security & Access Control Flow

```mermaid
flowchart TD
    A[User Request] --> B[Verify Wallet Connection]
    B --> C[Check NFT Ownership on Blockchain]
    C --> D[Validate with Alchemy SDK]
    D --> E[Cross-reference BitBadges]
    E --> F[Check Webhook Benefits]
    
    F --> G{Multiple Verification Layers Pass?}
    G -->|No| H[Deny Access]
    G -->|Yes| I[Grant Tier-Appropriate Access]
    
    H --> J[Show Access Denied Message]
    I --> K[Show Exclusive Content]
    
    K --> L[Apply Tier-Specific Benefits<br/>- Pricing Discounts<br/>- Exclusive Collections<br/>- Special Features]
```

This comprehensive flowchart shows how your NFT Treasury project implements a secure, decentralized membership system using blockchain verification, tiered access control, and automated benefit distribution.
