require('dotenv').config('./.env')
const { mcsSDK } = require('js-mcs-sdk')

async function main() {
  const SOURCE_FILE_UPLOAD_ID = 0
  const DEAL_ID = 0

  const mcs = await mcsSDK.initialize({
    apiKey: process.env.API_KEY,
    accessToken: process.env.ACCESS_TOKEN,
  })

  const response = await mcs.getFileDetails(SOURCE_FILE_UPLOAD_ID, DEAL_ID)
  console.log(response)
}

main()
