const axios = require('axios')
const { MCS_API } = require('../helper/constants')

const getDealDetail = async (jwt, sourceFileUploadId, dealId) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(
      `${MCS_API}storage/deal/detail/${dealId}?source_file_upload_id=${sourceFileUploadId}`,
      config,
    )
    return res.data
  } catch (err) {
    console.error(err)
  }
}

module.exports = { getDealDetail }
