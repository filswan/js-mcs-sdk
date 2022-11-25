const { METASPACE_API } = require('../../helper/constants')
const { getBuckets } = require('./buckets')
const axios = require('axios')
const fs = require('fs')

const createUploadSession = async (jwt, bucketName, fileName, filePath) => {
  const bucketInfo = await getBuckets(jwt, bucketName)
  const sessionObj = {
    path: `/${bucketName}`,
    size: fs.statSync(filePath).size,
    name: fileName,
    policy_id: bucketInfo.data.policy.id,
    last_modified: Math.floor(Date.now() / 1000),
  }

  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.put(
      `${METASPACE_API}file/upload`,
      sessionObj,
      config,
    )
    return res.data
  } catch (err) {
    console.error(err)
  }
}

const uploadToBucket = async (jwt, bucketName, fileName, filePath) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }

  try {
    const session = await createUploadSession(
      jwt,
      bucketName,
      fileName,
      filePath,
    )

    if (session.status == 'error') throw new Error(session.message)

    const res = await axios.post(
      `${METASPACE_API}file/upload/${session.data.sessionID}/0`,
      { file: fs.createReadStream(filePath) },
      config,
    )
    return res.data
  } catch (err) {
    console.error(err)
  }
}

module.exports = { uploadToBucket }