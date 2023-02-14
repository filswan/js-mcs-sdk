const axios = require('axios')

const getDealDetail = async (api, jwt, sourceFileUploadId, dealId) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(
      `${api}/v1/storage/deal/detail/${dealId}?source_file_upload_id=${sourceFileUploadId}`,
      config,
    )
    if (res?.data.status === 'error') {
      console.error(res.data.message)
    }
    return res.data
  } catch (err) {
    if (err.response.data.status === 'error') {
      console.error(err.response?.data?.message)
    } else {
      console.error(err)
    }
  }
}

const getDealList = async (
  api,
  jwt,
  { address, name, orderBy, isAscend, status, isMinted, pageNumber, pageSize },
) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(
      `${api}/v1/storage/tasks/deals?page_size=${pageSize || ''}&page_number=${
        pageNumber || ''
      }&file_name=${name || ''}&wallet_address=${address || ''}&order_by=${
        orderBy || ''
      }&is_ascend=${isAscend || ''}&status=${status || ''}&is_minted=${
        isMinted || ''
      }`,
      config,
    )
    if (res?.data.status === 'error') {
      console.error(res.data.message)
    }
    return res?.data
  } catch (err) {
    if (err.response?.data?.status === 'error') {
      console.error(err.response.data?.message)
    } else {
      console.error(err)
    }
  }
}

const getFileStatus = async (api, jwt, dealId) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(`${api}/v1/storage/deal/log/${dealId}`, config)
    if (res?.data.status === 'error') {
      console.error(res.data.message)
    }
    return res.data
  } catch (err) {
    if (err.response?.data?.status === 'error') {
      console.error(err.response.data?.message)
    } else {
      console.error(err)
    }
  }
}

module.exports = { getDealDetail, getDealList, getFileStatus }
