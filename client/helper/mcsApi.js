const axios = require('axios')
const { MCS_API } = require('./constants')

const getParams = async () => {
  try {
    const params = await axios.get(`${MCS_API}/common/system/params`)
    return params.data?.data
  } catch (err) {
    console.log(err)
  }
}

const getFileStatus = async (sourceFileUploadId) => {
  try {
    const res = await axios.get(
      `${MCS_API}/storage/deal/log/${sourceFileUploadId}`,
    )
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

const getDealList = async (address, name, pageNumber, pageSize) => {
  try {
    const res = await axios.get(
      `${MCS_API}/storage/tasks/deals?page_size=${pageSize}&page_number=${pageNumber}&file_name=${name}&source_id=4&wallet_address=${address}&payload_cid=${cid}`,
    )
    return res?.data
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  getParams,
  getFileStatus,
  getDealDetail,
  getPaymentInfo,
  postMintInfo,
  postLockPayment,
  getDealList,
}
