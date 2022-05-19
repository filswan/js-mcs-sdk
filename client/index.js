const packageJson = require('./package.json')
const Web3 = require('web3')

const { mcsUpload } = require('./helper/upload')
const { lockToken } = require('./helper/lockToken')
const { getFileStatus, getDealList, getDealDetail } = require('./helper/mcsApi')
const { mint } = require('./helper/mint')

class mcsClient {
  /**
   * Constructs a client bound to the user and endpoint.
   *
   * @example
   * ```js
   * const { mcsClient } = require('mcs-client')
   * const client = new mcsClient({
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

  /**
   * Uploads file(s) using MCS upload API
   *
   * @param {[{fileName: string, file: Object}]} files - files should be file buffers, json stringify, or readstreams
   * @param {{delay: number, duration: number, fileType: number}} [options]
   * @returns {Array} Array of upload API responses
   */
  upload = async (files, options) =>
    await mcsUpload(this.publicKey, files, options)

  /**
   * Makes payment for unpaid files on MCS. Throws error if file is already paid.
   *
   * @param {string} payloadCid
   * @param {string} amount - pass amount as string to avoid BN precision errors
   * @returns {Object} payment transaction response
   */
  makePayment = async (sourceFileUploadId, wCid, amount, size) =>
    await lockToken(
      this.web3,
      this.publicKey,
      sourceFileUploadId,
      wCid,
      amount,
      size,
    )

  /**
   * get filecoin status for file
   *
   * @param {string} sourceFileUploadId
   * @returns {Object} file status on MCS
   */
  checkStatus = async (dealId) => await getFileStatus(dealId)

  /**
   * Mints file as NFT availiable to view on Opensea
   *
   * @param {string} sourceFileUploadId
   * @param {{name: string, description: string, image: string, tx_hash: string}} nft
   * @returns {Object} mint info reponse object
   */
  mintAsset = async (sourceFileUploadId, nft) =>
    await mint(this.web3, this.publicKey, sourceFileUploadId, nft)

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
  listUploads = async (
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
   * @param {number} [dealId=0] - dealId can be found from listUploads
   * @returns
   */
  getFileDetails = async (sourceFileUploadId, dealId = 0) =>
    await getDealDetail(sourceFileUploadId, dealId)
}

module.exports = { mcsClient }
