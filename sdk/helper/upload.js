const { uploadPromise } = require('./mcsApi')

const mcsUpload = async (mcsApi, jwt, address, files, options) => {
  const delayIncrement = parseInt(options?.delay) || 1000
  let apiDelay = 0

  const requests = files.map((file) => {
    apiDelay += delayIncrement // staggers each api call
    return new Promise((resolve) => setTimeout(resolve, apiDelay)).then(() =>
      uploadPromise(
        mcsApi,
        jwt,
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
