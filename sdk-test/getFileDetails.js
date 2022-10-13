require('dotenv').config('./.env')
const { mcsSDK } = require('js-mcs-sdk')

console.log(mcs.publicKey)

async function main() {
  const SOURCE_FILE_UPLOAD_ID = 0
  const DEAL_ID = 0

  const mcs = await mcsSDK.initialize({
    privateKey: process.env.PRIVATE_KEY,
    rpcUrl: process.env.RPC_URL,
  })

  const response = await mcs.getFileDetails(SOURCE_FILE_UPLOAD_ID, DEAL_ID)
  console.log(response)
}

main()
