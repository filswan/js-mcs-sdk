require('dotenv').config('./.env')
const { mcsSDK } = require('js-mcs-sdk')

async function main() {
  const SOURCE_FILE_UPLOAD_ID = ''
  const FILE_SIZE = ''

  const mcs = await mcsSDK.initialize({
    privateKey: process.env.PRIVATE_KEY,
    apiKey: process.env.API_KEY,
    accessToken: process.env.ACCESS_TOKEN,
  })

  console.log('version:', mcs.version)

  const tx = await mcs.makePayment(SOURCE_FILE_UPLOAD_ID, FILE_SIZE)
  console.log('transaction hash: ' + tx.transactionHash)
}

main()
