# js-mcs-sdk

[![Made by FilSwan](https://img.shields.io/badge/made%20by-FilSwan-green.svg)](https://www.filswan.com/)
[![Chat on discord](https://img.shields.io/badge/join%20-discord-brightgreen.svg)](https://discord.com/invite/KKGhy8ZqzK)

# Table of Contents <!-- omit in toc -->

- [Introduction](#introduction)
  - [Prerequisites](#prerequisites)
- [MCS API](#mcs-api)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Initialize SDK](#initialize-sdk)
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
- **POST** upload file/folder to bucket
- **POST** rename bucket
- **GET** download file from bucket
- **DELETE** delete bucket
- **DELETE** delete file from bucket

# Prerequisites

[Node.js](https://nodejs.org/en/) - v16.13.0 (npm v8.1.0) \
Polygon Wallet - [Metamask Tutorial](https://docs.filswan.com/getting-started/beginner-walkthrough/public-testnet/setup-metamask) \
API Key and Access Token - Obtained via https://multichain.storage

# Getting Started

Instructions for developers working with MCS SDK and API.

## Installation

In a new working directory, use `npm init -y` to initialize a Node.js project.
Install the package using npm

```
npm init -y
npm install js-mcs-sdk
```

## Set Up Environment Variables

Set your API Key and Access Token as environment variables in a `.env` file. Optionally include your wallet's private key and RPC-url .

```js
API_KEY=<API_KEY>
ACCESS_TOKEN=<ACCESS_TOKEN>

# optional
PRIVATE_KEY=<PRIVATE_KEY>
RPC_URL=<RPC_URL>
```

## Initalize SDK

To begin using the SDK, we first need to require the package at the top of the script and call the `initialize` function

```js
require('dotenv').config()
const { mcsSDK } = require('js-mcs-sdk')

async function main() {
  // initialize js-mcs-sdk
  const mcs = await mcsSDK.initialize({
    apiKey: process.env.API_KEY,
    accessToken: process.env.ACCESS_TOKEN,
  })
}

main()
```

# Example Usage

## Uploading a File

Example of uploading a single file using the MCS SDK. View the complete [documentation](https://docs.filswan.com/multichain.storage/developer-quickstart/sdk/js-mcs-sdk/mcs-functions/upload-files)

```js
require('dotenv').config()
const { mcsSDK } = require('js-mcs-sdk')

async function main() {
  // initialize js-mcs-sdk
  const mcs = await mcsSDK.initialize({
    accessToken: process.env.ACCESS_TOKEN,
    apiKey: process.env.API_KEY,
    privateKey: process.env.PRIVATE_KEY,
  })

  const testFile = JSON.stringify({ address: mcs.walletAddress })
  const fileArray = [{ fileName: `${mcs.walletAddress}.txt`, file: testFile }]

  const uploadResponse = await mcs.upload(fileArray)
  console.log(uploadResponse)
}

main()
```

## Paying for File Storage

```js
require('dotenv').config()
const { mcsSDK } = require('js-mcs-sdk')

async function main() {
  const SOURCE_FILE_UPLOAD_ID = ''
  const FILE_SIZE = ''
  const MIN_AMOUNT = '' // leave blank to automatically estimate price

  const mcs = await mcsSDK.initialize({
    accessToken: process.env.ACCESS_TOKEN,
    apiKey: process.env.API_KEY,
    privateKey: process.env.PRIVATE_KEY,
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
    apiKey: process.env.API_KEY,
    accessToken: process.env.ACCESS_TOKEN,
  })

  console.log(await mcs.getBuckets())
}

main()
```

### Create and Delete Buckets

Users can create and delete Buckets.

```js
await mcs.createBucket(<bucketName>)
await mcs.deleteBucket(<bucketUid>)
```

### Upload and Delete Files

Uploading a file to a bucket is similar to MCS. However 2 files cannot have the same name within 1 bucket. Therefore, you may want to use different file names when uploading the same file multiple times to a bucket.

```js
await mcs.uploadToBucket(<filePath>, <bucketName>, <folderName>)
await mcs.deleteFile(<fileId>)
```

### Download Files

After uploading a file to a Bucket, it is possible to retreive the file using the Bucket name and file name. The `outputDirectory` is optional and defaults to the current directory.

```js
await mcs.downloadFile(<fileId>, <outputDirectory>)
```

# Testing

There are some example scripts in the `sdk-test` folder. To run the examples, clone the repo, `cd` into the `sdk-test` directory, and install the necessary dependencies.

```
git clone https://github.com/filswan/js-mcs-sdk/ ./examples
cd examples/sdk-test
npm install
```

`node upload.js` uploads a simple file (you can edit the `FILE_NAME` and `FILE_PATH`)

`node makePayment.js` pays for a file using its `source file upload id` (you can edit the `FILE_NAME` and `FILE_PATH`) (will throw an Error if the file cannot be paid for)

`node mintAsset.js` mints a file as a NFT by providing `source file upload id` and other information

Alternatively, you can run the test-script to test each SDK function using mocha.js and chai.js
(needs to have `PRIVATE_KEY` set in `.env` file.

```
mocha mcs.test.js
```

# Documentation

For more examples please see the [SDK documentation](https://docs.filswan.com/multi-chain-storage/developer-quickstart/sdk/js-mcs-sdk) or the test directory in the [sdk-test repository](https://github.com/filswan/js-mcs-sdk/tree/main/sdk-test)

# Contributing

Feel free to join in and discuss. Suggestions are welcome! [Open an issue](https://github.com/filswan/js-mcs-sdk/issues) or [Join the Discord](https://discord.com/invite/KKGhy8ZqzK)!

## Sponsors

This project is sponsored by Filecoin Foundation

[Flink SDK - A data provider offers Chainlink Oracle service for Filecoin Network ](https://github.com/filecoin-project/devgrants/issues/463)

<img src="https://github.com/filswan/flink/blob/main/filecoin.png" width="200">
