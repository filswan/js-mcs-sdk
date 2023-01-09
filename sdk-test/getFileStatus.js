require('dotenv').config('./.env')
const { mcsSDK } = require('js-mcs-sdk')

async function main() {
  const DEAL_ID = 0

  const mcs = await mcsSDK.initialize({
    apiKey: process.env.API_KEY,
    accessToken: process.env.ACCESS_TOKEN,
  })

  const response = await mcs.getFileStatus(DEAL_ID)
  console.log(response)
}

main()
