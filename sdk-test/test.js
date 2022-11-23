require('dotenv').config('./.env')
const { mcsSDK } = require('../SDK/index')
const fs = require('fs')

async function main() {
  // set up js-mcs-sdk
  const mcs = await mcsSDK.initialize({
    privateKey: process.env.PRIVATE_KEY,
    rpcUrl: 'https://polygon-rpc.com/',
  })

  console.log(mcs.version)
  console.log(mcs.walletAddress)
  console.log(mcs.jwt)

  console.log((await mcs.getDealList()).data.source_file_upload)

  // const FILE_NAME = 'file1.txt'
  // const FILE_PATH = './file1.txt'
  // const fileArray = [
  //   { fileName: FILE_NAME, file: fs.createReadStream(FILE_PATH) },
  // ]

  // const uploadResponse = await mcs.upload(fileArray)
  // console.log(uploadResponse)

  // const payment = await mcs.makePayment('151906', '', 100)

  // const SOURCE_FILE_UPLOAD_ID = uploadResponse[0].data.source_file_upload_id
  // const IPFS_URL = uploadResponse[0].data.ipfs_url
  // const NFT = {
  //   name: 'NFT_NAME',
  //   description: '',
  //   image: IPFS_URL,
  //   attributes: [],
  //   external_url: IPFS_URL,
  // }

  // const mintResponse = await mcs.mintAsset(SOURCE_FILE_UPLOAD_ID, NFT)
  // console.log(mintResponse)
}

main()
