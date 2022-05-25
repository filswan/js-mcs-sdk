require('dotenv').config('./.env')
const fs = require('fs')
const { mcsSdk } = require('js-mcs-sdk')
const mcs = new mcsSdk({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL,
})

console.log(mcs.publicKey)

async function main() {
  const FILE_NAME = 'file1.txt'
  const FILE_PATH = './file1.txt'

  const fileArray = [
    { fileName: FILE_NAME, file: fs.createReadStream(FILE_PATH) },
  ]

  const uploadResponse = await mcs.upload(fileArray)
  console.log(uploadResponse)
}

main()
