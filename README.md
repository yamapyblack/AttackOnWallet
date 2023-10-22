# AttackOnWallet

**Attack on Wallet** (not Attack on Titan) is an on-chain battle game where players' characters are uniquely generated based on their wallets.

## Description

Attack on Wallet engages in 1 vs 1 turn-based battles reminiscent of classic Pokémon duels.

Despite being fully on-chain, the game offers a smooth user experience. Every action sends a transaction, yet the process remains stress-free, due to the innovative use of Account Abstraction with Session keys.

These session keys, generated for each battles, ensure an optimal gaming experience with minimal compromise on security.

From connecting your wallet to minting, creating AA wallet, replenishing gas, and diving into battles, **Attack on Wallet** promises a seamless gaming journey.

## How it's made

Typical Account Abstraction (AA) wallets necessitate a signature for each transaction. However, in the midst of a real-time battle, prompting players to continuously open MetaMask and sign can be disruptive to the gaming experience.

To address this, we introduce a session key at the battle's onset. Transactions are then seamlessly carried out using this key for the duration of the battle. The private session key is retained in localStorage.

Keeping a smooth onboarding experience in mind, we've streamlined multiple processes. NFT minting, AA wallet creation, and gas replenishment are consolidated into a singular transaction.

During battle, all HP are stored on-chain. When attack commands are executed, transactions are sent, and the HP adjustments are tracked via on-chain events. Although there is an inherent delay in fetching these transactions, our frontend swiftly renders attack effects, ensuring the gameplay remains fluid and engaging.

We choose Alchemy as our AA Bundler.

## Future

By offering a seamless UX and featuring original characters, we will accelerate adoption of onchain games
