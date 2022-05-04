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

A client library for the Multi-Chain Storage (MCS) https://mcs.filswan.com service. It provides a convenient interface for working with the MCS API from a web browser or Node.js. This client has the following functionalities:

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
  const testFile = JSON.stringify({ address: client.publicKey })
  const fileArray = [{ fileName: 'testFile.json', file: testFile }]

  const uploadResponse = await client.upload(fileArray)
  console.log(uploadResponse)
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
  { fileName: 'file1', file: fs.createReadStream('./file1.txt') },
  { fileName: 'file2', file: fs.createReadStream('./file2.txt') },
]

//optional, showing default options
const options = {
  delay: 1000, // delay between upload API calls for each file. May need to be raised for larger files
  duration: 525, // the number of days to store the file on the Filecoin network.
  fileType: 0, // set to 1 for nft metadata files. type 1 files will not show on the UI.
}

const uploadResponses = await client.upload(fileArray, options)
console.log(uploadResponses)
```

```
/* return
    [
      {
        status: 'success',
        code: '200',
        data: {
          source_file_upload_id: <int>
          payload_cid: 'Qm...',
          ipfs_url: 'https://calibration-ipfs.filswan.com/ipfs/Qm...',
          file_size: <int>,
          w_cid: <uuid>payload_cid
        }
      },
      {
        status: 'success',
        code: '200',
        data: {
          source_file_upload_id: <int>
          payload_cid: 'Qm...',
          ipfs_url: 'https://calibration-ipfs.filswan.com/ipfs/Qm...',
          file_size: <int>,
          w_cid: <uuid>payload_cid
        }
      }
    ]
*/
```

### `makePayment(sourceFileUploadId, wCid, fileSize, minAmount)` - Pay for File Storage

Use USDC tokens to pay for your _unpaid_ uploaded file. You need some information of the file first. Returns a paymentInfo object.

```js
const SOURCE_FILE_UPLOAD_ID = ''
const W_CID = ''
const FILE_SIZE = ''
const MIN_AMOUNT = '0.5' // in ETH

const tx = await client.makePayment(
  SOURCE_FILE_UPLOAD_ID,
  W_CID,
  MIN_AMOUNT,
  FILE_SIZE,
)
console.log(tx)
```

```
/* return
  {
    status: 'success',
    code: 200,
    data: {
      source_file_upload_id: <int>,
      tx_hash: '0x...'
    }
  }
*/
```

Note that `minAmount` is a type String. This is to avoid Big Number precision errors when dealing to amounts in [Wei](https://www.investopedia.com/terms/w/wei.asp)

### `checkStatus(dealId)` - Check File Status from Filecoin

Check the Filecoin storage status of a file using it's `dealId`

```js
// search for file info to get deal_id
const uploadInfo = await client.listUploads()
//console.log(uploadInfo.data.source_file_upload)

const DEAL_ID = ''

if (DEAL_ID) {
  const fileStatus = await client.checkStatus(DEAL_ID)
  console.log(fileStatus)
} else {
  console.log('deal_id not found')
}
```

```
/* return
{
    status: 'success',
    code: '200',
    data: {
        offline_deal_logs: [ [Object], [Object], [Object], [Object], [Object] ]
    }
}
*/
```

### `mintAsset(payloadCid, nft)` - Mint Asset as NFT

After you upload a file, you can mint it to Opensea (testnet) as an NFT. First you will need your NFT metadata. Similarly to `makePayment` this function will return a mintInfo object

```js
const SOURCE_FILE_UPLOAD_ID = ''
const IPFS_URL = ''

const nft = {
  name: 'NFT NAME', // the name of your NFT
  image: IPFS_URL, // asset URI, images will render on Opensea
  description: 'NFT DESCRIPTION', // description of your NFT
  attributes: [], // NFT attributes displayed on Opensea
}

const mintTx = await client.mintAsset(SOURCE_FILE_UPLOAD_ID, nft)
console.log(mintTx)
```

```js
/* return
{
  status: 'success',
  code: 200,
  data: {
    id: <int>,
    source_file_upload_id: <int>,
    nft_tx_hash: '0x...',
    mint_address: '0x...',
    token_id: <int>,
    create_at: <unix timestamp>,
    update_at: <unix timestamp>
  }
}
*/
```

### `listUploads(wallet, fileName, orderBy, isAscend, pageNumber, pageSize)` - View Uploaded Files

This function will return an object of uploaded files. All the parameters have default values, so you can pass no parameters to view all your uploaded files.

```js
console.log(await client.listUploads())
```

You can search for files, either by `file_name`

```js
console.log(await client.listUploads(client.publicKey, 'file1')
```

### `getFileDetails(sourceFileUploadId, dealId)` View File Details

Using `listUploads`, you can retreive the `payload_cid` and `deal_id` of a file. Calling this function will return an object containing the details of the file.

```
const SOURCE_FILE_UPLOAD_ID = ''
const DEAL_ID = ''

console.log(await client.getFileDetails(SOURCE_FILE_UPLOAD_ID, DEAL_ID))
```

# Contributing

Feel free to join in and discuss. Suggestions are welcome! [Open an issue](https://github.com/filswan/js-mcs-sdk/issues) or [Join the Discord](https://discord.com/invite/KKGhy8ZqzK)!

## Sponsors

This project is sponsored by Filecoin Foundation

[Flink SDK - A data provider offers Chainlink Oracle service for Filecoin Network ](https://github.com/filecoin-project/devgrants/issues/463)

<img src="https://github.com/filswan/flink/blob/main/filecoin.png" width="200">
