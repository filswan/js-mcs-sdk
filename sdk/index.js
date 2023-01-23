const packageJson = require('./package.json')
const Web3 = require('web3')

const API = require('./helper/constants')
const { lockToken } = require('./api/makePayment')
const { getDealDetail } = require('./api/dealDetail')
const { mint } = require('./api/mint')
const { mcsUpload } = require('./api/upload')
const { getFileStatus } = require('./api/fileStatus')
const { getDealList } = require('./api/dealList')
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
} = require('./api/buckets/files')
const { getJwt } = require('./helper/getJwt')

class mcsSDK {
  constructor(chainName, accessToken, apiKey, jwt, api) {
    this.version = packageJson.version
    this.accessToken = accessToken
    this.apiKey = apiKey
    this.jwt = jwt
    this.api = api
    this.web3Initialized = false
    this.chainName = chainName
  }

  /**
   * Initializes new MCS SDK instance
   *
   * @param {string} privateKey - wallet private key
   * @param {string} rpcUrl - endpoint to read and send data on the blockchain
   * @returns {Object} MCS SDK instance
   */
  static async initialize({
    privateKey,
    rpcUrl = 'https://polygon-rpc.com/',
    chainName = 'polygon.mainnet',
    accessToken,
    apiKey,
    jwt,
  } = {}) {
    let api
    if (chainName === 'polygon.mainnet') {
      api = API.MCS_API
    } else if (chainName == 'polygon.mumbai') {
      api = API.MCS_MUMBAI_API
    } else {
      throw new Error('unknown chain name')
    }

    if (!accessToken || !apiKey) {
      throw new Error(
        'Missing access token/API key. Please check your parameters, or visit https://www.multichain.storage/ to generate an API key.',
      )
    }

    if (!jwt) {
      jwt = (await getJwt(api, accessToken, apiKey, chainName)).jwt_token
    }

    if (privateKey && rpcUrl) {
      await setupWeb3(privateKey, rpcUrl)
    }

    return new mcsSDK(chainName, accessToken, apiKey, jwt, api)
  }

  mapChainName = (chainName) => {
    if (chainName == 'polygon.mainnet') {
      return 137
    } else if (chainName == 'polygon.mumbai') {
      return 80001
    }
    return -1
  }

