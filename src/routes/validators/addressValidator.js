const bitcoin = require('bitcoinjs-lib');
const sha3 = require('crypto-js/sha3');

const validateBtcAddress = function (address) {
  try {
    bitcoin.address.toOutputScript(address, bitcoin.networks.bitcoin);
    return true;
  } catch (e) {
    return false;
  }
};

const validateEthereumAddress = function (address) {
  const sha = function (value, options) {
    return sha3(value, {
      outputLength: 256
    }).toString();
  };

  const isChecksumAddress = function (ethAddress) {
    const address = ethAddress.replace('0x', '');
    const addressHash = sha(address.toLowerCase());
    for (let i = 0; i < 40; i++) {
      if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
        return false;
      }
    }
    return true;
  };

  const isAddress = function (address) {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
      return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
      return true;
    }
    return isChecksumAddress(address);
  };

  return isAddress(address);
};

/**
 * ADDRESS_VALIDATORS object has the following type [addressType]: validator func
 * where addressType is same as from currency config
 */
const ADDRESS_VALIDATORS = {
  bitcoin: validateBtcAddress,
  ethereum: validateEthereumAddress
};

/**
 * Accepts address: string as argument
 * Accepts currency: int / string as argument
 * Returns true if currency supported
 * Returns false if not
 */
module.exports = function (address, currencyConfig) {
  if (!address || !currencyConfig) {
    return false;
  }

  const {address_type} = currencyConfig;

  return ADDRESS_VALIDATORS[address_type] && ADDRESS_VALIDATORS[address_type](address);
};
