const axios = require('axios')
const { MCS_API } = require('../helper/constants')

const getFileStatus = async (jwt, dealId) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(`${MCS_API}storage/deal/log/${dealId}`, config)
    if (res?.data.status === 'error') {
      throw new Error(res.data.message)
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
