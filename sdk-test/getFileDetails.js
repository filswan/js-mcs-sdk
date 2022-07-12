require('dotenv').config('./.env')
const { mcsSDK } = require('js-mcs-sdk')
const mcs = new mcsSDK({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL,
})

console.log(mcs.publicKey)

async function main() {
  const SOURCE_FILE_UPLOAD_ID = 0
  const DEAL_ID = 0

  const response = await mcs.getFileDetails(SOURCE_FILE_UPLOAD_ID, DEAL_ID)
  console.log(response)
}

main()
