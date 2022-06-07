require('dotenv').config('./.env')
const { mcsSdk } = require('js-mcs-sdk')
const mcs = new mcsSdk({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL,
})

console.log(mcs.publicKey)

async function main() {
  const DEAL_ID = 0

  const response = await mcs.getFileStatus(DEAL_ID)
  console.log(response)
}

main()
