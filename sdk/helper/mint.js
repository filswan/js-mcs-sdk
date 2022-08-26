const minterABI = require('../abi/Minter.json')
const { getParams, getPaymentInfo, postMintInfo } = require('./mcsApi')
const { mcsUpload } = require('./upload')

const mint = async (
  isCalibration,
  web3,
  payer,
  sourceFileUploadId,
  nftObj,
  generateMetadata,
) => {
  let nft_uri = nftObj // if user did not wish to generate metadata

  if (generateMetadata) {
    const paymentInfo = await getPaymentInfo(isCalibration, sourceFileUploadId)
    const txHash = paymentInfo?.data.tx_hash || ''

    let nft = { ...nftObj, tx_hash: txHash }

    const uploadResponse = await mcsUpload(
      isCalibration,
      payer,
      [{ fileName: nft.name, file: JSON.stringify(nft) }],
      { fileType: 1 },
    )

    nft_uri = uploadResponse.pop().data.ipfs_url
  }

  const params = await getParams(isCalibration)
  const mintAddress = isCalibration
    ? params.mint_contract_address
    : params.MINT_CONTRACT_ADDRESS
  const mintContract = new web3.eth.Contract(minterABI, mintAddress)

  const optionsObj = {
    from: payer,
    gas: isCalibration ? params.gas_limit : params.GAS_LIMIT,
    gasPrice: await web3.eth.getGasPrice(),
  }

  const mintTx = await mintContract.methods
    .mintData(payer, nft_uri)
    .send(optionsObj)

  const tokenId = mintTx.events.Mint.returnValues.tokenId_

  const mintInfo = {
    source_file_upload_id: sourceFileUploadId,
    tx_hash: mintTx.transactionHash,
    token_id: tokenId,
    mint_address: mintAddress,
  }

  const mintInfoResponse = await postMintInfo(isCalibration, mintInfo)

  return mintInfoResponse
}

module.exports = { mint }
