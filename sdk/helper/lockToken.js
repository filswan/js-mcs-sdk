const erc20ABI = require('../abi/ERC20.json')
const swanPaymentABI = require('../abi/SwanPayment.json')
const { getParams, getFilePaymentStatus } = require('./mcsApi')

const one = '1000000000000000000'
const ten = '10000000000000000000'
const oneHundred = '100000000000000000000'
const oneThousand = '1000000000000000000000'

const lockToken = async (web3, payer, sourceFileUploadId, amount, size) => {
  // check if file is free/paid for
  const filePaymentStatus = await getFilePaymentStatus(sourceFileUploadId)
  const paymentStatus = filePaymentStatus.data.source_file_upload

  if (paymentStatus?.is_free || paymentStatus?.status != 'Pending') {
    throw new Error('This file is already paid for.')
  }
  const wCid = paymentStatus.w_cid

  const params = await getParams()

  const usdcAddress = params.usdc_address
  const recipientAddress = params.payment_recipient_address
  const gatewayContractAddress = params.payment_contract_address
  const gasLimit = params.gas_limit
  const multiplyFactor = params.pay_multiply_factor
  const lockTime = params.lock_time

  const optionsObj = {
    from: payer,
    gas: gasLimit,
    gasPrice: await web3.eth.getGasPrice(),
  }

  const USDCInstance = new web3.eth.Contract(erc20ABI, usdcAddress)
  const approveTx = await USDCInstance.methods
    .approve(
      gatewayContractAddress,
      web3.utils.toWei((Number(amount) * multiplyFactor).toString(), 'ether'),
    )
    .send(optionsObj)

  const paymentInstance = new web3.eth.Contract(
    swanPaymentABI,
    gatewayContractAddress,
  )

  const lockObj = {
    id: wCid,
    minPayment: web3.utils.toWei(amount, 'ether'),
    amount: web3.utils.toWei(
      (Number(amount) * multiplyFactor).toString(),
      'ether',
    ),
    lockTime: 86400 * lockTime,
    recipient: recipientAddress,
    size: size,
    copyLimit: 5,
  }

  const tx = await paymentInstance.methods
    .lockTokenPayment(lockObj)
    .send(optionsObj)

  return tx
}

module.exports = { lockToken }
