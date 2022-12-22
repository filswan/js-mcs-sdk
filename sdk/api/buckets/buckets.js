const { BUCKETS_API } = require('../../helper/constants')
const axios = require('axios')

const getBuckets = async (jwt) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(`${BUCKETS_API}bucket/get_bucket_list`, config)

    return res.data
  } catch (err) {
    console.error(err.response?.data)
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

    return res.data
  } catch (err) {
    console.error(err.response?.data)
  }
}

const deleteBucket = async (jwt, bucketUid) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }

  try {
    const res = await axios.get(
      `${BUCKETS_API}bucket/delete?bucket_uid=${bucketUid}`,
      config,
    )

    return res.data
  } catch (err) {
    console.error(err.response?.data)
  }
}

module.exports = { getBuckets, createBucket, deleteBucket }
