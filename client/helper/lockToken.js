const erc20ABI = require('../abi/ERC20.json')
const swanPaymentABI = require('../abi/SwanPayment.json')
const { getParams, postLockPayment } = require('./mcsApi')

const one = '1000000000000000000'
const ten = '10000000000000000000'
const oneHundred = '100000000000000000000'
const oneThousand = '1000000000000000000000'

const lockToken = async (web3, payer, uploadId, wCid, amount) => {
  const params = await getParams()

  const optionsObj = {
    from: payer,
    gas: params.PAY_GAS_LIMIT,
  }

  const usdcAddress = params.USDC_ADDRESS
  const recipientAddress = params.RECIPIENT
  const gatewayContractAddress = params.SWAN_PAYMENT_CONTRACT_ADDRESS

  const USDCInstance = new web3.eth.Contract(erc20ABI, usdcAddress)
  const approveTx = await USDCInstance.methods
    .approve(
      gatewayContractAddress,
      web3.utils.toWei(
        (amount * params.PAY_WITH_MULTIPLY_FACTOR).toString(),
        'ether',
      ),
    )
    .send(optionsObj)

  const paymentInstance = new web3.eth.Contract(
    swanPaymentABI,
    gatewayContractAddress,
  )

  const lockObj = {
    id: wCid,
    minPayment: web3.utils.toWei(amount, 'ether'),
    amount: (
      web3.utils.toWei(amount, 'ether') * params.PAY_WITH_MULTIPLY_FACTOR
    ).toString(),
    lockTime: 86400 * params.LOCK_TIME,
    recipient: recipientAddress,
    size: 0,
    copyLimit: 1,
  }

  const tx = await paymentInstance.methods
    .lockTokenPayment(lockObj)
    .send(optionsObj)

  const lockPaymentObj = {
    source_file_upload_id: uploadId,
    tx_hash: tx.transactionHash,
  }

  const lockResponse = await postLockPayment(lockPaymentObj)

  return lockResponse
}

module.exports = { lockToken }
