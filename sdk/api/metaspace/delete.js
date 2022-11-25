const { METASPACE_API } = require('../../helper/constants')
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
    const res = await axios.delete(`${METASPACE_API}object`, config)
    return res.data
  } catch (err) {
    console.error(err)
  }
}

module.exports = { deleteItems }
