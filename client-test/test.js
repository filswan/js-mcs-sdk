require('dotenv').config('./.env')
const fs = require('fs').promises
const { mcsClient } = require('mcs-client')
const client = new mcsClient({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL,
})

async function main() {
  const fileArray = [
    { fileName: 'file1', file: await fs.readFile('./file1.txt') },
  ]

  const uploadResponse = await client.upload(fileArray)
  console.log(uploadResponse[0].data.ipfs_url)
  // https://calibration-ipfs.filswan.com/ipfs/QmPjwPk7xiQWVA3VLoK9F9nk2cL7oE2LRFU6jzLwc9cnQm
}

main()
