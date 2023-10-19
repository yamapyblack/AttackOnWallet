const key = (address: string, chainId: number) =>
  `smartContractAccount-${address}-${chainId}`;

const smartAccountAddresses = (address: string, chainId: number) => {
  const item = localStorage.getItem(key(address, chainId));
  if (!item) {
    return;
  }
  return JSON.parse(item) as { scAddress: string; salt: number };
};

const addSmartContractAccount = (
  address: string,
  scAddress: string,
  chainId: number,
  salt: number
) => {
  const k = key(address, chainId);
  localStorage.setItem(k, JSON.stringify({ scAddress: scAddress, salt: salt }));
};

const removeSmartContractAccount = (address: string, chainId: number) => {
  const k = key(address, chainId);
  localStorage.removeItem(k);
};

export const localSmartContractStore = {
  smartAccountAddresses,
  addSmartContractAccount,
  removeSmartContractAccount,
};

const PRIVATE_SESSION_KEY = "privateSessionKey";

const getPrivateSessionKey = () => {
  return sessionStorage.getItem(PRIVATE_SESSION_KEY);
};

const setPrivateSessionKey = (privateSessionKey: string) => {
  sessionStorage.setItem(PRIVATE_SESSION_KEY, privateSessionKey);
};

const removePrivateSessionKey = () => {
  sessionStorage.removeItem(PRIVATE_SESSION_KEY);
};

export const sessionKeyStore = {
  getPrivateSessionKey,
  setPrivateSessionKey,
  removePrivateSessionKey,
};
