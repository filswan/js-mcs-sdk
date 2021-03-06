const erc20ABI = require('../abi/ERC20.json')
const swanPaymentABI = require('../abi/SwanPayment.json')
const { getParams } = require('./mcsApi')

const one = '1000000000000000000'
const ten = '10000000000000000000'
const oneHundred = '100000000000000000000'
const oneThousand = '1000000000000000000000'

const lockToken = async (apiUrl, web3, payer, wCid, amount, size) => {
  const params = await getParams(apiUrl)

  const usdcAddress = params.USDC_ADDRESS
  const recipientAddress = params.PAYMENT_RECIPIENT_ADDRESS
  const gatewayContractAddress = params.PAYMENT_CONTRACT_ADDRESS
  const gasLimit = params.GAS_LIMIT
  const multiplyFactor = params.PAY_MULTIPLY_FACTOR

  const optionsObj = {
    from: payer,
    gas: gasLimit,
    gasPrice: await web3.eth.getGasPrice(),
  }

  const USDCInstance = new web3.eth.Contract(erc20ABI, usdcAddress)
  const approveTx = await USDCInstance.methods
    .approve(
      gatewayContractAddress,
      (web3.utils.toWei(amount, 'ether') * multiplyFactor).toString(),
    )
    .send(optionsObj)

  const paymentInstance = new web3.eth.Contract(
    swanPaymentABI,
    gatewayContractAddress,
  )

  const lockObj = {
    id: wCid,
    minPayment: web3.utils.toWei(amount, 'ether'),
    amount: (web3.utils.toWei(amount, 'ether') * multiplyFactor).toString(),
    lockTime: 86400 * params.LOCK_TIME,
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
