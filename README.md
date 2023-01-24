# Multichain Storage SDK - Javascript

[![Made by FilSwan](https://img.shields.io/badge/made%20by-FilSwan-green.svg)](https://www.filswan.com/)
[![Chat on discord](https://img.shields.io/badge/join%20-discord-brightgreen.svg)](https://discord.com/invite/KKGhy8ZqzK)

A javascript software development kit for the Multi-Chain Storage (MCS) https://www.multichain.storage/ service. It provides a convenient interface for working with the MCS API from a web browser or Node.js. This SDK has the following functionalities:

# Table of Contents <!-- omit in toc -->

- [Getting Started](#getting-started)
  - [Installation](#installation)
- [Examples](#examples)
  - [For Onchain Storage](#for-onchain-storage)
  - [For Buckets Storage](#for-buckets-storage)
- [Functions](#functions)
- [Contributing](#contributing)

<a name="getting-started"></a>

## 🆕 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) - v16.13.0 (npm v8.1.0)
- API Key and Access Token - Generated via https://multichain.storage

### Installation

In a new working directory, use `npm init -y` to initialize a Node.js project.
Install the package using npm

```
npm init -y
npm install js-mcs-sdk
```

### Setup Credentials

Create a .env file that includes the following content. Optionally include your wallet's private key and RPC-url.

```bash
API_KEY='<API_KEY>'
ACCESS_TOKEN='<ACCESS_TOKEN>'

# for onchain storage only
PRIVATE_KEY='<PRIVATE_KEY>'
RPC_URL='<RPC_URL>'
```

### Initialize SDK

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

<a name="examples"></a>

## 👨‍💻 Examples

### Bucket Storage

- Create a bucket

  ```js
  let bucketData = await mcs.createBucket(<BUCKET_NAME>)
  console.log(bucketData)
  ```

- Upload a file to the bucket

  ```js
  let fileData = mcs.uploadToBucket(<FILE_PATH>, <BUCKET_UID>, prefix="")
  console.log(fileData)
  ```

For more examples, please see the [SDK documentation.](https://docs.filswan.com/multi-chain-storage/developer-quickstart/sdk)

### Onchain Storage

Onchain storage is designed for storing file information in the smart contract. It requires payment for each file.

To use certain Onchain Storage features (upload, payment, minting), you will need to set up the web3 environment first.

- Setup Web3

  ```js
  await mcs.setupWeb3(process.env.PRIVATE_KEY, process.env.RPC_URL)
  console.log(mcs.web3Initialized) // true
  ```

- Upload File to Onchain storage

  ```js
  let uploadResponse = await mcs.upload([{ fileName: <FILE_NAME>, file: fs.createReadStream(<FILE_PATH>) }])
  console.log(uploadResponse)
  ```

- Pay for file storage
  after uploading, the response should return the `source_file_upload_id` and the file size.
  ```js
  let tx = await mcs.makePayment(<SOURCE_FILE_UPLOAD_ID>, <FILE_SIZE>)
  console.log(transaction hash: ' + tx.transactionHash)
  ```

<a name="functions"></a>

## ℹ️ Functions

### For Onchain Storage

---

- **POST** Upload file to Filswan IPFS gateway
- **GET** List of files uploaded
- **GET** Files by cid
- **GET** Status from filecoin
- **CONTRACT** Make payment to swan filecoin storage gateway
- **CONTRACT** Mint asset as NFT

### For Buckets Storage

---

- **POST** Create a bucket
- **POST** Create a folder
- **POST** Upload File to the bucket
- **POST** Rename bucket
- **GET** Delete bucket
- **GET** Bucket List
- **GET** File List
- **GET** File information
- **GET** Delete File

<a name="contributing"></a>

## 🌐 Contributing

Feel free to join in and discuss. Suggestions are welcome! [Open an issue](https://github.com/filswan/js-mcs-sdk/issues) or [Join the Discord](https://discord.com/invite/KKGhy8ZqzK)!

### Sponsors

Filecoin Foundation sponsors this project

[Flink SDK - A data provider offers Chainlink Oracle service for Filecoin Network ](https://github.com/filecoin-project/devgrants/issues/463)

<img src="https://github.com/filswan/flink/blob/main/filecoin.png" width="200">
