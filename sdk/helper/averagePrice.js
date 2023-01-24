const { STORAGE_API } = require('./constants')
const axios = require('axios')
const { getParams } = require('./params')

const getAveragePrice = async (
  api,
  jwt,
  walletAddress,
  fileSize,
  duration = 525,
) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }

  let fileSizeInGB = Number(fileSize) / 10 ** 9
  let storageCostPerUnit = 0

  // get price in FIL/GiB/year
  const storageRes = await axios.get(
    `${STORAGE_API}/stats/storage?wallet_address=${walletAddress}`,
    config,
  )

  let cost = storageRes.data.data.historical_average_price_verified
    ? storageRes.data.data.historical_average_price_verified.split(' ')
    : []
  if (cost[0]) storageCostPerUnit = cost[0]

  const params = await getParams(api)
  billingPrice = params.filecoin_price / 10 ** 8

  let price =
    ((fileSizeInGB * duration * storageCostPerUnit * 5) / 365) * billingPrice

  let numberPrice = Number(price).toFixed(6)
  return numberPrice > 0 ? numberPrice : '0.000002'
}

module.exports = { getAveragePrice }
