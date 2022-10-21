require('dotenv').config('./.env')
const { mcsSDK } = require('js-mcs-sdk')

async function main() {
  const SOURCE_FILE_UPLOAD_ID = 0
  const IPFS_URL = ''
  const NFT = {
    name: 'NFT_NAME',
    description: '',
    image: IPFS_URL,
    attributes: [],
    external_url: IPFS_URL,
  }

  const mcs = await mcsSDK.initialize({
    privateKey: process.env.PRIVATE_KEY,
    rpcUrl: process.env.RPC_URL,
  })

  console.log('version:', mcs.version)

  const mintResponse = await mcs.mintAsset(SOURCE_FILE_UPLOAD_ID, NFT)
  console.log(mintResponse)
}

main()
