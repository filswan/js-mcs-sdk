const { METASPACE_API } = require('../../helper/constants')
const axios = require('axios')

const getBuckets = async (jwt, bucketName) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(
      `${METASPACE_API}directory/${bucketName ?? ''}`,
      config,
    )
    return res.data
  } catch (err) {
    console.error(err)
  }
}

const createBucket = async (jwt, bucketName) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.put(
      `${METASPACE_API}directory`,
      { path: `/${bucketName}` },
      config,
    )
    return res.data
  } catch (err) {
    console.error(err)
  }
}
module.exports = { getBuckets, createBucket }
