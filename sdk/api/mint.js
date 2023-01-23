const minterABI = require('../abi/SwanNFT.json')
const axios = require('axios')
const { mcsUpload } = require('./upload')
const { getParams } = require('../helper/params')

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
      throw new Error(res.data.message)
    }

    return res?.data
  } catch (err) {
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
  generateMetadata,
) => {
  let nft_uri = nftObj // if user did not wish to generate metadata

  if (generateMetadata) {
    const paymentInfo = await getPaymentInfo(api, jwt, sourceFileUploadId)
    const txHash = paymentInfo?.data?.tx_hash || ''

    let nft = { ...nftObj, tx_hash: txHash }

    const uploadResponse = await mcsUpload(
      api,
      payer,
      jwt,
      [{ fileName: nft.name, file: JSON.stringify(nft) }],
      { fileType: 1 },
    )

    nft_uri = uploadResponse.pop().data.ipfs_url
  }

  const params = await getParams(api)
  const mintAddress = params.mint_contract_address
  const mintContract = new web3.eth.Contract(minterABI, mintAddress)

  const optionsObj = {
    from: payer,
    gas: params.gas_limit,
    gasPrice: await web3.eth.getGasPrice(),
  }

  const mintTx = await mintContract.methods
    .mintUnique(payer, nft_uri)
    .send(optionsObj)

  const tokenId = mintTx.events.TransferSingle.returnValues.id

  const mintInfo = {
    source_file_upload_id: sourceFileUploadId,
    tx_hash: mintTx.transactionHash,
    token_id: parseInt(tokenId),
    mint_address: mintAddress,
  }

  const mintInfoResponse = await postMintInfo(api, jwt, mintInfo)

  return mintInfoResponse
}

module.exports = { mint }
