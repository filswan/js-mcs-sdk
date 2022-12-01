const packageJson = require('./package.json')
const Web3 = require('web3')

const { lockToken } = require('./api/makePayment')
const { getDealDetail } = require('./api/dealDetail')
const { mint } = require('./api/mint')
const { login } = require('./api/login')
const { mcsUpload } = require('./api/upload')
const { getFileStatus } = require('./api/fileStatus')
const { getDealList } = require('./api/dealList')
const { getBuckets, createBucket } = require('./api/buckets/buckets')
const { deleteItems } = require('./api/buckets/delete')
const { uploadToBucket } = require('./api/buckets/files')

const getNetwork = (chainId) => {
  if (chainId == 137) {
    return 'polygon.mainnet'
  } else {
    throw new Error(`Unsupported chain id (${chainId})`)
  }
}

class mcsSDK {
  constructor(web3, walletAddress, jwt) {
    this.version = packageJson.version
    this.web3 = web3
    this.walletAddress = walletAddress
    this.jwt = jwt
  }

  /**
   * Initializes new MCS SDK instance
   *
   * @param {string} privateKey - wallet private key
   * @param {string} rpcUrl - endpoint to read and send data on the blockchain
   * @returns {Object} MCS SDK instance
   */
  static async initialize({ privateKey, rpcUrl, jwt }) {
    const web3 = new Web3(rpcUrl)
    web3.eth.accounts.wallet.add(privateKey)
    const walletAddress = web3.eth.accounts.privateKeyToAccount(privateKey)
      .address

    const chainId = await web3.eth.getChainId()
    const loginNetwork = getNetwork(chainId)

    if (!jwt) {
      const loginResponse = await login(
        web3,
        walletAddress,
        privateKey,
        loginNetwork,
      )

      jwt = loginResponse.jwt_token
    }

    return new mcsSDK(web3, walletAddress, jwt)
  }

  /**
   * Uploads file(s) using MCS upload API
   *
   * @param {[{fileName: string, file: Object}]} files - files should be file buffers, json stringify, or readstreams
   * @param {{delay: number, duration: number, fileType: number}} [options]
   * @returns {Array} Array of upload API responses
   */
  upload = async (files, options) => {
    return await mcsUpload(this.walletAddress, this.jwt, files, options)
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
    let tx = await lockToken(
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
    return await getFileStatus(this.jwt, dealId)
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
    return await getDealList(this.jwt, params)
  }
  /**
   *
   * @param {Number} sourceFileUploadId
   * @param {Number} dealId - dealId can be found from listUploads
   * @returns
   */
  getFileDetails = async (sourceFileUploadId, dealId) => {
    return await getDealDetail(this.jwt, sourceFileUploadId, dealId)
  }

  createBucket = async (bucketName) => {
    return await createBucket(this.jwt, bucketName)
  }

  //aliases
  getBucket = async (bucketName) => {
    return await getBuckets(this.jwt, bucketName)
  }
  getBuckets = async (bucketName) => {
    return await getBuckets(this.jwt, bucketName)
  }
  getBucketInfo = async (bucketName) => {
    return await getBuckets(this.jwt, bucketName)
  }

  uploadToBucket = async (bucketName, fileName, filePath) => {
    return await uploadToBucket(this.jwt, bucketName, fileName, filePath)
  }

  deleteBucket = async (bucketIds) => {
    let buckets = Array.isArray(bucketIds) ? bucketIds : [bucketIds]

    return await deleteItems(this.jwt, buckets, [])
  }

  deleteFileFromBucket = async (itemIds) => {
    let items = Array.isArray(itemIds) ? itemIds : [itemIds]

    return await deleteItems(this.jwt, [], items)
  }

  deleteItems = async (buckets, items) => {
    if (Array.isArray(buckets) && Array.isArray(items))
      return await deleteItems(this.jwt, buckets, items)

    throw new Error('invalid parameters')
  }
}

module.exports = { mcsSDK }
