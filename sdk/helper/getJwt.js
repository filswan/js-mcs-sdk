const axios = require('axios')
const { MCS_API } = require('./constants')

const getJwt = async (accessToken, apiKey, loginNetwork) => {
  try {
    const response = await axios.post(`${MCS_API}user/login_by_api_key`, {
      apikey: apiKey,
      access_token: accessToken,
      network: loginNetwork,
    })

    if (response?.data.status === 'error') {
      throw new Error(response.data.message)
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
