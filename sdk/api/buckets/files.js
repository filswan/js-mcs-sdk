const { BUCKETS_API } = require("../../helper/constants")
const { getBuckets } = require("./buckets")
const axios = require("axios")
const fs = require("fs")
const { Agent } = require("https")
const { request } = require("urllib")

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
    const res = await axios.put(`${BUCKETS_API}file/upload`, sessionObj, config)

    if (res.data.status === "error") {
      throw new Error(res.data.message)
    }

    return res.data
  } catch (err) {
    console.error(err)
  }
}

const uploadToBucket = async (jwt, bucketName, fileName, filePath) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    maxRedirects: 0,
    agent: new Agent({ rejectUnauthorized: false }),
  }

  try {
    const session = await createUploadSession(
      jwt,
      bucketName,
      fileName,
      filePath
    )

    if (session.status == "error") throw new Error(session.message)

    const res = await axios.post(
      `${BUCKETS_API}file/upload/${session.data.sessionID}/0`,
      fs.createReadStream(filePath),
      config
    )

    if (res.data.status === "error") {
      throw new Error(res.data.message)
    }

    return res.data
  } catch (err) {
    console.error(err)
  }
}

const downloadFile = async (jwt, bucketName, fileName, outputDirectory) => {
  try {
    let bucketInfo = await getBuckets(jwt, bucketName)
    let files = bucketInfo.data?.objects

    let file = files.find((f) => f.name == fileName)

    if (!file) {
      throw new Error("file not found")
    }

    let name = outputDirectory.endsWith("/")
      ? outputDirectory + file.ipfs_url?.split("?filename=").pop()
      : outputDirectory + "/" + file.ipfs_url?.split("?filename=").pop()

    let res = await request(file.ipfs_url)
    await fs.promises.writeFile(name, res.data, (err) => {
      if (err) {
        console.error(err)
      }
    })
  } catch (err) {
    console.error(err)
  }
}

module.exports = { uploadToBucket, downloadFile }
