const axios = require('axios')

const getBuckets = async (api, jwt) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(`${api}/v2/bucket/get_bucket_list`, config)

    return res.data
  } catch (err) {
    console.error(err.response?.data)
  }
}

const createBucket = async (api, jwt, bucketName) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }

  try {
    const res = await axios.post(
      `${api}/v2/bucket/create/`,
      { bucket_name: `${bucketName.trim()}` },
      config,
    )

    return res.data
  } catch (err) {
    console.error(err.response?.data)
  }
}

const deleteBucket = async (api, jwt, bucketUid) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }

  try {
    const res = await axios.get(
      `${api}/v2/bucket/delete?bucket_uid=${bucketUid}`,
      config,
    )

    return res.data
  } catch (err) {
    console.error(err.response?.data)
  }
}

const renameBucket = async (api, jwt, bucketUid, newName) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }

  try {
    const res = await axios.post(
      `${api}/v2/bucket/rename`,
      {
        bucket_name: newName,
        bucket_uid: bucketUid,
      },
      config,
    )

    return res.data
  } catch (err) {
    console.error(err.response?.data)
  }
}

module.exports = { getBuckets, createBucket, deleteBucket, renameBucket }
