const axios = require('axios')

const getJwt = async (api, apiKey) => {
  try {
    const response = await axios.post(`${api}/v2/user/login_by_api_key`, {
      apikey: apiKey,
    })

    if (response?.data.status === 'error') {
      console.error(response.data.message)
    }

    return response.data?.data
  } catch (err) {
    if (err.response?.data?.status === 'error') {
      console.error(err.response.data?.message)
    } else {
      console.error(err)
    }
  }
}

module.exports = { getJwt }
