const { BUCKETS_API } = require('../../helper/constants')
const axios = require('axios')
axios.defaults.maxBodyLength = Infinity
const fs = require('fs')
const { request } = require('urllib')
const SparkMD5 = require('spark-md5')
const FormData = require('form-data')
let path = require('path')

let getChildFile = (path) => {
  let pathArray = path.split('/')
  return pathArray[pathArray.length - 1]
}

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

let uploadChunks = async (jwt, filePath, fileName, hash, log) => {
  const chunkSize = 10 * 1024 * 1024 //10MB
  const fileSize = fs.statSync(filePath).size
  let offset = 0
  let chunkNum = 1

  if (log)
    console.log('uploading', Math.ceil(fileSize / chunkSize), 'chunks...')

  while (offset < fileSize) {
    const chunk = fs.createReadStream(filePath, {
      start: offset,
      end: Math.min(offset + chunkSize - 1, fileSize),
    })

    const formData = new FormData()
    formData.append('file', chunk, `${chunkNum}_${fileName}`)
    formData.append('hash', hash)

    //console.log(formData)

    try {
      const response = await axios.post(
        `${BUCKETS_API}oss_file/upload`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${jwt}`,
          },
        },
      )
      if (log) console.log('uploaded chunk', chunkNum)
      //console.log(response.data)
    } catch (err) {
      console.error(err)
    }

    offset += chunkSize
    chunkNum += 1
  }
}

let merge = async (jwt, file, hash, bucket_uid, prefix) => {
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
    let res = await axios.post(`${BUCKETS_API}oss_file/merge`, body, config)
    return res.data
  } catch (err) {
    console.log(err.response.data)
  }
}

let check = async (jwt, file, hash, bucket_uid, prefix) => {
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
    let res = await axios.post(`${BUCKETS_API}oss_file/check`, body, config)
    return res.data
  } catch (err) {
    console.log('CHECK ERROR')
  }
}

const uploadToBucket = async (jwt, filePath, bucketUid, folder, log) => {
  let stats = fs.lstatSync(filePath)
  if (stats.isFile()) {
    return await uploadFile(jwt, filePath, bucketUid, folder, log)
  } else if (stats.isDirectory()) {
    return await uploadDirectory(jwt, filePath, bucketUid, folder, log)
  }
}

const uploadFile = async (jwt, filePath, bucketUid, folder, log) => {
  let md5 = await hashFile(filePath)

  let res = await check(jwt, md5.filename, md5.hash, bucketUid, folder)

  console.log(res)

  await uploadChunks(jwt, filePath, md5.filename, md5.hash, log)
  if (!res.data.ipfs_is_exist && !res.data.file_is_exist) {
    res = await merge(jwt, md5.filename, md5.hash, bucketUid, folder)
  }

  return res
}

const uploadDirectory = async (jwt, filePath, bucketUid, folder, log) => {
  let pathWithoutSlash =
    filePath.slice(-1) === '/' ? filePath.slice(0, -1) : filePath
  let folderName = getChildFile(pathWithoutSlash)

  let folderRes = await createFolder(jwt, bucketUid, folderName, folder)
  if (!folderRes) {
    return
  }

  let res = []

  let files = fs.readdirSync(filePath)
  for (let i = 0; i < files.length; i++) {
    if (log) console.log(`uploading ${files[i]}...`)
    let uploadRes = await uploadToBucket(
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

const downloadFile = async (jwt, fileId, outputDirectory) => {
  try {
    let file = await getFileInfo(jwt, fileId)

    if (!file) {
      throw new Error('file not found')
    }

    let name = outputDirectory.endsWith('/')
      ? outputDirectory + file.data.Name
      : outputDirectory + '/' + file.data.Name

    let res = await request(file.data.IpfsUrl)
    await fs.promises.writeFile(name, res.data, (err) => {
      if (err) {
        console.error(err)
      }
    })
  } catch (err) {
    console.error(err)
  }
}

const getFileList = async (jwt, bucketUid, { prefix, limit, offset }) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(
      `${BUCKETS_API}oss_file/get_file_list?prefix=${prefix}&bucket_uid=${bucketUid}&limit=${limit}&offset=${offset}`,
      config,
    )

    return res.data
  } catch (err) {
    console.error(err.response?.data)
  }
}

const getFileInfo = async (jwt, fileId) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }

  try {
    const res = await axios.get(
      `${BUCKETS_API}oss_file/get_file_info?file_id=${fileId}`,
      config,
    )

    return res.data
  } catch (err) {
    console.error(err.response?.data)
  }
}

const deleteFile = async (jwt, fileId) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }

  try {
    const res = await axios.get(
      `${BUCKETS_API}oss_file/delete?file_id=${fileId}`,
      config,
    )

    return res.data
  } catch (err) {
    console.error(err.response?.data)
  }
}

const createFolder = async (jwt, bucketUid, folderName, prefix) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }

  try {
    const res = await axios.post(
      `${BUCKETS_API}oss_file/create_folder`,
      {
        file_name: folderName,
        prefix,
        bucket_uid: bucketUid,
      },
      config,
    )

    return res.data
  } catch (err) {
    console.error(err.response?.data)
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
