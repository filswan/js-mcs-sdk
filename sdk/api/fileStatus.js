const axios = require('axios')

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

module.exports = { getFileStatus }
