require('dotenv').config('./.env')
const { mcsSDK } = require('js-mcs-sdk')
const mcs = new mcsSDK({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL,
})

console.log(mcs.publicKey)

async function main() {
  const SOURCE_FILE_UPLOAD_ID = ''
  const FILE_SIZE = ''
  const MIN_AMOUNT = ''

  const tx = await mcs.makePayment(SOURCE_FILE_UPLOAD_ID, MIN_AMOUNT, FILE_SIZE)
  console.log('transaction hash: ' + tx.transactionHash)
}

main()
