const axios = require('axios')
const { MCS_API } = require('../../utils/constants')
const FormData = require('form-data')
const { Agent } = require('https')

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

const mcsUpload = async (api, jwt, files, options) => {
  const delayIncrement = parseInt(options?.delay) || 1000
  let apiDelay = 0

  const requests = files.map((file) => {
    apiDelay += delayIncrement // staggers each api call
    return new Promise((resolve) => setTimeout(resolve, apiDelay)).then(() =>
      uploadPromise(
        api,
        jwt,
        file.fileName,
        file.file,
        options?.duration,
        options?.fileType || 0,
      ).then((res) => {
        return res.data
      }),
    )
  })

  try {
    const result = await Promise.all(requests) // wait for all uploads
    return result
  } catch (err) {
    if (err.response?.data?.status === 'error') {
      console.error(err.response.data?.message)
    } else {
      console.error(err)
    }
  }
}

module.exports = { mcsUpload }