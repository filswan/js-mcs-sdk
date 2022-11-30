const axios = require('axios')
const { MCS_API } = require('../helper/constants')

const getNonce = async (walletAddress) => {
  const registerRes = await axios.post(`${MCS_API}user/register`, {
    public_key_address: walletAddress,
  })
  return registerRes.data.data.nonce
}

const login = async (web3, walletAddress, privateKey, network) => {
  const nonce = await getNonce(walletAddress)
  const result = web3.eth.accounts.sign(nonce, privateKey)
  const loginObj = {
    nonce: nonce,
    signature: result.signature,
    public_key_address: walletAddress,
    network: network,
  }

  res = await axios.post(`${MCS_API}user/login_by_metamask_signature`, loginObj)
  if (res?.data.status === 'error') {
    throw new Error(res.data.message)
  }
  return res.data.data
}

module.exports = { login }
