const axios = require('axios')
const { MCS_API } = require('./constants')

const getParams = async () => {
  try {
    const params = await axios.get(`${MCS_API}common/system/params`)
    return params.data?.data
  } catch (err) {
    console.log(err)
  }
}

module.exports = { getParams }
