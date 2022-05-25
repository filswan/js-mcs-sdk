require('dotenv').config('./.env')
const { mcsSdk } = require('js-mcs-sdk')
const mcs = new mcsSdk({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL,
})

console.log(mcs.publicKey)

async function main() {
  const SOURCE_FILE_UPLOAD_ID = 0
  const IPFS_URL = ''
  const NFT = {
    name: 'NFT_NAME',
    description: '',
    image: IPFS_URL,
    attributes: [],
  }

  const mintResponse = await mcs.mintAsset(SOURCE_FILE_UPLOAD_ID, NFT)
  console.log(mintResponse)
}

main()
