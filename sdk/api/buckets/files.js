const axios = require('axios')
axios.defaults.maxBodyLength = Infinity
const fs = require('fs')
const { request } = require('urllib')
const SparkMD5 = require('spark-md5')
const FormData = require('form-data')
let path = require('path')

// Function to extract the file name from a file path
let getChildFile = (path) => {
  let pathArray = path.split('/')
  return pathArray[pathArray.length - 1]
}

let getPrefix = (path) => {
  return path.substring(0, path.lastIndexOf('/'))
}

// Async function to generate the hash of a file
let hashFile = async (file) => {
  return new Promise((resolve) => {
    fs.readFile(file, null, (err, nb) => {
      let buffer = nb.buffer
      let spark = new SparkMD5.ArrayBuffer()

      spark.append(buffer)
      hash = spark.end()

      let regex = /\.([a-zA-Z0-9]+)$/
      let suffix = regex.exec(file) ? regex.exec(file)[1] : ''

      resolve({ buffer, hash, suffix, filename: getChildFile(file) })
    })
  })
}

// Async function to upload a file in chunks
let uploadChunks = async (api, jwt, filePath, fileName, hash) => {
  const chunkSize = 10 * 1024 * 1024 //10MB
  const fileSize = fs.statSync(filePath).size
  let offset = 0
  let chunkNum = 1

  // Iterate over all the chunks and send them to the server using axios
  while (offset < fileSize) {
    const chunk = fs.createReadStream(filePath, {
      start: offset,
      end: Math.min(offset + chunkSize - 1, fileSize),
    })

    const formData = new FormData()
    formData.append('file', chunk, `${chunkNum}_${fileName}`)
    formData.append('hash', hash)

    try {
      const response = await axios.post(`${api}/v2/oss_file/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${jwt}`,
        },
      })
    } catch (err) {
      return err.response?.data
    }

    offset += chunkSize
    chunkNum += 1
  }
}

let check = async (api, jwt, file, hash, bucket_uid, prefix) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }

  let body = {
    file_hash: hash,
    file_name: file,
    prefix,
    bucket_uid,
  }

  try {
    let res = await axios.post(`${api}/v2/oss_file/check`, body, config)
    return res.data
  } catch (err) {
    return err.response?.data
  }
}

// Async function to merge the uploaded chunks into a single file
let merge = async (api, jwt, file, hash, bucket_uid, prefix) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }

  let body = {
    file_hash: hash,
    file_name: file,
    prefix,
    bucket_uid,
  }

  try {
    let res = await axios.post(`${api}/v2/oss_file/merge`, body, config)
    return res.data
  } catch (err) {
    return err.response?.data
  }
}

const uploadToBucket = async (
  api,
  jwt,
  bucketUid,
  objectName,
  filePath,
  replace,
) => {
  let stats = fs.lstatSync(filePath)
  if (stats.isFile()) {
    return await uploadFile(api, jwt, bucketUid, objectName, filePath, replace)
  } else if (stats.isDirectory()) {
    return await uploadDirectory(
      api,
      jwt,
      bucketUid,
      objectName,
      filePath,
      replace,
    )
  }
}

const uploadFile = async (
  api,
  jwt,
  bucketUid,
  objectName,
  filePath,
  replace,
) => {
  let fileName = getChildFile(objectName)
  let prefix = getPrefix(objectName)
  let md5 = await hashFile(filePath)

  let res = await check(api, jwt, fileName, md5.hash, bucketUid, prefix)

  if (res.status === 'error') {
    console.error(res.message)
  }

  if (replace && res.data.ipfs_is_exist) {
    let file = await getFileInfo(api, jwt, bucketUid, objectName)
    deleteFile(api, jwt, file.data.id)
    res = await check(api, jwt, fileName, md5.hash, bucketUid, prefix)
  }

  await uploadChunks(api, jwt, filePath, fileName, md5.hash)
  if (!res.data.ipfs_is_exist && !res.data.file_is_exist) {
    res = await merge(api, jwt, fileName, md5.hash, bucketUid, prefix)
  }

  return res
}

const uploadDirectory = async (
  api,
  jwt,
  bucketUid,
  objectName,
  filePath,
  replace,
) => {
  let folderRes = await createFolder(api, jwt, bucketUid, objectName)
  if (!folderRes) {
    return
  }

  if (
    replace &&
    folderRes.message == 'invalid param value:folder already exists'
  ) {
    let file = await getFileInfo(api, jwt, bucketUid, objectName)
    deleteFile(api, jwt, file.data.id)
    folderRes = await createFolder(api, jwt, bucketUid, objectName)
  }

  let res = []

  let files = fs.readdirSync(filePath)
  for (let i = 0; i < files.length; i++) {
    let uploadRes = await uploadToBucket(
      api,
      jwt,
      bucketUid,
      `${objectName}/${files[i]}`,
      `${filePath}/${files[i]}`,
    )

    res.push(uploadRes)
  }

  return res
}

const downloadFile = async (
  api,
  jwt,
  bucketUid,
  objectName,
  outputDirectory,
) => {
  try {
    let file = await getFileInfo(api, jwt, bucketUid, objectName)

    if (!file) {
      console.error('file not found')
    }

    let name = outputDirectory.endsWith('/')
      ? outputDirectory + file.data.name
      : outputDirectory + '/' + file.data.name

    let res = await request(file.data.ipfs_url)

    await fs.promises.writeFile(name, res.data, (err) => {
      if (err) {
        console.error(err.message)
      }
    })
    return { status: 'success' }
  } catch (err) {
    return { status: 'error', message: err.message }
  }
}

const getFileList = async (api, jwt, bucketUid, { prefix, limit, offset }) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(
      `${api}/v2/oss_file/get_file_list?prefix=${prefix}&bucket_uid=${bucketUid}&limit=${limit}&offset=${offset}`,
      config,
    )

    return res.data
  } catch (err) {
    return err.response?.data
  }
}

const getFileInfo = async (api, jwt, bucketUid, objectName) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(
      `${api}/v2/oss_file/get_file_by_object_name?bucket_uid=${bucketUid}&object_name=${objectName}`,
      config,
    )

    return res.data
  } catch (err) {
    return err.response?.data
  }
}

const deleteFile = async (api, jwt, fileId) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }

  try {
    const res = await axios.get(
      `${api}/v2/oss_file/delete?file_id=${fileId}`,
      config,
    )

    return res.data
  } catch (err) {
    return err.response?.data
  }
}

const createFolder = async (api, jwt, bucketUid, objectName) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }

  let folderName = getChildFile(objectName)
  let prefix = getPrefix(objectName)

  try {
    const res = await axios.post(
      `${api}/v2/oss_file/create_folder`,
      {
        file_name: folderName,
        prefix,
        bucket_uid: bucketUid,
      },
      config,
    )

    return res.data
  } catch (err) {
    return err.response?.data
  }
}

module.exports = {
  uploadToBucket,
  downloadFile,
  getFileList,
  getFileInfo,
  deleteFile,
  createFolder,
}
