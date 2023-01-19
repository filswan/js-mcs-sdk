# js-mcs-sdk

[![Made by FilSwan](https://img.shields.io/badge/made%20by-FilSwan-green.svg)](https://www.filswan.com/)
[![Chat on discord](https://img.shields.io/badge/join%20-discord-brightgreen.svg)](https://discord.com/invite/KKGhy8ZqzK)

# Table of Contents <!-- omit in toc -->

- [Introduction](#introduction)
  - [For Onchain Storage](#for-onchain-storage)
  - [For Buckets Storage](#for-buckets-storage)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Examples](#examples)
- [Contributing](#contributing)

<a name="introduction"></a>

# ℹ️ Introduction

A javascript software development kit for the Multi-Chain Storage (MCS) https://www.multichain.storage/ service. It provides a convenient interface for working with the MCS API from a web browser or Node.js. This SDK has the following functionalities:

## For Onchain Storage

- **POST** Upload file to Filswan IPFS gateway
- **GET** List of files uploaded
- **GET** Files by cid
- **GET** Status from filecoin
- **CONTRACT** Make payment to swan filecoin storage gateway
- **CONTRACT** Mint asset as NFT

## For Buckets Storage

- **POST** Create a bucket
- **POST** Create a folder
- **POST** Upload File to the bucket
- **POST** Rename bucket
- **GET** Delete bucket
- **GET** Bucket List
- **GET** File List
- **GET** File information
- **GET** Delete File

<a name="getting-started"></a>

# 🆕 Getting Started

## Prerequisites

- [Node.js](https://nodejs.org/en/) - v16.13.0 (npm v8.1.0) \
- Polygon Wallet - [Metamask Tutorial](https://docs.filswan.com/getting-started/beginner-walkthrough/public-testnet/setup-metamask) \
- Polygon Mainnet RPC endpoint - https://polygon-rpc.com (USDC and Matic are required if you want to make payment.)
- API Key and Access Token - Obtained via https://multichain.storage

## Installation

In a new working directory, use `npm init -y` to initialize a Node.js project.
Install the package using npm

```
npm init -y
npm install js-mcs-sdk
```

<a name="examples"></a>

# 👨‍💻 Examples

Here is the demo to get you started; you can get more information in the [SDK documentation.](https://docs.filswan.com/multi-chain-storage/developer-quickstart/sdk)

1. Set Up Environment Variables

   Create a .env file that includes the following content. Optionally include your wallet's private key and RPC-url.

   ```bash
   API_KEY='<API_KEY>'
   ACCESS_TOKEN='<ACCESS_TOKEN>'

   # optional
   PRIVATE_KEY='<PRIVATE_KEY>'
   RPC_URL='<RPC_URL>'
   ```

   1. **_The `RPC_URL` is the one mentioned above_**
   2. **_`PRIVATE_KEY` will be obtained from the wallet_**
   3. **_The `API_KEY` and `ACCESS_TOKEN` can be generated from the Settings page on [multichain.storage](#https://www.multichain.storage/)_**

2) Initalize SDK

   To begin using the SDK, we first need to require the package at the top of the script and call the `initialize` function

   ```js
   require('dotenv').config()
   const { mcsSDK } = require('js-mcs-sdk')

   async function main() {
     // initialize js-mcs-sdk
     const mcs = await mcsSDK.initialize({
       apiKey: process.env.API_KEY,
       accessToken: process.env.ACCESS_TOKEN,
       chainName: 'polygon.mainnet',
     })
   }

   main()
   ```

   Optionally, you can pass `privateKey` to use the onChain Storage upload and payment functions and pass `rpcUrl` if you wish to use your own RPC URL (this SDK uses https://polygon-rpc.com/ by default).

   This SDK is also compatiable with our calibration environment on the Mumbai testnet. Use `chainName: 'polygon.mumbai'` and generate a new API KEY from [calibration-mcs.filswan.com/](https://calibration-mcs.filswan.com/)

   ### For Onchain Storage

   To use certain Onchain Storage features (upload, payment, minting), you will need to set up the web3 environment first.

   - Setup Web3

   ```js
   await mcs.setupWeb3(<PRIVATE_KEY>, <RPC_URL>)
   console.log(mcs.web3Initialized) // true
   ```

   - Upload File to Onchain storage

   ```js
   console.log(await mcs.upload([{ fileName: <FILE_NAME>, file: fs.createReadStream(<FILE_PATH>) }]))
   ```

   ### For Bucket Storage

   - Create a bucket

   ```js
   console.log(await mcs.createBucket(<BUCKET_NAME>))
   ```

   - Upload a file to the bucket

   ```js
   console.log(mcs.uploadToBucket(<FILE_PATH>,<BUCKET_UID>,prefix=''))
   ```

   _The prefix field defines the file-folder relationship, leaving it blank if the file exists directly in the Bucket or the folder name if the file exists in a folder that already exists in the Bucket._

   **_You have to create a bucket before you upload a file._**

   **_Note that if you upload a file with the prefix field defined in a folder that has not yet been created, you will not be able to see the file until you create a folder with the same name._**

For more examples, please see the [SDK documentation.](https://docs.filswan.com/multi-chain-storage/developer-quickstart/sdk)

<a name="contributing"></a>

# 🌐 Contributing

Feel free to join in and discuss. Suggestions are welcome! [Open an issue](https://github.com/filswan/js-mcs-sdk/issues) or [Join the Discord](https://discord.com/invite/KKGhy8ZqzK)!

## Sponsors

Filecoin Foundation sponsors this project

[Flink SDK - A data provider offers Chainlink Oracle service for Filecoin Network ](https://github.com/filecoin-project/devgrants/issues/463)

<img src="https://github.com/filswan/flink/blob/main/filecoin.png" width="200">
