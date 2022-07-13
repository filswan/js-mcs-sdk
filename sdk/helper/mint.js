const minterABI = require('../abi/Minter.json')
const { getParams, getPaymentInfo, postMintInfo } = require('./mcsApi')
const { mcsUpload } = require('./upload')

const mint = async (
  apiUrl,
  web3,
  payer,
  sourceFileUploadId,
  nftObj,
  generateMetadata,
) => {
  let nft_uri = nftObj // if user did not wish to generate metadata

  if (generateMetadata) {
    const paymentInfo = await getPaymentInfo(apiUrl, sourceFileUploadId)
    const txHash = paymentInfo.data.tx_hash

    let nft = { ...nftObj, tx_hash: txHash }

    const uploadResponse = await mcsUpload(
      apiUrl,
      payer,
      [{ fileName: nft.name, file: JSON.stringify(nft) }],
      { fileType: 1 },
    )

    nft_uri = uploadResponse.pop().data.ipfs_url

    nft.external_url = nft_uri
  }

  const params = await getParams(apiUrl)
  const mintAddress = params.MINT_CONTRACT_ADDRESS
  const mintContract = new web3.eth.Contract(minterABI, mintAddress)

  const optionsObj = {
    from: payer,
    gas: params.GAS_LIMIT,
    gasPrice: await web3.eth.getGasPrice(),
  }

  const mintTx = await mintContract.methods
    .mintData(payer, nft_uri)
    .send(optionsObj)

  const tokenId = mintTx.events.Mint.returnValues.tokenId_

  const mintInfo = {
    source_file_upload_id: sourceFileUploadId,
    tx_hash: mintTx.transactionHash,
    token_id: tokenId.toString(),
    mint_address: mintAddress,
  }

  const mintInfoResponse = await postMintInfo(apiUrl, mintInfo)

  return mintInfoResponse
}

module.exports = { mint }
