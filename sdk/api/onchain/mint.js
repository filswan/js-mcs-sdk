const factoryABI = require('./abi/CollectionFactory.json')
const axios = require('axios')
const { mcsUpload } = require('./upload')
const { getParams } = require('../../utils/params')

const createCollection = async (api, jwt, web3, payer, collectionJson) => {
  const uploadResponse = await mcsUpload(
    api,
    jwt,
    [{ fileName: collectionJson.name, file: JSON.stringify(collectionJson) }],
    { fileType: 1 },
  )

  let collection_uri = uploadResponse.pop().data.ipfs_url

  const params = await getParams(api, jwt)
  const factoryAddress = params.nft_collection_factory_address
  const factoryContract = new web3.eth.Contract(factoryABI, factoryAddress)

  const optionsObj = {
    from: payer,
    gas: params.gas_limit,
    gasPrice: await web3.eth.getGasPrice(),
  }

  const createTx = await factoryContract.methods
    .createCollection(collection_uri)
    .send(optionsObj)

  const collectionAddress =
    createTx.events.CreateCollection.returnValues.collectionAddress

  return {
    ...collectionJson,
    txHash: createTx.transactionHash,
    collectionAddress,
  }
}

const getCollections = async (api, jwt) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(
      `${api}/v1/storage/mint/nft_collections`,
      config,
    )
    return res?.data
  } catch (err) {
    return err
    // Handle Error Here
    console.error(err)
  }
}

const getPaymentInfo = async (api, jwt, sourceFileUploadId) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(
      `${api}/v1/billing/deal/lockpayment/info?source_file_upload_id=${sourceFileUploadId}`,
      config,
    )
    return res?.data
  } catch (err) {
    return err
    // Handle Error Here
    console.error(err)
  }
}

const postMintInfo = async (api, jwt, mintInfo) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.post(
      `${api}/v1/storage/mint/info`,
      mintInfo,
      config,
    )

    if (res?.data.status === 'error') {
      console.error(res.data.message)
    }

    return res?.data
  } catch (err) {
    console.error(err)
    if (err.response?.data?.status === 'error') {
      console.error(err.response.data?.message)
    } else {
      console.error(err)
    }
  }
}

const mint = async (
  api,
  jwt,
  web3,
  payer,
  sourceFileUploadId,
  nftObj,
  collectionAddress,
  recipient,
  quantity,
) => {
  const paymentInfo = await getPaymentInfo(api, jwt, sourceFileUploadId)
  const txHash = paymentInfo?.data?.tx_hash || ''

  let nft = { ...nftObj, tx_hash: txHash }

  const uploadResponse = await mcsUpload(
    api,
    jwt,
    [{ fileName: nft.name, file: JSON.stringify(nft) }],
    { fileType: 1 },
  )

  let nft_uri = uploadResponse.pop().data.ipfs_url

  const params = await getParams(api, jwt)
  const factoryAddress = params.nft_collection_factory_address
  const factoryContract = new web3.eth.Contract(factoryABI, factoryAddress)

  const optionsObj = {
    from: payer,
    gas: params.gas_limit,
    gasPrice: await web3.eth.getGasPrice(),
  }

  const mintTx = await factoryContract.methods
    .mint(
      collectionAddress ?? params.default_nft_collection_address,
      recipient,
      quantity,
      nft_uri,
    )
    .send(optionsObj)

  const tokenId = mintTx.events.TransferSingle.returnValues.id

  const mintInfo = {
    source_file_upload_id: sourceFileUploadId,
    tx_hash: mintTx.transactionHash,
    token_id: parseInt(tokenId),
    mint_address: collectionAddress ?? params.default_nft_collection_address,
  }

  const mintInfoResponse = await postMintInfo(api, jwt, mintInfo)

  return mintInfoResponse
}

module.exports = { mint, createCollection, getCollections }
