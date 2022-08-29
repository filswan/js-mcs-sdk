const packageJson = require('./package.json')
const Web3 = require('web3')

const { mcsUpload } = require('./helper/upload')
const { lockToken } = require('./helper/lockToken')
const {
  getFileStatus,
  getDealList,
  getDealDetail,
  getAverageAmount,
} = require('./helper/mcsApi')
const { mint } = require('./helper/mint')

const {
  MCS_API,
  STORAGE_API,
  MCS_BSC_API,
  STORAGE_BSC_API,
} = require('./helper/constants')

class mcsSDK {
  /**
   * Constructs a class bound to the user and endpoint.
   *
   * @example
   * ```js
   * const { mcsSDK } = require('js-mcs-sdk')
   * const mcs = new mcsSDK({
   *   privateKey: PRIVATE_KEY
   *   rpcURL: 'https://matic-mumbai.chainstacklabs.com'
   * })
   * ```
   * @param {{privateKey: string, rpcUrl: string}} options
   */
  constructor({
    privateKey,
    rpcUrl = 'https://matic-mumbai.chainstacklabs.com',
  }) {
    this.version = packageJson.version
    this.web3 = new Web3(rpcUrl)
    if (privateKey) {
      this.setAccount(privateKey)
    }

    this.setApi()
  }

  /**
   * Adds wallet to web3 object
   *
   * @param {string} privateKey
   */
  setAccount = (privateKey) => {
    this.web3.eth.accounts.wallet.add(privateKey)
    this.publicKey = this.web3.eth.accounts.privateKeyToAccount(
      privateKey,
    ).address
  }

  setApi = async () => {
    let id = await this.web3.eth.net.getId()

    if (id == 80001) {
      this.network = 'mumbai'
      this.mcsApi = MCS_API
      this.storageApi = STORAGE_API
    } else {
      throw new Error(`Unsupported RPC network (chainID: ${id})`)
    }
  }

  /**
   * Uploads file(s) using MCS upload API
   *
   * @param {[{fileName: string, file: Object}]} files - files should be file buffers, json stringify, or readstreams
   * @param {{delay: number, duration: number, fileType: number}} [options]
   * @returns {Array} Array of upload API responses
   */
  upload = async (files, options) =>
    await mcsUpload(this.mcsApi, this.publicKey, files, options)

  /**
   * Makes payment for unpaid files on MCS. Throws error if file is already paid.
   *
   * @param {string} payloadCid
   * @param {string} amount - pass amount as string to avoid BN precision errors
   * @returns {Object} payment transaction response
   */
  makePayment = async (sourceFileUploadId, amount, size) => {
    let paymentAmount = amount
    if (paymentAmount == '0' || paymentAmount == '') {
      paymentAmount = await getAverageAmount(
        this.mcsApi,
        this.storageApi,
        this.publicKey,
        size,
      )
    }

    let tx = await lockToken(
      this.mcsApi,
      this.web3,
      this.publicKey,
      sourceFileUploadId,
      paymentAmount,
      size,
    )

    return tx
  }

  /**
   * get filecoin status for file
   *
   * @param {string} sourceFileUploadId
   * @returns {Object} file status on MCS
   */
  getFileStatus = async (dealId) => await getFileStatus(dealId)

  /**
   * Mints file as NFT availiable to view on Opensea
   *
   * @param {string} sourceFileUploadId
   * @param {{name: string, description: string, image: string, tx_hash: string}} nft
   * @returns {Object} mint info reponse object
   */
  mintAsset = async (sourceFileUploadId, nft, generateMetadata = true) =>
    await mint(
      this.mcsApi,
      this.web3,
      this.publicKey,
      sourceFileUploadId,
      nft,
      generateMetadata,
    )

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
  getUploads = async (
    wallet = this.publicKey,
    fileName = '',
    orderBy = '',
    isAscend = '',
    status = '',
    isMinted = '',
    pageNumber = 1,
    pageSize = 10,
  ) =>
    await getDealList(
      this.mcsApi,
      wallet,
      fileName,
      orderBy,
      isAscend,
      status,
      isMinted,
      pageNumber,
      pageSize,
    )

  /**
   *
   * @param {string} sourceFileUploadId
   * @param {number} dealId - dealId can be found from listUploads
   * @returns
   */
  getFileDetails = async (sourceFileUploadId, dealId) =>
    await getDealDetail(this.mcsApi, sourceFileUploadId, dealId)
}

module.exports = { mcsSDK }
