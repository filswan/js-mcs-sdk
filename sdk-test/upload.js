require('dotenv').config('./.env')
const fs = require('fs')
const { mcsSDK } = require('js-mcs-sdk')

async function main() {
  const FILE_NAME = 'file1.txt'
  const FILE_PATH = './file1.txt'

  const mcs = await mcsSDK.initialize({
    privateKey: process.env.PRIVATE_KEY,
    rpcUrl: process.env.RPC_URL,
  })

  const fileArray = [
    { fileName: FILE_NAME, file: fs.createReadStream(FILE_PATH) },
  ]

  const uploadResponse = await mcs.upload(fileArray)
  console.log(uploadResponse)
}

main()
