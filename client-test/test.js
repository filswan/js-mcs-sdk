require('dotenv').config('./.env')
const fs = require('fs').promises
const { mcsClient } = require('../client/index')
const client = new mcsClient({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL,
})

console.log(client.publicKey)

async function main() {
  const testFile = JSON.stringify({
    address: client.publicKey,
    nonce: 0,
  })
  const fileArray = [{ fileName: 'testFile.json', file: testFile }]

  const uploadResponse = await client.upload(fileArray)
  console.log(uploadResponse)

  const UPLOAD_ID = uploadResponse[0].data.source_file_upload_id
  const W_CID = uploadResponse[0].data.w_cid
  const FILE_SIZE = uploadResponse[0].data.file_size
  const MIN_AMOUNT = '0.5'

  const tx = await client.makePayment(UPLOAD_ID, W_CID, MIN_AMOUNT, FILE_SIZE)
  console.log(tx)

  const uploads = await client.listUploads(
    client.publicKey,
    '',
    'testFile.json',
  )
  console.log(uploads.data.source_file_upload)
}

main()
