## Installation

### Install the dependencies:

```bash
npm install
```

## Getting Started

1. Update the .env file with your Alchemy API key(s):

```bash
MUMBAI_ALCHEMY_API_URL=https://polygon-mumbai.g.alchemy.com/v2/<YOUR_API_KEY>
```

2. Update the env.mjs file with your Alchemy API URL:

```javascript
export const alchemyApiKey = "<your-api-key>";
```

3. Update the configs/clientConfigs.ts file with your contract addresses and policy ids:

```typescript
export const serverConfigs: Record<number, ServerConfiguration> = {
  [polygonMumbai.id]: {
    nftContractAddress: "<your-nft-contract-address>",
    simpleAccountFactoryAddress: "<your-simple-account-factory-address>",
    gasManagerPolicyId: "<your-gas-manager-policy-id>",
    chain: polygonMumbai,
  },
  // Repeat for other chains as needed
};
```

4. Update the serverConfigs.ts file with your alchemy API keys:

```typescript
const API_URLs: Record<number, string> = {
  [polygonMumbai.id]: env.MUMBAI_ALCHEMY_API_URL,
  // Repeat for other chains as needed...
};
```

5. Start the app:

```bash
npm run dev
```