  setupWeb3 = async (privateKey, rpcUrl = 'https://polygon-rpc.com/') => {
    this.web3 = new Web3(rpcUrl)
    const chainId = await this.web3.eth.getChainId()

    if (chainId != this.mapChainName(this.chainName)) {
      this.web3Initialized = false
      throw new Error(
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
   * Uploads file(s) using MCS upload API
   *
   * @param {[{fileName: string, file: Object}]} files - files should be file buffers, json stringify, or readstreams
   * @param {{delay: number, duration: number, fileType: number}} [options]
   * @returns {Array} Array of upload API responses
   */
  upload = async (files, options) => {
    if (!this.web3Initialized) {
      throw new Error('web3 not setup, call setupWeb3 first')
    }

    return await mcsUpload(
      this.api,
      this.walletAddress,
      this.jwt,
      files,
      options,
    )
  }

  /**
   * Makes payment for unpaid files on MCS. Throws error if file is already paid.
   *
   * @param {Number} sourceFileUploadId
   * @param {string} amount - pass amount as string to avoid BN precision errors
   * @param {string} size - file size in bytes
   * @returns {Object} payment transaction response
   */
  makePayment = async (sourceFileUploadId, amount, size) => {
    if (!this.web3Initialized) {
      throw new Error('web3 not setup, call setupWeb3 first')
    }

    let tx = await lockToken(
      this.api,
      this.jwt,
      this.web3,
      this.walletAddress,
      sourceFileUploadId,
      amount,
      size,
    )

    return tx
  }

  /**
   * get filecoin status for file
   *
   * @param {Number} dealId
   * @returns {Object} file status on MCS
   */
  getFileStatus = async (dealId) => {
    return await getFileStatus(this.api, this.jwt, dealId)
  }

  /**
   * Mints file as NFT availiable to view on Opensea
   *
   * @param {Number} sourceFileUploadId
   * @param {{name: string, description: string, image: string, tx_hash: string}} nft
   * @returns {Object} mint info reponse object
   */
  mintAsset = async (sourceFileUploadId, nft, generateMetadata = true) => {
    return await mint(
      this.api,
      this.jwt,
      this.web3,
      this.walletAddress,
      typeof sourceFileUploadId === 'string'
        ? sourceFileUploadId.parseInt()
        : sourceFileUploadId,
      nft,
      generateMetadata,
    )
  }

  /**
   * List the user's uploaded files on MCS
   *
   * @param {string} [wallet] - shows files for an address
   * @param {string} [fileName] - filter by file_name
   * @param {number} [pageNumber=1]
   * @param {number} [pageSize=10]
   *
   * @returns {Array} API list reponse
   */
  getDealList = async (params) => {
    if (!params) params = { wallet: this.walletAddress }
    return await getDealList(this.api, this.jwt, params)
  }
  /**
   *
   * @param {Number} sourceFileUploadId
   * @param {Number} dealId - dealId can be found from listUploads
   * @returns
   */
  getFileDetails = async (sourceFileUploadId, dealId) => {
    return await getDealDetail(this.api, this.jwt, sourceFileUploadId, dealId)
  }

  createBucket = async (bucketName) => {
    return await createBucket(this.api, this.jwt, bucketName)
  }

  // //aliases
  // getBucket = async (bucketName) => {
  //   return await getBuckets(this.api, this.jwt, bucketName)
  // }
  getBuckets = async () => {
    return await getBuckets(this.api, this.jwt)
  }

  getBucketList = async () => {
    return await getBuckets(this.api, this.jwt)
  }
  // getBucketInfo = async (bucketName) => {
  //   return await getBuckets(this.api, this.jwt, bucketName)
  // }

  deleteBucket = async (bucketUid) => {
    return await deleteBucket(this.api, this.jwt, bucketUid)
  }

  getFileList = async (bucketUid, params) => {
    if (!params) params = { prefix: '', limit: 10, offset: 0 }
    let prefix = params.prefix || ''
    let limit = params.limit || 10
    let offset = params.offset || 0

    // console.log('params:', { prefix, limit, offset })
    let list = await getFileList(this.api, this.jwt, bucketUid, {
      prefix,
      limit,
      offset,
    })

    return list.data
  }

  getFiles = async (bucketUid, params) => {
    if (!params) params = { prefix: '', limit: 10, offset: 0 }
    let prefix = params.prefix || ''
    let limit = params.limit || 10
    let offset = params.offset || 0

    // console.log('params:', { prefix, limit, offset })
    let list = await getFileList(this.api, this.jwt, bucketUid, {
      prefix,
      limit,
      offset,
    })

    return list.data
  }

  getFileInfo = async (fileId) => {
    return await getFileInfo(this.api, this.jwt, fileId)
  }

  deleteFile = async (fileId) => {
    return await deleteFile(this.api, this.jwt, fileId)
  }

  createFolder = async (bucketUid, folderName, prefix = '') => {
    return await createFolder(this.api, this.jwt, bucketUid, folderName, prefix)
  }

  uploadToBucket = async (
    filePath,
    bucketUid,
    folder = '',
    options = { log: false },
  ) => {
    return await uploadToBucket(
      this.api,
      this.jwt,
      filePath,
      bucketUid,
      folder,
      options.log ?? false,
    )
  }

  downloadFile = async (fileId, outputDirectory = '.') => {
    return await downloadFile(this.api, this.jwt, fileId, outputDirectory)
  }

  renameBucket = async (bucketUid, bucketName) => {
    return await renameBucket(this.api, this.jwt, bucketUid, bucketName)
  }
}

module.exports = { mcsSDK }
