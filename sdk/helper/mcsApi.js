const axios = require('axios')
const FormData = require('form-data')
const { Agent } = require('https')
const { MCS_API, STORAGE_API } = require('./constants')

const uploadPromise = (
  fileName,
  file,
  wallet_address,
  duration = 525,
  file_type = '0',
) => {
  const form = new FormData()
  form.append('duration', duration)
  form.append('file', file, fileName)
  form.append('wallet_address', wallet_address)
  form.append('file_type', file_type)

  const res = axios.post(`${MCS_API}/storage/ipfs/upload`, form, {
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    maxRedirects: 0,
    agent: new Agent({ rejectUnauthorized: false }),
    headers: {
      ...form.getHeaders(),
    },
  })

  return res
}

const getParams = async () => {
  try {
    const params = await axios.get(`${MCS_API}/common/system/params`)
    return params.data?.data
  } catch (err) {
    console.log(err)
  }
}

const getFileStatus = async (dealId) => {
  try {
    const res = await axios.get(`${MCS_API}/storage/deal/log/${dealId}`)
    return res.data
  } catch (err) {
    console.error(err)
  }
}

const getDealDetail = async (sourceFileUploadId, dealId) => {
  try {
    const res = await axios.get(
      `${MCS_API}/storage/deal/detail/${dealId}?source_file_upload_id=${sourceFileUploadId}`,
    )
    return res.data
  } catch (err) {
    console.error(err)
  }
}

const getPaymentInfo = async (sourceFileUploadId) => {
  try {
    const res = await axios.get(
      `${MCS_API}/billing/deal/lockpayment/info?source_file_upload_id=${sourceFileUploadId}`,
    )
    return res?.data
  } catch (err) {
    // Handle Error Here
    console.error(err)
  }
}

const getFilePaymentStatus = async (sourceFileUploadId) => {
  try {
    const res = await axios.get(
      `${MCS_API}/storage/source_file_upload/${sourceFileUploadId}`,
    )
    return res?.data
  } catch (err) {
    // Handle Error Here
    console.error(err)
  }
}

const postMintInfo = async (mintInfo) => {
  try {
    const res = await axios.post(`${MCS_API}/storage/mint/info`, mintInfo)
    return res?.data
  } catch (err) {
    console.error(err)
  }
}

const postLockPayment = async (payInfo) => {
  try {
    const res = await axios.post(`${MCS_API}/billing/deal/lockpayment`, payInfo)
    return res?.data
  } catch (err) {
    console.error(err)
  }
}

const getDealList = async (
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
      `${MCS_API}/storage/tasks/deals?page_size=${pageSize}&page_number=${pageNumber}&file_name=${name}&wallet_address=${address}&order_by=${orderBy}&is_ascend=${isAscend}&status=${status}&is_minted=${isMinted}`,
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

const getAverageAmount = async (walletAddress, fileSize, duration = 525) => {
  let fileSizeInGB = Number(fileSize) / 10 ** 9
  let storageCostPerUnit = 0

  // get price in FIL/GiB/year
  const storageRes = await sendRequest(
    `${STORAGE_API}/stats/storage?wallet_address=${walletAddress}`,
  )
  let cost = storageRes.data.average_price_per_GB_per_year
    ? storageRes.data.average_price_per_GB_per_year.split(' ')
    : []
  if (cost[0]) storageCostPerUnit = cost[0]

  const params = await getParams()
  billingPrice = params.filecoin_price

  let price =
    ((fileSizeInGB * duration * storageCostPerUnit * 5) / 365) * billingPrice

  let numberPrice = Number(price).toFixed(9)
  return numberPrice > 0 ? numberPrice : '0.000000002'
}

module.exports = {
  uploadPromise,
  getParams,
  getFileStatus,
  getDealDetail,
  getPaymentInfo,
  getFilePaymentStatus,
  postMintInfo,
  postLockPayment,
  getDealList,
  getAverageAmount,
}
