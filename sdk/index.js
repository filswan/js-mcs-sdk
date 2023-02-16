const packageJson = require('./package.json')
const Web3 = require('web3')

const API = require('./utils/constants')
const { lockToken } = require('./api/onchain/makePayment')
const { mint, createCollection, getCollections } = require('./api/onchain/mint')
const { mcsUpload } = require('./api/onchain/upload')
const {
  getDealDetail,
  getDealList,
  getFileStatus,
} = require('./api/onchain/deals')
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
const { getJwt } = require('./utils/getJwt')

class mcsSDK {
  /**
   * @constructor
   */
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
   * @param {string} accessToken - SDK Access Token
   * @param {string} apiKey - SDK API Key
   * @param {string} [chainName="polygon.mainnet"] - MCS environment (ex. polygon.mainnet or polygon.mumbai)
   * @param {string} privateKey - wallet private key
   * @param {string} [rpcUrl="https://polygon-rpc.com/"] - RPC url (must match chain name env)
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
    } else if (chainName === 'polygon.mumbai') {
      api = API.MCS_MUMBAI_API
    } else {
      console.error('unknown chain name')
    }

    if (!accessToken || !apiKey) {
      console.error(
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
   *
   * @param {Object[]} files - the files to upload
   * @param {string} files[].fileName - name of the file
   * @param {file} files[].file - file contents
   * @param {Object} [options] - extra options
   * @param {number} [options.delay=1000] - delay in ms between upload API calls
   * @param {number} [options.duration=525] - filecoin storage duration in days
   * @param {number} [options.fileType=0] - fileType 1 files will be hidden from the UI
   * @returns {Object[]}
   */
  upload = async (files, options) => {
    if (!this.web3Initialized) {
      console.error('web3 not setup, call setupWeb3 first')
    }

    return await mcsUpload(this.api, this.jwt, files, options)
  }

  /**
   * Makes payment for unpaid files on MCS. Throws error if file is already paid.
   * @param {number} sourceFileUploadId
   * @param {string} size - file size in bytes
   * @param {string} [amount=""] - pass amount as string to avoid BN precision errors
   * @returns {Object} payment transaction response
   */
  makePayment = async (sourceFileUploadId, size, amount = '') => {
    if (!this.web3Initialized) {
      console.error('web3 not setup, call setupWeb3 first')
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
   * @param {number} dealId
   * @returns {Object} file status on MCS
   */
  getFileStatus = async (dealId) => {
    return await getFileStatus(this.api, this.jwt, dealId)
  }

  /**
   * Mints file as NFT availiable to view on Opensea
   * @param {number} sourceFileUploadId
   * @param {Object} nft - nft metadata
   * @param {string} nft.name - name of nft
   * @param {string} [nft.description] - nft description
   * @param {string} image - link to nft asset, usually IPFS endpoint
   * @param {string} [tx_hash] - payment tx hash
   * @returns {Object} mint info reponse object
   */
  mintAsset = async (
    sourceFileUploadId,
    nft = {},
    collectionAddress = undefined,
    recipient = this.walletAddress,
    quantity = 1,
  ) => {
    if (!this.web3Initialized) {
      console.error('web3 not setup, call setupWeb3 first')
    }
    return await mint(
      this.api,
      this.jwt,
      this.web3,
      this.walletAddress,
      typeof sourceFileUploadId === 'string'
        ? sourceFileUploadId.parseInt()
        : sourceFileUploadId,
      nft,
      collectionAddress,
      recipient,
      quantity,
    )
  }

  /**
   * Creates a new NFT collection
   * @param {Object} collection - nft metadata
   * @param {string} collection.name - name of nft
   * @param {string} [collection.description] - nft description
   * @param {string} [collection.image] - link to collection asset, usually IPFS endpoint
   */
  createCollection = async (collection) => {
    if (!this.web3Initialized) {
      console.error('web3 not setup, call setupWeb3 first')
    }
    return await createCollection(
      this.api,
      this.jwt,
      this.web3,
      this.walletAddress,
      collection,
    )
  }

  getCollections = async () => {
    return await getCollections(this.api, this.jwt)
  }

  /**
   * List the user's uploaded files on MCS
   * @param {Object} params
   * @param {string} [params.wallet] - shows files for an address
   * @param {string} [params.fileName] - filter by file_name
   * @param {number} [params.pageNumber=1]
   * @param {number} [params.pageSize=10]
   * @returns {Object[]} API list reponse
   */
  getDealList = async (params) => {
    if (!params) params = { wallet: this.walletAddress }
    return await getDealList(this.api, this.jwt, params)
  }

  /**
   * @param {Number} sourceFileUploadId
   * @param {Number} dealId - dealId can be found from listUploads
   * @returns {Object}
   */
  getFileDetails = async (sourceFileUploadId, dealId) => {
    return await getDealDetail(this.api, this.jwt, sourceFileUploadId, dealId)
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
    return await uploadToBucket(
      this.api,
      this.jwt,
      bucket.bucket_uid,
      objectName,
      filePath,
      replace,
    )
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
}

module.exports = { mcsSDK }
