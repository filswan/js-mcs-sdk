const packageJson = require('./package.json')
const Web3 = require('web3')

const API = require('./utils/constants')
const {
  getBuckets,
  createBucket,
  deleteBucket,
  renameBucket,
} = require('./api/buckets/buckets')
const {
  uploadToBucket,
  downloadFile,
  getFileList,
  getFileInfo,
  deleteFile,
  createFolder,
  getPrefix,
  buildObjectPath,
} = require('./api/buckets/files')
const { getJwt } = require('./utils/getJwt')
const { getGateway } = require('./utils/gateway')

class mcsSDK {
  /**
   * @constructor
   */
  constructor(apiKey, jwt, api) {
    this.version = packageJson.version
    this.apiKey = apiKey
    this.jwt = jwt
    this.api = api
    this.web3Initialized = false
  }

  /**
   * Initializes new MCS SDK instance
   *
   * @param {string} accessToken - SDK Access Token
   * @param {string} apiKey - SDK API Key
   * @param {string} [chainName="polygon.mainnet"] - MCS environment (ex. polygon.mainnet or polygon.mumbai)
   * @param {string} privateKey - wallet private key
   * @param {string} [rpcUrl="https://polygon-rpc.com/"] - RPC url (must match chain name env)
   * @returns {Object} MCS SDK instance
   */
  static async initialize({ apiKey, isCalibration = false } = {}) {
    let api = API.MCS_API
    // if (chainName === 'polygon.mainnet') {
    //   api = API.MCS_API
    // } else if (chainName === 'polygon.mumbai') {
    //   api = API.MCS_MUMBAI_API
    // } else {
    //   console.error('unknown chain name')
    // }

    if (isCalibration) api = API.MCS_MUMBAI_API

    if (!apiKey) {
      console.error(
        'Missing API key. Please check your parameters, or visit https://www.multichain.storage/ to generate an API key.',
      )
    } else {
      let jwt = await getJwt(api, apiKey)

      let sdk = new mcsSDK(apiKey, jwt, api)

      return sdk
    }
  }

  /**
   * maps chain name to chain id
   * @param {string} chainName - MCS environment (ex. polygon.mainnet or polygon.mumbai)
   * @returns {number} chain id
   */
  mapChainName = (chainName) => {
    if (chainName == 'polygon.mainnet') {
      return 137
    } else if (chainName == 'polygon.mumbai') {
      return 80001
    }
    return -1
  }

  /**
   * Initialize web3.js
   * @param {string} privateKey - wallet's private key
   * @param {string} rpcUrl - RPC URL
   */
  setupWeb3 = async (privateKey, rpcUrl = 'https://polygon-rpc.com/') => {
    this.web3 = new Web3(rpcUrl)
    const chainId = await this.web3.eth.getChainId()

    if (chainId != this.mapChainName(this.chainName)) {
      this.web3Initialized = false
      console.error(
        `RPC Chain ID (${chainId}) does not match SDK chain name (${this.chainName})`,
      )
    }

    this.web3.eth.accounts.wallet.add(privateKey)
    this.walletAddress = this.web3.eth.accounts.privateKeyToAccount(
      privateKey,
    ).address
    this.web3Initialized = true
  }

  /**
   * Create a MCS Bucket
   * @param {string} bucketName - name of new bucket
   * @returns {Object} - bucket data
   */
  createBucket = async (bucketName) => {
    return await createBucket(this.api, this.jwt, bucketName)
  }

  /**
   * Get bucket list
   * @returns {Object[]} - bucket data
   */
  getBuckets = async () => {
    return await getBuckets(this.api, this.jwt)
  }

  /**
   * Get bucket list
   * @returns {Object[]} - bucket data
   */
  getBucketList = async () => {
    return await getBuckets(this.api, this.jwt)
  }

  getBucket = async (bucketName) => {
    let list = (await this.getBucketList()).data
    return list.find((b) => (b.bucket_name = bucketName))
  }

  /**
   * Delete a MCS Bucket
   * @param {string} bucketName - bucket name
   * @returns {Object}
   */
  deleteBucket = async (bucketName) => {
    let bucket = await this.getBucket(bucketName)
    return await deleteBucket(this.api, this.jwt, bucket.bucket_uid)
  }

