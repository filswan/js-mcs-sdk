require('dotenv').config('./.env')
const fs = require('fs')
const { mcsSdk } = require('../client/index')
const mcs = new mcsSdk({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL,
})

console.log(mcs.publicKey)

async function main() {
  const SOURCE_FILE_UPLOAD_ID = 1
  const DEAL_ID = 1

  const mintResponse = await mcs.getFileDetails(SOURCE_FILE_UPLOAD_ID, DEAL_ID)
  console.log(mintResponse)
}

main()
