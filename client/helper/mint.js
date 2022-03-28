const minterABI = require('../abi/Minter.json')
const { getParams, getPaymentInfo, postMintInfo } = require('./mcsApi')
const { mcsUpload } = require('./upload')

const mint = async (web3, payer, cid, nftObj) => {
  const paymentInfo = await getPaymentInfo(cid)
  const txHash = paymentInfo.data.tx_hash

  let nft = { ...nftObj, tx_hash: txHash }

  const uploadResponse = await mcsUpload(
    payer,
    [{ fileName: nft.name, file: JSON.stringify(nft) }],
    { fileType: 1 },
  )

  const nft_uri = uploadResponse.pop().data.ipfs_url

  const params = await getParams()
  const mintAddress = params.MINT_CONTRACT
  const mintContract = new web3.eth.Contract(minterABI, mintAddress)

  const optionsObj = {
    from: payer,
    gas: params.PAY_GAS_LIMIT,
  }

  const mintTx = await mintContract.methods
    .mintData(payer, nft_uri)
    .send(optionsObj)

  const tokenId = await mintContract.methods.totalSupply().call()

  const mintInfo = {
    payload_cid: cid,
    tx_hash: mintTx.transactionHash,
    token_id: tokenId.toString(),
    mint_address: mintAddress,
  }

  const mintInfoResponse = await postMintInfo(mintInfo)

  return mintInfoResponse
}

module.exports = { mint }