  /**
   * Get file list
   * @param {string} bucketName - bucket name
   * @param {Object} params
   * @param {string} [params.prefix=''] - gets file list from this path in the bucket
   * @param {number} [params.limit=10] - limit the result list
   * @param {number} [params.offset=0] - offset the results
   * @returns {Object[]} - file data
   */
  getFileList = async (bucketName, params) => {
    let bucket = await this.getBucket(bucketName)
    if (!params) params = { prefix: '', limit: 10, offset: 0 }
    let prefix = params.prefix || ''
    let limit = params.limit || 10
    let offset = params.offset || 0

    let list = await getFileList(this.api, this.jwt, bucket.bucket_uid, {
      prefix,
      limit,
      offset,
    })

    return list.data
  }

  /**
   * Get file list
   * @param {string} bucketName - bucket name
   * @param {Object} params
   * @param {string} [params.prefix=''] - gets file list from this path in the bucket
   * @param {number} [params.limit=10] - limit the result list
   * @param {number} [params.offset=0] - offset the results
   * @returns {Object[]} - file data
   */
  getFiles = async (bucketName, params) => {
    let bucket = await this.getBucket(bucketName)
    if (!params) params = { prefix: '', limit: 10, offset: 0 }
    let prefix = params.prefix || ''
    let limit = params.limit || 10
    let offset = params.offset || 0

    // console.log('params:', { prefix, limit, offset })
    let list = await getFileList(this.api, this.jwt, bucket.bucket_uid, {
      prefix,
      limit,
      offset,
    })

    return list.data
  }

  /**
   * Get single file info
   * @param {string} fileId - fileId
   * @returns {Array} - file data
   */
  getFileInfo = async (bucketName, objectName) => {
    let bucket = await this.getBucket(bucketName)
    return await getFileInfo(this.api, this.jwt, bucket.bucket_uid, objectName)
  }

  /**
   * Delete single file
   * @param {string} fileId - fileId
   * @returns {Array} - file data
   */
  deleteFile = async (bucketName, objectName) => {
    let file = await this.getFileInfo(bucketName, objectName)
    return await deleteFile(this.api, this.jwt, file.data.id)
  }

  /**
   * Create new folder
   * @param {string} bucketName - bucket name
   * @param {string} folderName - name for new folder
   * @param {string} [prefix=''] - path in bucket for new folder
   * @returns {Array} - folder data
   */
  createFolder = async (bucketName, objectName) => {
    let bucket = await this.getBucket(bucketName)
    return await createFolder(this.api, this.jwt, bucket.bucket_uid, objectName)
  }

  /**
   * Create new folder
   * @param {string} bucketName - bucket uid
   * @param {string} objectName - path in bucket for file
   * @param {string} filePath - path to file
   * @returns {Array} - upload data
   */
  uploadToBucket = async (
    bucketName,
    objectName,
    filePath,
    replace = false,
  ) => {
    let bucket = await this.getBucket(bucketName)
    let uploadResponse = await uploadToBucket(
      this.api,
      this.jwt,
      bucket.bucket_uid,
      objectName,
      filePath,
      replace,
    )

    let folderPath = getPrefix(objectName)
    await buildObjectPath(this.api, this.jwt, bucket.bucket_uid, folderPath)

    return uploadResponse
  }

  /**
   * Downloads a file from IPFS
   * @param {string} fileId - file id
   * @param {string} outputDirectory - where to download the file
   */
  downloadFile = async (bucketName, objectName, outputDirectory = '.') => {
    let bucket = await this.getBucket(bucketName)
    return await downloadFile(
      this.api,
      this.jwt,
      bucket.bucket_uid,
      objectName,
      outputDirectory,
    )
  }

  /**
   * Rename bucket
   * @param {string} oldName - bucket uid
   * @param {string} newName - new bucket name
   */
  renameBucket = async (oldName, newName) => {
    let bucket = await this.getBucket(oldName)
    return await renameBucket(this.api, this.jwt, bucket.bucket_uid, newName)
  }

  getGateway = async () => {
    let gateways = await getGateway(this.api, this.jwt) // { status, data: [<gateways>] }
    return gateways.data[0]
  }
}

module.exports = { mcsSDK }
