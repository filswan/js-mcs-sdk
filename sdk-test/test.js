require('dotenv').config('./.env')
const { mcsSDK } = require('../SDK/index')

async function main() {
  // set up js-mcs-sdk
  const mcs = await mcsSDK.initialize({
    privateKey: process.env.PRIVATE_KEY,
    rpcUrl: 'https://polygon-rpc.com/',
  })

  const testFile = JSON.stringify({
    address: mcs.publicKey,
    nonce: 0,
  })
  const fileArray = [{ fileName: 'testFile.json', file: testFile }]

  console.log('uploading...')
  const uploadResponse = await mcs.upload(fileArray)
  console.log(uploadResponse)

  const SOURCE_FILE_UPLOAD_ID = uploadResponse[0].data.source_file_upload_id
  const FILE_SIZE = uploadResponse[0].data.file_size
  const MIN_AMOUNT = '0'

  console.log('paying...')
  const tx = await mcs.makePayment(SOURCE_FILE_UPLOAD_ID, MIN_AMOUNT, FILE_SIZE)
  console.log('transaction hash: ' + tx.transactionHash)

  const IPFS_URL = uploadResponse[0].data.ipfs_url
  const NFT = {
    name: 'NFT_NAME',
    description: '',
    image: IPFS_URL,
    attributes: [],
    external_url: IPFS_URL,
  }

  console.log('minting...')
  const mintResponse = await mcs.mintAsset(SOURCE_FILE_UPLOAD_ID, NFT)
  console.log(mintResponse)

  console.log('getting uploads...')
  const uploads = await mcs.getUploads(mcs.publicKey, 'testFile.json')
  console.log(uploads.data.source_file_upload)
}

main()
