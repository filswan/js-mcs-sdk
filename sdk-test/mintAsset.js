require('dotenv').config('./.env')
const { mcsSDK } = require('js-mcs-sdk')
const mcs = new mcsSDK({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL,
})

console.log(mcs.publicKey)

async function main() {
  const GENERATE_METADATA = true
  const SOURCE_FILE_UPLOAD_ID = 0
  const IPFS_URL = ''
  const NFT = {
    name: 'NFT_NAME',
    description: '',
    image: IPFS_URL,
    attributes: [],
    external_url: IPFS_URL,
  }

  const mintResponse = await mcs.mintAsset(
    SOURCE_FILE_UPLOAD_ID,
    NFT,
    GENERATE_METADATA,
  )
  console.log(mintResponse)
}

main()
