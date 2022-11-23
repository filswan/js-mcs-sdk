const axios = require('axios')
const { MCS_API } = require('../helper/constants')

const getFileStatus = async (jwt, dealId) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(`${MCS_API}storage/deal/log/${dealId}`, config)
    return res.data
  } catch (err) {
    console.error(err)
  }
}

module.exports = { getFileStatus }
