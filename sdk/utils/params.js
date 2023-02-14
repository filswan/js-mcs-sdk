const axios = require('axios')
const getParams = async (api, jwt) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }

  try {
    const params = await axios.get(`${api}/v1/common/system/params`, config)
    return params.data?.data
  } catch (err) {
    console.log(err)
  }
}

module.exports = { getParams }
