const axios = require('axios')
const getParams = async (api) => {
  try {
    const params = await axios.get(`${api}/v1/common/system/params`)
    return params.data?.data
  } catch (err) {
    console.log(err)
  }
}

module.exports = { getParams }
