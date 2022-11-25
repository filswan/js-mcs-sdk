const { METASPACE_API } = require('../../helper/constants')
const axios = require('axios')

const deleteBucket = async (jwt, bucketId) => {
  let deleteObject = {
    items: [],
    dirs: [bucketId],
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

const deleteFiles = async (jwt, bucketId) => {
  let deleteObject = {
    items: [],
    dirs: [bucketId],
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
