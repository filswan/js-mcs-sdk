const packageJson = require('./package.json')
const Web3 = require('web3')

const { mcsUpload } = require('./helper/upload')
const { lockToken } = require('./helper/lockToken')
const {
  getFileStatus,
  getDealList,
  getDealDetail,
  getAverageAmount,
  login,
} = require('./helper/mcsApi')
const { mint } = require('./helper/mint')

const { MCS_API, STORAGE_API } = require('./helper/constants')

const getApi = (chainId) => {
  if (chainId == 137) {
    return {
      mcsApi: MCS_API,
      storageApi: STORAGE_API,
      loginNetwork: 'polygon.mainnet',
    }
  } else {
    throw new Error(`Unsupported chain id (${chainId})`)
  }
}

class mcsSDK {
  constructor(web3, publicKey, apis, jwt) {
    this.version = packageJson.version
    this.web3 = web3
    this.publicKey = publicKey

    this.mcsApi = apis.mcsApi
    this.storageApi = apis.storageApi
    this.jwt = jwt
  }

  static async initialize({ privateKey, rpcUrl }) {
    const web3 = new Web3(rpcUrl)
    web3.eth.accounts.wallet.add(privateKey)
    const publicKey = web3.eth.accounts.privateKeyToAccount(privateKey).address

    const chainId = await web3.eth.getChainId()
    const apis = getApi(chainId)

    const loginResponse = await login(
      apis.mcsApi,
      web3,
      publicKey,
      privateKey,
      apis.loginNetwork,
    )

    const jwt = loginResponse.jwt_token

    return new mcsSDK(web3, publicKey, apis, jwt)
  }

  /**
   * Uploads file(s) using MCS upload API
   *
   * @param {[{fileName: string, file: Object}]} files - files should be file buffers, json stringify, or readstreams
   * @param {{delay: number, duration: number, fileType: number}} [options]
   * @returns {Array} Array of upload API responses
   */
  upload = async (files, options) => {
    return await mcsUpload(
      this.mcsApi,
      this.jwt,
      this.publicKey,
      files,
      options,
    )
  }

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
        this.jwt,
        this.publicKey,
        size,
      )
    }

    let tx = await lockToken(
      this.mcsApi,
      this.jwt,
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
  getFileStatus = async (dealId) => {
    return await getFileStatus(this.mcsApi, this.jwt, dealId)
  }

  /**
   * Mints file as NFT availiable to view on Opensea
   *
   * @param {string} sourceFileUploadId
   * @param {{name: string, description: string, image: string, tx_hash: string}} nft
   * @returns {Object} mint info reponse object
   */
  mintAsset = async (sourceFileUploadId, nft, generateMetadata = true) => {
    return await mint(
      this.mcsApi,
      this.jwt,
      this.web3,
      this.publicKey,
      sourceFileUploadId,
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
  getUploads = async (
    wallet = this.publicKey,
    fileName = '',
    orderBy = '',
    isAscend = '',
    status = '',
    isMinted = '',
    pageNumber = 1,
    pageSize = 10,
  ) => {
    return await getDealList(
      this.mcsApi,
      this.jwt,
      wallet,
      fileName,
      orderBy,
      isAscend,
      status,
      isMinted,
      pageNumber,
      pageSize,
    )
  }
  /**
   *
   * @param {string} sourceFileUploadId
   * @param {number} dealId - dealId can be found from listUploads
   * @returns
   */
  getFileDetails = async (sourceFileUploadId, dealId) => {
    return await getDealDetail(
      this.mcsApi,
      this.jwt,
      sourceFileUploadId,
      dealId,
    )
  }
}

module.exports = { mcsSDK }
