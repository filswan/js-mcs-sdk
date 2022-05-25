require('dotenv').config('./.env')
const fs = require('fs')
const { mcsSdk } = require('../client/index')
const mcs = new mcsSdk({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL,
})

console.log(mcs.publicKey)

async function main() {
  const W_CID = ''
  const FILE_SIZE = ''
  const MIN_AMOUNT = ''

  const tx = await mcs.makePayment(W_CID, MIN_AMOUNT, FILE_SIZE)
  console.log('transaction hash: ' + tx.transactionHash)
}

main()
