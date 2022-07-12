require('dotenv').config('./.env')
const { mcsSDK } = require('js-mcs-sdk')
const mcs = new mcsSDK({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL,
})

console.log(mcs.publicKey)

async function main() {
  const SOURCE_FILE_UPLOAD_ID = 475560
  const IPFS_URL =
    'https://calibration-ipfs.filswan.com/ipfs/QmPNDNcbc4b2Apt59pBHxAdDLXEAbosYUG6NisnyZdySXB'
  const NFT = {
    name: 'NFT_NAME',
    description: '',
    image: IPFS_URL,
    attributes: [],
    external_url: IPFS_URL,
  }

  const mintResponse = await mcs.mintAsset(SOURCE_FILE_UPLOAD_ID, NFT)
  console.log(mintResponse)
}

main()
