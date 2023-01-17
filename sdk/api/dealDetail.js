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
      throw new Error(res.data.message)
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

module.exports = { getDealDetail }
