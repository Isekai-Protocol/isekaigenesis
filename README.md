# IsekaiGenesis

Node.js repo: https://github.com/Isekai-Protocol/isekai-node

Smart Contract: https://github.com/Isekai-Protocol/Tier-1-NFT-Minting


Isekai NFT Launchpad is an NFT launchpad for the Isekai Platform. It supports three different kinds of minting functions for users, such as OG mint, whitelist min and public mint. 

Only users with Merkle proof are valid for OG and Whitelist mint. Merkle root is generated using wallet addresses, and the function is fulfilled by node.js.  Our contract is highly flexible, even if it has been deployed, you can still change every aspect of the minting configs.  We also provide many configs on our front end, so users don't have to interact with the smart contract each time.  If users exceed the mint amount or have an insufficient fund for the mint or the gas, our front end will prevent them from interacting with the smart contract and shows a relevant alert. 

It is an easy-to-use launchpad, anyone can change its style and change its configs.


We use HTML, CSS and Javascript to design the front end and node.js for Merkle proof.  Users interact with the front end to mint NFTs and node.js will verify if they have the right Merkle proof to qualify for the minting. 

