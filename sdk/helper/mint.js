const minterABI = require('../abi/Minter.json')
const { getParams, getPaymentInfo, postMintInfo } = require('./mcsApi')
const { mcsUpload } = require('./upload')

const mint = async (
  mcsApi,
  jwt,
  web3,
  payer,
  sourceFileUploadId,
  nftObj,
  generateMetadata,
) => {
  let nft_uri = nftObj // if user did not wish to generate metadata

  if (generateMetadata) {
    const paymentInfo = await getPaymentInfo(mcsApi, jwt, sourceFileUploadId)
    const txHash = paymentInfo?.data?.tx_hash || ''

    let nft = { ...nftObj, tx_hash: txHash }

    const uploadResponse = await mcsUpload(
      mcsApi,
      jwt,
      payer,
      [{ fileName: nft.name, file: JSON.stringify(nft) }],
      { fileType: 1 },
    )

    nft_uri = uploadResponse.pop().data.ipfs_url
  }

  const params = await getParams(mcsApi)
  const mintAddress = params.mint_contract_address
  const mintContract = new web3.eth.Contract(minterABI, mintAddress)

  const optionsObj = {
    from: payer,
    gas: params.gas_limit,
    gasPrice: await web3.eth.getGasPrice(),
  }

  const mintTx = await mintContract.methods
    .mintData(payer, nft_uri)
    .send(optionsObj)

  const tokenId = mintTx.events.Mint.returnValues.tokenId_

  const mintInfo = {
    source_file_upload_id: sourceFileUploadId,
    tx_hash: mintTx.transactionHash,
    token_id: parseInt(tokenId),
    mint_address: mintAddress,
  }

  const mintInfoResponse = await postMintInfo(mcsApi, jwt, mintInfo)

  return mintInfoResponse
}

module.exports = { mint }
