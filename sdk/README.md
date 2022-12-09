# js-mcs-sdk

[![Made by FilSwan](https://img.shields.io/badge/made%20by-FilSwan-green.svg)](https://www.filswan.com/)
[![Chat on discord](https://img.shields.io/badge/join%20-discord-brightgreen.svg)](https://discord.com/invite/KKGhy8ZqzK)

# Table of Contents <!-- omit in toc -->

- [Introduction](#introduction)
  - [Prerequisites](#prerequisites)
- [MCS API](#mcs-api)
- [Usage](#usage)
  - [Installation](#installation)
  - [Getting Started](#getting-started)
  - [Using Buckets](#using-buckets)
  - [Documentation](#documentation)
- [Contributing](#contributing)

# Introduction

A javascript software development kit for the Multi-Chain Storage (MCS) https://www.multichain.storage/ service. It provides a convenient interface for working with the MCS API from a web browser or Node.js. This SDK has the following functionalities:

- **POST** upload file to Filswan IPFS gate way
- **POST** make payment to swan filecoin storage gate way
- **POST** mint asset as NFT
- **GET** list of files uploaded
- **GET** files by cid
- **GET** status from filecoin

Buckets Functions:

- **GET** list bucket(s)
- **PUT** create bucket
- **POST** upload file to bucket
- **GET** download file from bucket
- **DELETE** delete bucket(s) and file(s)

# Prerequisites

[Node.js](https://nodejs.org/en/) - v16.13.0 (npm v8.1.0) \
Polygon Mumbai Testnet Wallet - [Metamask Tutorial](https://docs.filswan.com/getting-started/beginner-walkthrough/public-testnet/setup-metamask) \
Polygon Mainnet RPC - [Signup via Alchemy](https://www.alchemy.com/)

You will also need USDC and MATIC balance to use this SDK.

# MCS API

For more information about the API usage, check out the [MCS API documentation](https://docs.filswan.com/development-resource/mcp-api-1).

# Usage

Instructions for developers working with MCS SDK and API.

## Installation

Install the package using npm

```
npm init -y
npm install js-mcs-sdk
```

## Getting Started

### Set Up Environment Variables

First you should set your wallet's private key and RPC-url as environment variables in a `.env` file.

```js
PRIVATE_KEY=<PRIVATE_KEY>
RPC_URL=<RPC_URL>
```

### Upload File

Example of uploading a single file using the MCS SDK. View the complete [documentation](https://docs.filswan.com/multichain.storage/developer-quickstart/sdk/js-mcs-sdk/mcs-functions/upload-files)

```js
require('dotenv').config()
const { mcsSDK } = require('js-mcs-sdk')
const fs = require('fs')

async function main() {
  // initialize js-mcs-sdk
  const mcs = await mcsSDK.initialize({
    privateKey: process.env.PRIVATE_KEY,
    rpcUrl: process.env.RPC_URL,
  })

  const testFile = JSON.stringify({ address: mcs.walletAddres })
  const fileArray = [{ fileName: `${mcs.walletAddres}.txt`, file: testFile }]

  const uploadResponse = await mcs.upload(fileArray)
  console.log(uploadResponse)
}

main()
```

### Payment

Currently, on MCS mainnet, users only need to pay if the upload surpasses the free upload coverage.

```js
require('dotenv').config()
const { mcsSDK } = require('js-mcs-sdk')

async function main() {
  const SOURCE_FILE_UPLOAD_ID = ''
  const FILE_SIZE = ''
  const MIN_AMOUNT = '' // leave blank to automatically estimate price

  const mcs = await mcsSDK.initialize({
    privateKey: process.env.PRIVATE_KEY,
    rpcUrl: process.env.RPC_URL,
  })

  const tx = await mcs.makePayment(SOURCE_FILE_UPLOAD_ID, MIN_AMOUNT, FILE_SIZE)
  console.log('transaction hash: ' + tx.transactionHash)
}

main()
```

## Using Buckets

There are multiple functions provided by js-mcs-sdk to interact with buckets.

### Check Bucket Information

You can check bucket and file information, including `name`. `id`, `session policy`, etc

```
require('dotenv').config()
const { mcsSDK } = require('js-mcs-sdk')

async function main() {
  const mcs = await mcsSDK.initialize({
    privateKey: process.env.PRIVATE_KEY,
    rpcUrl: process.env.RPC_URL,
  })

  BUCKET_NAME='' // leave blank to get all buckets
  console.log(await mcs.getBuckets(BUCKET_NAME))
}

main()
```

### Create and Delete Buckets

Users can create and delete Buckets. (At the current version, only 1 bucket is allow per user)

```js
await mcs.createBucket(<bucketName>)
await mcs.deleteBucket(<bucketId>)
```

### Upload and Delete Files

Uploading a file to a bucket is similar to MCS. However 2 files cannot have the same name within 1 bucket. Therefore, you may want to use different file names when uploading the same file multiple times to a bucket.

```js
await mcs.uploadToBucket(<bucketName>, <fileName>, <filePath>)
await mcs.deleteFileFromBucket(<fileId>)
```

### Download Files

After uploading a file to a Bucket, it is possible to retreive the file using the Bucket name and file name. The `outputDirectory` is optional and defaults to the current directory.

```js
await mcs.downloadFile(<bucketName>, <fileName>, <outputDirectory>)
```

# Testing

There are some example scripts in the `sdk-test` folder. To run the examples, clone the repo, `cd` into the `sdk-test` directory, and install the necessary dependencies.

```
git clone https://github.com/filswan/js-mcs-sdk/ .
cd sdk-test
npm install
```

`node upload.js` uploads a simple file (you can edit the `FILE_NAME` and `FILE_PATH`)

`node makePayment.js` pays for a file using its `source file upload id` (you can edit the `FILE_NAME` and `FILE_PATH`) (will throw an Error if the file cannot be paid for)

`node mintAsset.js` mints a file as a NFT by providing `source file upload id` and other information

Alternatively, you can run the test-script to test each SDK function using mocha.js and chai.js
(needs to have `PRIVATE_KEY` set in `.env` file.

```
mocha ./mcs.test.js -t 150000
```

# Documentation

For more examples please see the [SDK documentation](https://docs.filswan.com/multi-chain-storage/developer-quickstart/sdk/js-mcs-sdk) or the test directory in the [sdk-test repository](https://github.com/filswan/js-mcs-sdk/tree/main/sdk-test), which contains sample code for all SDK functionalities

# Contributing

Feel free to join in and discuss. Suggestions are welcome! [Open an issue](https://github.com/filswan/js-mcs-sdk/issues) or [Join the Discord](https://discord.com/invite/KKGhy8ZqzK)!

## Sponsors

This project is sponsored by Filecoin Foundation

[Flink SDK - A data provider offers Chainlink Oracle service for Filecoin Network ](https://github.com/filecoin-project/devgrants/issues/463)

<img src="https://github.com/filswan/flink/blob/main/filecoin.png" width="200">
