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

Set your API Key and Access Token as environment variables in a `.env` file. Optionally include your wallet's private key and RPC-url.

```bash
API_KEY='<API_KEY>'
ACCESS_TOKEN='<ACCESS_TOKEN>'

# optional
PRIVATE_KEY='<PRIVATE_KEY>'
RPC_URL='<RPC_URL>'
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

Start by creating a script `index.js` in the working directory.
Copy and paste the code snippits below and use `node index.js` to run the script.

## Get Bucket List

Get a list of all your buckets

```js
require('dotenv').config()
const { mcsSDK } = require('js-mcs-sdk')

async function main() {
  const mcs = await mcsSDK.initialize({
    apiKey: process.env.API_KEY,
    accessToken: process.env.ACCESS_TOKEN,
  })

  let bucketList = await mcs.getBuckets()
  console.log(bucketList)
}

main()
```

## Create a Bucket

Provide a Bucket Name and use the `createBucket` function to create a bucket. The `createResponse` will contain the Bucket's UID.

```js
require('dotenv').config()
const { mcsSDK } = require('js-mcs-sdk')

async function main() {
  const mcs = await mcsSDK.initialize({
    apiKey: process.env.API_KEY,
    accessToken: process.env.ACCESS_TOKEN,
  })

  const BUCKET_NAME = ''

  createResponse = await mcs.createBucket(BUCKET_NAME)
  console.log(createResponse)
}

main()
```

## Upload to a Bucket

After creating a Bucket, you can upload file(s) using the Bucket's UID.

```js
require('dotenv').config()
const { mcsSDK } = require('js-mcs-sdk')

async function main() {
  const mcs = await mcsSDK.initialize({
    apiKey: process.env.API_KEY,
    accessToken: process.env.ACCESS_TOKEN,
  })

  const FILE_PATH = ''
  const BUCKET_UID = ''
  const FOLDER_PREFIX = ''

  uploadResponse = await mcs.uploadToBucket(
    FILE_PATH,
    BUCKET_UID,
    FOLDER_PREFIX,
  )
  console.log(uploadResponse)
}

main()
```

## Create Subfolders in a Bucket

After creating a Bucket, you can also create nested subfolders. So when uploading to a subfolder, provide the subfolder path within the bucket ex. `uploadToBucket(FILE_PATH, BUCKET_UID, 'path/to/subfolder')`

```js
require('dotenv').config()
const { mcsSDK } = require('js-mcs-sdk')

async function main() {
  const mcs = await mcsSDK.initialize({
    apiKey: process.env.API_KEY,
    accessToken: process.env.ACCESS_TOKEN,
  })

  const BUCKET_UID = ''
  const FOLDER_NAME = ''
  const FOLDER_PREFIX = ''

  folderResponse = await mcs.createFolder(
    BUCKET_UID,
    FOLDER_NAME,
    FOLDER_PREFIX,
  )
  console.log(folderResponse)
}

main()
```

## Using Onchain Storage

Alternatively to Bucket Storage, users can upload files to IPFS and Filecoin with on-chain proof of storage.

### Uploading a File

Example of uploading a single file. Provide the file name and file path.

```js
require('dotenv').config()
const { mcsSDK } = require('js-mcs-sdk')
const fs = require('fs')

async function main() {
  const mcs = await mcsSDK.initialize({
    accessToken: process.env.ACCESS_TOKEN,
    apiKey: process.env.API_KEY,
  })

  const FILE_NAME = ''
  const FILE_PATH = ''

  const fileArray = [
    { fileName: FILE_NAME, file: fs.createReadStream(FILE_PATH) },
  ]

  const uploadResponse = await mcs.upload(fileArray)
  console.log(uploadResponse)
}

main()
```

## Paying for File Storage

Pay for a file using its unique source file upload ID, its file size, and payment amount.

```js
require('dotenv').config()
const { mcsSDK } = require('js-mcs-sdk')

async function main() {
  const mcs = await mcsSDK.initialize({
    accessToken: process.env.ACCESS_TOKEN,
    apiKey: process.env.API_KEY,
    privateKey: process.env.PRIVATE_KEY,
  })

  const SOURCE_FILE_UPLOAD_ID = ''
  const FILE_SIZE = ''
  const MIN_AMOUNT = '' // leave blank to automatically estimate price

  const tx = await mcs.makePayment(SOURCE_FILE_UPLOAD_ID, MIN_AMOUNT, FILE_SIZE)
  console.log('transaction hash: ' + tx.transactionHash)
}

main()
```

# Documentation

For more examples please see the [SDK documentation](https://docs.filswan.com/multi-chain-storage/developer-quickstart/sdk/js-mcs-sdk) or the test directory in the [sdk-test repository](https://github.com/filswan/js-mcs-sdk/tree/main/sdk-test)

# Contributing

Feel free to join in and discuss. Suggestions are welcome! [Open an issue](https://github.com/filswan/js-mcs-sdk/issues) or [Join the Discord](https://discord.com/invite/KKGhy8ZqzK)!

## Sponsors

This project is sponsored by Filecoin Foundation

[Flink SDK - A data provider offers Chainlink Oracle service for Filecoin Network ](https://github.com/filecoin-project/devgrants/issues/463)

<img src="https://github.com/filswan/flink/blob/main/filecoin.png" width="200">
