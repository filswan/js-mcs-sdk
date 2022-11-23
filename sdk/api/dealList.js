const axios = require('axios')
const { MCS_API } = require('../helper/constants')

const getDealList = async (
  jwt,
  { address, name, orderBy, isAscend, status, isMinted, pageNumber, pageSize },
) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(
      `${MCS_API}storage/tasks/deals?page_size=${pageSize || ''}&page_number=${
        pageNumber || ''
      }&file_name=${name || ''}&wallet_address=${address || ''}&order_by=${
        orderBy || ''
      }&is_ascend=${isAscend || ''}&status=${status || ''}&is_minted=${
        isMinted || ''
      }`,
      config,
    )
    return res?.data
  } catch (err) {
    console.error(err)
  }
}

module.exports = { getDealList }
