const erc20ABI = require('../abi/ERC20.json')
const swanPaymentABI = require('../abi/SwanPayment.json')
const axios = require('axios')
const { getParams } = require('../helper/params')
const { getAveragePrice } = require('../helper/averagePrice.js')

const getFilePaymentStatus = async (api, jwt, sourceFileUploadId) => {
  const config = {
    headers: { Authorization: `Bearer ${jwt}` },
  }
  try {
    const res = await axios.get(
      `${api}/v1/storage/source_file_upload/${sourceFileUploadId}`,
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

const lockToken = async (
  api,
  jwt,
  web3,
  payer,
  sourceFileUploadId,
  amount,
  size,
) => {
  // check if file is free/paid for
  const filePaymentStatus = await getFilePaymentStatus(
    api,
    jwt,
    sourceFileUploadId,
  )
  let paymentStatus = filePaymentStatus.data.source_file_upload

  if (paymentStatus?.is_free || paymentStatus?.status != 'Pending') {
    throw new Error('This file is already paid for.')
  }
  const wCid = paymentStatus.w_cid

  if (amount == '0' || amount == '') {
    amount = await getAveragePrice(api, jwt, payer, size)
  }

  const params = await getParams(api)

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
  const lockAmount = web3.utils.toWei(
    (Number(amount) * multiplyFactor).toFixed(6).toString(),
    'mwei',
  )
  const approveTx = await USDCInstance.methods
    .approve(gatewayContractAddress, lockAmount)
    .send(optionsObj)

  const paymentInstance = new web3.eth.Contract(
    swanPaymentABI,
    gatewayContractAddress,
  )

  const lockObj = {
    id: wCid,
    minPayment: web3.utils.toWei(Number(amount).toFixed(6), 'mwei'),
    amount: lockAmount,
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
