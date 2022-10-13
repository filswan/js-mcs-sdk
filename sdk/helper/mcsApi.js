const axios = require('axios')
const FormData = require('form-data')
const { Agent } = require('https')

const uploadPromise = (
  mcsApi,
  jwt,
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

  const res = axios.post(`${mcsApi}/storage/ipfs/upload`, form, {
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    maxRedirects: 0,
    agent: new Agent({ rejectUnauthorized: false }),
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${jwt}`,
    },
  })

  return res
}

const getParams = async (mcsApi) => {
  try {
    const params = await axios.get(`${mcsApi}/common/system/params`)
    return params.data?.data
  } catch (err) {
    console.log(err)
  }
}

const getFileStatus = async (mcsApi, jwt, dealId) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(`${mcsApi}/storage/deal/log/${dealId}`, config)
    return res.data
  } catch (err) {
    console.error(err)
  }
}

const getDealDetail = async (mcsApi, jwt, sourceFileUploadId, dealId) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(
      `${mcsApi}/storage/deal/detail/${dealId}?source_file_upload_id=${sourceFileUploadId}`,
      config,
    )
    return res.data
  } catch (err) {
    console.error(err)
  }
}

const getPaymentInfo = async (mcsApi, jwt, sourceFileUploadId) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(
      `${mcsApi}/billing/deal/lockpayment/info?source_file_upload_id=${sourceFileUploadId}`,
      config,
    )
    return res?.data
  } catch (err) {
    // Handle Error Here
    console.error(err)
  }
}

const getFilePaymentStatus = async (mcsApi, jwt, sourceFileUploadId) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(
      `${mcsApi}/storage/source_file_upload/${sourceFileUploadId}`,
      config,
    )
    return res?.data
  } catch (err) {
    // Handle Error Here
    console.error(err)
  }
}

const postMintInfo = async (mcsApi, jwt, mintInfo) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.post(
      `${mcsApi}/storage/mint/info`,
      mintInfo,
      config,
    )
    return res?.data
  } catch (err) {
    console.error(err)
  }
}

const postLockPayment = async (mcsApi, jwt, payInfo) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.post(
      `${mcsApi}/billing/deal/lockpayment`,
      payInfo,
      config,
    )
    return res?.data
  } catch (err) {
    console.error(err)
  }
}

const getDealList = async (
  mcsApi,
  jwt,
  address,
  name,
  orderBy,
  isAscend,
  status,
  isMinted,
  pageNumber,
  pageSize,
) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(
      `${mcsApi}/storage/tasks/deals?page_size=${pageSize}&page_number=${pageNumber}&file_name=${name}&wallet_address=${address}&order_by=${orderBy}&is_ascend=${isAscend}&status=${status}&is_minted=${isMinted}`,
      config,
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
  mcsApi,
  storageApi,
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
    `${storageApi}/stats/storage?wallet_address=${walletAddress}`,
    config,
  )

  let cost = storageRes.data.data.historical_average_price_verified
    ? storageRes.data.data.historical_average_price_verified.split(' ')
    : []
  if (cost[0]) storageCostPerUnit = cost[0]

  const params = await getParams(mcsApi)
  billingPrice = params.filecoin_price / 10 ** 8

  let price =
    ((fileSizeInGB * duration * storageCostPerUnit * 5) / 365) * billingPrice

  let numberPrice = Number(price).toFixed(6)
  return numberPrice > 0 ? numberPrice : '0.000002'
}

const getNonce = async (mcsApi, publicKey) => {
  const registerRes = await axios.post(`${mcsApi}/user/register`, {
    public_key_address: publicKey,
  })
  return registerRes.data.data.nonce
}

const login = async (mcsApi, web3, publicKey, privateKey, network) => {
  const nonce = await getNonce(mcsApi, publicKey)
  const result = web3.eth.accounts.sign(nonce, privateKey)
  const loginObj = {
    nonce: nonce,
    signature: result.signature,
    public_key_address: publicKey,
    network: network,
  }

  res = await axios.post(`${mcsApi}/user/login_by_metamask_signature`, loginObj)
  return res.data.data
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
  login,
}
