const { BUCKETS_API } = require('../../helper/constants')
const axios = require('axios')

const getBuckets = async (jwt, bucketName) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(
      `${BUCKETS_API}bucket/get_bucket_list/${bucketName ?? ''}`,
      config,
    )

    if (res.data.status === 'error') {
      throw new Error(res.data.message)
    }

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
    const res = await axios.post(
      `${BUCKETS_API}bucket/create/`,
      { bucket_name: `${bucketName.trim()}` },
      config,
    )

    if (res.data.status === 'error') {
      throw new Error(res.data.message)
    }

    return res.data
  } catch (err) {
    console.error(err)
  }
}

module.exports = { getBuckets, createBucket }
