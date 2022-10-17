# js-mcs-sdk-calibration

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

A javascript software development kit for the Multi-Chain Storage (MCS) https://www.multichain.storage/ service. It provides a convenient interface for working with the MCS API from a web browser or Node.js. This SDK has the following functionalities:

- **POST** upload file to Filswan IPFS gate way
- **POST** make payment to swan filecoin storage gate way
- **POST** mint asset as NFT
- **GET** list of files uploaded
- **GET** files by cid
- **GET** status from filecoin

## Prerequisites

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

First you should set your private key and RPC-url as environment variables in a `.env` file. Mumbai network and Binance Testnet are supported.

```js
PRIVATE_KEY=<PRIVATE_KEY>
RPC_URL=<RPC_URL>
```

Example of uploading a single file using the MCS SDK.

```js
require('dotenv').config()
const { mcsSDK } = require('js-mcs-sdk')
const fs = require('fs')

async function main() {
  const testFile = JSON.stringify({ address: mcs.publicKey })
  const fileArray = [{ fileName: `${mcs.publicKey}.txt`, file: testFile }]

  // set up js-mcs-sdk
  const mcs = await mcsSDK.initialize({
    privateKey: process.env.PRIVATE_KEY,
    rpcUrl: process.env.RPC_URL,
  })

  const uploadResponse = await mcs.upload(fileArray)
  console.log(uploadResponse)
}

main()
```

## Testing

There are some examples in the `sdk-test` folder.

```
cd sdk-test
```

`node upload.js` uploads a simple file (you can edit the `FILE_NAME` and `FILE_PATH`)

`node makePayment.js` pays for a file using its `source file upload id` (you can edit the `FILE_NAME` and `FILE_PATH`) (will throw an Error if the file cannot be paid for)

`node mintAsset.js` mints a file as a NFT by providing `source file upload id` and other information

## Documentation

For more examples please see the [SDK documentation](https://docs.filswan.com/multi-chain-storage/developer-quickstart/sdk/js-mcs-sdk) or the example directory in the [sdk-test repository](https://github.com/filswan/js-mcs-sdk/tree/main/sdk-test), which contains sample code for all SDK functionalities

# Contributing

Feel free to join in and discuss. Suggestions are welcome! [Open an issue](https://github.com/filswan/js-mcs-sdk/issues) or [Join the Discord](https://discord.com/invite/KKGhy8ZqzK)!

## Sponsors

This project is sponsored by Filecoin Foundation

[Flink SDK - A data provider offers Chainlink Oracle service for Filecoin Network ](https://github.com/filecoin-project/devgrants/issues/463)

<img src="https://github.com/filswan/flink/blob/main/filecoin.png" width="200">
