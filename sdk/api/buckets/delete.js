const { BUCKETS_API } = require('../../helper/constants')
const axios = require('axios')

const deleteItems = async (jwt, buckets, files) => {
  let deleteObject = {
    items: files,
    dirs: buckets,
  }

  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
    data: deleteObject,
  }
  try {
    const res = await axios.delete(`${BUCKETS_API}object`, config)

    if (res.data.status === 'error') {
      throw new Error(res.data.message)
    }

    return res.data
  } catch (err) {
    console.error(err)
  }
}

module.exports = { deleteItems }
