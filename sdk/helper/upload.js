const axios = require('axios')
const FormData = require('form-data')
const { Agent } = require('https')

const uploadPromise = (
  apiUrl,
  fileName,
  file,
  wallet_address,
  duration = 525,
  file_type = '0',
) => {
  const form = new FormData()
  form.append('duration', duration)
  form.append('file', file, fileName)
  form.append('wallet_address', wallet_address)
  form.append('file_type', file_type)

  const res = axios.post(`${apiUrl}/storage/ipfs/upload`, form, {
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    maxRedirects: 0,
    agent: new Agent({ rejectUnauthorized: false }),
    headers: {
      ...form.getHeaders(),
    },
  })

  return res
}

const mcsUpload = async (apiUrl, address, files, options) => {
  const delayIncrement = parseInt(options?.delay) || 1000
  let apiDelay = 0

  const requests = files.map((file) => {
    apiDelay += delayIncrement // staggers each api call
    return new Promise((resolve) => setTimeout(resolve, apiDelay)).then(() =>
      uploadPromise(
        apiUrl,
        file.fileName,
        file.file,
        address,
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
    console.log(err.response?.data || err)
  }
}

module.exports = { mcsUpload }
