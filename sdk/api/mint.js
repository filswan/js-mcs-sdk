const minterABI = require('../abi/SwanNFT.json')
const axios = require('axios')
const { MCS_API } = require('../helper/constants')
const { mcsUpload } = require('./upload')
const { getParams } = require('../helper/params')

const getPaymentInfo = async (jwt, sourceFileUploadId) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(
      `${MCS_API}billing/deal/lockpayment/info?source_file_upload_id=${sourceFileUploadId}`,
      config,
    )
    return res?.data
  } catch (err) {
    // Handle Error Here
    console.error(err)
  }
}

const postMintInfo = async (jwt, mintInfo) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.post(
      `${MCS_API}storage/mint/info`,
      mintInfo,
      config,
    )
    return res?.data
  } catch (err) {
    console.error(err)
  }
}

const mint = async (
  jwt,
  web3,
  payer,
  sourceFileUploadId,
  nftObj,
  generateMetadata,
) => {
  let nft_uri = nftObj // if user did not wish to generate metadata

  if (generateMetadata) {
    const paymentInfo = await getPaymentInfo(jwt, sourceFileUploadId)
    const txHash = paymentInfo?.data?.tx_hash || ''

    let nft = { ...nftObj, tx_hash: txHash }

    const uploadResponse = await mcsUpload(
      payer,
      jwt,
      [{ fileName: nft.name, file: JSON.stringify(nft) }],
      { fileType: 1 },
    )

    nft_uri = uploadResponse.pop().data.ipfs_url
  }

  const params = await getParams()
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

  const mintInfoResponse = await postMintInfo(jwt, mintInfo)

  return mintInfoResponse
}

module.exports = { mint }
