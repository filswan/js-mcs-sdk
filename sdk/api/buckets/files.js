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
let uploadChunks = async (api, jwt, filePath, fileName, hash, log) => {
  const chunkSize = 10 * 1024 * 1024 //10MB
  const fileSize = fs.statSync(filePath).size
  let offset = 0
  let chunkNum = 1

  if (log)
    console.log('uploading', Math.ceil(fileSize / chunkSize), 'chunks...')

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
      if (log) console.log('uploaded chunk', chunkNum)
    } catch (err) {
      if (log) console.log(err.response?.data)
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

const uploadToBucket = async (api, jwt, filePath, bucketUid, folder, log) => {
  let stats = fs.lstatSync(filePath)
  if (stats.isFile()) {
    return await uploadFile(api, jwt, filePath, bucketUid, folder, log)
  } else if (stats.isDirectory()) {
    return await uploadDirectory(api, jwt, filePath, bucketUid, folder, log)
  }
}

const uploadFile = async (api, jwt, filePath, bucketUid, folder, log) => {
  let md5 = await hashFile(filePath)

  let res = await check(api, jwt, md5.filename, md5.hash, bucketUid, folder)
  if (res.status === 'error') {
    console.error(res.message)
  }

  await uploadChunks(api, jwt, filePath, md5.filename, md5.hash, log)
  if (!res.data.ipfs_is_exist && !res.data.file_is_exist) {
    res = await merge(api, jwt, md5.filename, md5.hash, bucketUid, folder)
  }

  return res
}

const uploadDirectory = async (api, jwt, filePath, bucketUid, folder, log) => {
  let pathWithoutSlash =
    filePath.slice(-1) === '/' ? filePath.slice(0, -1) : filePath
  let folderName = getChildFile(pathWithoutSlash)

  let folderRes = await createFolder(api, jwt, bucketUid, folderName, folder)
  if (!folderRes) {
    return
  }

  let res = []

  let files = fs.readdirSync(filePath)
  for (let i = 0; i < files.length; i++) {
    if (log) console.log(`uploading ${files[i]}...`)
    let uploadRes = await uploadToBucket(
      api,
      jwt,
      `${pathWithoutSlash}/${files[i]}`,
      bucketUid,
      `${folder ? folder + '/' : ''}${folderName}`,
      log,
    )

    res.push(uploadRes)
  }

  return res
}

const downloadFile = async (api, jwt, fileId, outputDirectory) => {
  try {
    let file = await getFileInfo(api, jwt, fileId)

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

const getFileInfo = async (api, jwt, fileId) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }

  try {
    const res = await axios.get(
      `${api}/v2/oss_file/get_file_info?file_id=${fileId}`,
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

const createFolder = async (api, jwt, bucketUid, folderName, prefix) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }

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
