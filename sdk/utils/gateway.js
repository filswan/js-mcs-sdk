const axios = require('axios')

const getGateway = async (api, jwt) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }

  try {
    const response = await axios.get(`${api}/v2/gateway/get_gateway`, config)

    if (response?.data.status === 'error') {
      console.error(response.data.message)
    }

    return response?.data
  } catch (err) {
    if (err.response?.data?.status === 'error') {
      console.error(err.response.data?.message)
    } else {
      console.error(err)
    }
  }
}

module.exports = { getGateway }
