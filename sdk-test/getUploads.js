require('dotenv').config('./.env')
const { mcsSDK } = require('js-mcs-sdk')

async function main() {
  const FILE_NAME = ''
  const ORDER_BY = ''
  const IS_ASCEND = ''
  const STATUS = ''
  const IS_MINTED = ''
  const PAGE_NUMBER = 1
  const PAGE_SIZE = 10

  const mcs = await mcsSDK.initialize({
    privateKey: process.env.PRIVATE_KEY,
    apiKey: process.env.API_KEY,
    accessToken: process.env.ACCESS_TOKEN,
  })

  const uploads = await mcs.getUploads(
    mcs.walletAddress,
    FILE_NAME,
    ORDER_BY,
    IS_ASCEND,
    STATUS,
    IS_MINTED,
    PAGE_NUMBER,
    PAGE_SIZE,
  )
  console.log(uploads.data.source_file_upload)
}

main()
