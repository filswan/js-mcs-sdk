const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const { Agent } = require('https')

let getChildFile = (path) => {
  let pathArray = path.split('/')
  return pathArray[pathArray.length - 1]
}

const uploadPromise = (
  api,
  jwt,
  fileName,
  file,
  duration = 525,
  file_type = '0',
) => {
  const form = new FormData()
  form.append('duration', duration)
  form.append('file', file, fileName)
  form.append('file_type', file_type)

  const res = axios.post(`${api}/v1/storage/ipfs/upload`, form, {
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    maxRedirects: 0,
    agent: new Agent({ rejectUnauthorized: false }),
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${jwt}`,
    },
  })

  return res
}

const mcsUpload = async (api, jwt, filePath, options) => {
  const file = {
    fileName: getChildFile(filePath),
    file: fs.createReadStream(filePath),
  }

  try {
    const res = await uploadPromise(
      api,
      jwt,
      file.fileName,
      file.file,
      options?.duration,
      options?.fileType || 0,
    )
    return res.data
  } catch (err) {
    if (err.response?.data?.status === 'error') {
      console.error(err.response.data?.message)
    } else {
      console.error(err)
    }
  }
}

const metadataUpload = async (api, jwt, fileName, file, options) => {
  try {
    const res = await uploadPromise(
      api,
      jwt,
      fileName,
      file,
      options?.duration,
      options?.fileType || 1,
    )
    return res.data
  } catch (err) {
    if (err.response?.data?.status === 'error') {
      console.error(err.response.data?.message)
    } else {
      console.error(err)
    }
  }
}

module.exports = { mcsUpload, metadataUpload }
