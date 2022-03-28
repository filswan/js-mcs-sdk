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
  - [Documentation](#documentation)
- [Contributing](#contributing)

# Introduction

A client library for the https://mcs.filswan.com/ service. It provides a convenient interface for working with the MCS API from a web browser or Node.js. This client has the following functionalities:

- [**POST**](#uploadfiles-options---uploading-files)    upload file to Filswan IPFS gate way
- [**POST**](#makepaymentpayloadcid-amount---pay-for-file-storage)    make payment to swan filecoin storage gate way
- [**GET**](checkstatusdealcid---check-file-status-from-filecoin)       status from filecoin
- [**POST**](#mintassetpayloadcid-nft---mint-asset-as-nft)    mint asset as NFT
- [**GET**](#listuploadswallet-payloadcid-filename-pagenumber-pagesize---view-uploaded-files)       list of files uploaded
- [**GET**](#getfiledetailspayloadcid-dealid-view-file-details)       files by cid

## Prerequisites

[Node.js](https://nodejs.org/en/) - v16.13.0 (npm v8.1.0) \
Polygon Mumbai Testnet Wallet - [Metamask Tutorial](https://docs.filswan.com/getting-started/beginner-walkthrough/public-testnet/setup-metamask) \
Polygon Mumbai Testnet RPC - [Signup via Alchemy](https://www.alchemy.com/)

You will also need Testnet USDC and MATIC balance to use this client. [Swan Faucet Tutorial](https://docs.filswan.com/development-resource/swan-token-contract/acquire-testnet-usdc-and-matic-tokens)

# MCS API

For more information about the API usage, check out the [MCS API documentation](https://docs.filswan.com/development-resource/mcp-api).

# Usage

Instructions for developers working with MCS Client and API.

## Installation

Install the package using npm

```
npm install mcs-client
```

## Getting Started

First you should set your private key and RPC-url as environment variables in a `.env` file

```js
PRIVATE_KEY=<PRIVATE_KEY>
RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/<API_KEY>
```

Example of uploading a single file using the MCS Client.

```js
require('dotenv').config()
const { mcsClient } = require('mcs-client')

// set up mcs-client
const client = new mcsClient({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL,
})

async function main() {
  const testFile = JSON.stringify({ data: 'Hello, World!' })
  const fileArray = [{ fileName: 'testFile.json', file: testFile }]

  const uploadResponse = await client.upload(fileArray)
  console.log(uploadResponse[0].data.ipfs_url)
  // https://calibration-ipfs.filswan.com/ipfs/QmPjwPk7xiQWVA3VLoK9F9nk2cL7oE2LRFU6jzLwc9cnQm
}

main()
```

## Documentation

The following functions documentation will assume you have a MCS client instantiated. Using the `client` variable for the following examples.

```js
const client = new mcsClient({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL,
})
```

### `upload(files, options)` - Uploading File(s)

You can use the MCS Client to upload and array of file(s) to Filswan IPFS gateway. The array holds a list of objects, and returns an array of response objects. Using `fs` is a simple way to read the file data. The options object is also optional to customize the upload.

```js
const fileArray = [
  { fileName: 'file1', file: await fs.readFile('./file1.txt') },
  { fileName: 'file2', file: await fs.readFile('./file2.txt') },
]

//optional, showing default options
const options = {
  delay: 1000, // delay between upload API calls for each file. May need to be raised for larger files
  duration: 180, // the number of days to store the file on the Filecoin network.
  fileType: 0, // set to 1 for nft metadata files. type 1 files will not show on the UI.
}

const uploadResponses = await client.upload(fileArray, options)
```

### `makePayment(payloadCid, amount)` - Pay for File Storage

Use USDC tokens to pay for your _unpaid_ uploaded file. You need the `payload_cid` of the file. Returns a [web3 receipt object](https://www.investopedia.com/terms/w/wei.asp)

```js
const payloadCid = uploadResponses[0].data.payload_cid
// bafkqadkimvwgy3zmeblw64tmmqqq

const tx = await client.makePayment(payloadCid, '10')
console.log(tx.transactionHash)
```

Note that `amount` is a type String. This is to avoid Big Number precision errors when dealing to amounts in [Wei](https://www.investopedia.com/terms/w/wei.asp)

### `checkStatus(dealCid)` - Check File Status from Filecoin

Check the Filecoin storage status of a file using it's `deal_cid`

```js
const uploadInfo = await client.listUploads(
  mcs.publicKey,
  'bafkqadkimvwgy3zmeblw64tmmqqq',
)
const dealCid = uploadInfo.data[0].deal_cid

const fileStatus = await client.checkStatus(dealCid)
console.log(fileStatus)
```

### `mintAsset(payloadCid, nft)` - Mint Asset as NFT

After you upload a file, you can mint it to Opensea (testnet) as an NFT. First you will need your NFT metadata. Similarly to `makePayment` this function will return a [web3 receipt object](https://www.investopedia.com/terms/w/wei.asp)

```js
const nft = {
  name: 'File 1', // the name of your NFT
  description: 'This is the first file', // the description of your NFT
  image: uploadResponses[0].data.ipfs_url, // asset URI, images will render on Opensea
  tx_hash: '0x...', // payment tx_hash, will be inserted automatically
}

const mintTx = await client.mintAsset(payloadCid, nft)
console.log(mintTx)
```

### `listUploads(wallet, payloadCid, fileName, pageNumber, pageSize)` - View Uploaded Files

This function will return an object of uploaded files. All the parameters have default values, so you can pass no parameters to view all your uploaded files.

```js
console.log(await client.listUploads())
```

You can search for files, either by `payload_cid` or by `file_name`

```js
console.log(await client.listUploads(client.publicKey, payloadCid))
console.log(await client.listUploads(client.publicKey, '', 'file1')
```

### `getFileDetails(payloadCid, dealId)` View File Details

Using `listUploads`, you can retreive the `payload_cid` and `deal_id` of a file. Calling this function will return an object containing the details of the file.

```
console.log(await client.getFileDetails(payloadCid, 0))
```

# Contributing

Feel free to join in and discuss. Suggestions are welcome! [Open an issue](https://github.com/filswan/nft/issues) or [Join the Discord](https://discord.com/invite/KKGhy8ZqzK)!

## Sponsors

This project is sponsored by Filecoin Foundation

[Flink SDK - A data provider offers Chainlink Oracle service for Filecoin Network ](https://github.com/filecoin-project/devgrants/issues/463)
<img src="filecoin.png" width="200">
