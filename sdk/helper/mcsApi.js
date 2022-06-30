const axios = require('axios')

const getParams = async (apiUrl) => {
  try {
    const params = await axios.get(`${apiUrl}/common/system/params`)
    return params.data?.data
  } catch (err) {
    console.log(err)
  }
}

const getFileStatus = async (apiUrl, dealId) => {
  try {
    const res = await axios.get(`${apiUrl}/storage/deal/log/${dealId}`)
    return res.data
  } catch (err) {
    console.error(err)
  }
}

const getDealDetail = async (apiUrl, sourceFileUploadId, dealId) => {
  try {
    const res = await axios.get(
      `${apiUrl}/storage/deal/detail/${dealId}?source_file_upload_id=${sourceFileUploadId}`,
    )
    return res.data
  } catch (err) {
    console.error(err)
  }
}

const getPaymentInfo = async (apiUrl, sourceFileUploadId) => {
  try {
    const res = await axios.get(
      `${apiUrl}/billing/deal/lockpayment/info?source_file_upload_id=${sourceFileUploadId}`,
    )
    return res?.data
  } catch (err) {
    // Handle Error Here
    console.error(err)
  }
}

const postMintInfo = async (apiUrl, mintInfo) => {
  try {
    const res = await axios.post(`${apiUrl}/storage/mint/info`, mintInfo)
    return res?.data
  } catch (err) {
    console.error(err)
  }
}

const postLockPayment = async (apiUrl, payInfo) => {
  try {
    const res = await axios.post(`${apiUrl}/billing/deal/lockpayment`, payInfo)
    return res?.data
  } catch (err) {
    console.error(err)
  }
}

const getDealList = async (
  apiUrl,
  address,
  name,
  orderBy,
  isAscend,
  status,
  isMinted,
  pageNumber,
  pageSize,
) => {
  try {
    const res = await axios.get(
      `${apiUrl}/storage/tasks/deals?page_size=${pageSize}&page_number=${pageNumber}&file_name=${name}&wallet_address=${address}&order_by=${orderBy}&is_ascend=${isAscend}&status=${status}&is_minted=${isMinted}`,
    )
    return res?.data
  } catch (err) {
    console.error(err)
  }
}

const sendRequest = async (apiLink) => {
  try {
    const response = await axios.get(apiLink)
    return response.data
  } catch (err) {
    console.error(err)
  }
}

const getAverageAmount = async (
  apiUrl,
  storageApiUrl,
  walletAddress,
  fileSize,
  duration = 525,
) => {
  let fileSizeInGB = Number(fileSize) / 10 ** 9
  let storageCostPerUnit = 0

  const storageRes = await sendRequest(
    `${storageApiUrl}/stats/storage?wallet_address=${walletAddress}`,
  )
  let cost = storageRes.data.average_price_per_GB_per_year
    ? storageRes.data.average_price_per_GB_per_year.split(' ')
    : []
  if (cost[0]) storageCostPerUnit = cost[0]

  const bilingRes = await sendRequest(
    `${apiUrl}/billing/price/filecoin?wallet_address=${walletAddress}`,
  )
  let billingPrice = bilingRes.data

  let price =
    ((fileSizeInGB * duration * storageCostPerUnit * 5) / 365) * billingPrice

  let numberPrice = Number(price).toFixed(9)
  let averagePrice =
    numberPrice > 0 ? Number(price * 3).toFixed(9) : '0.000000002'

  return averagePrice
}

module.exports = {
  getParams,
  getFileStatus,
  getDealDetail,
  getPaymentInfo,
  postMintInfo,
  postLockPayment,
  getDealList,
  getAverageAmount,
}
