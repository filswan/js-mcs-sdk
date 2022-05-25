require('dotenv').config('./.env')
const { mcsSdk } = require('js-mcs-sdk')
const mcs = new mcsSdk({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL,
})

console.log(mcs.publicKey)

async function main() {
  const testFile = JSON.stringify({
    address: mcs.publicKey,
    nonce: 0,
  })
  const fileArray = [{ fileName: 'testFile.json', file: testFile }]

  const uploadResponse = await mcs.upload(fileArray)
  console.log(uploadResponse)

  const W_CID = uploadResponse[0].data.w_cid
  const FILE_SIZE = uploadResponse[0].data.file_size
  const MIN_AMOUNT = '0.5'

  const tx = await mcs.makePayment(W_CID, MIN_AMOUNT, FILE_SIZE)
  console.log('transaction hash: ' + tx.transactionHash)

  const uploads = await mcs.getUploads(mcs.publicKey, '', 'testFile.json')
  console.log(uploads.data.source_file_upload)
}

main()
