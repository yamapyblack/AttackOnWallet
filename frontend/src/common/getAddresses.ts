export const getAddresses = (_chainId: number) => {
  if (_chainId === 420) {
    return {
      NftContractAddress:
        "0x835629117Abb8cfe20a2e8717C691905A4725b7c" as `0x${string}`,
      EntryPointAddress:
        "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789" as `0x${string}`,
      SimpleAccountFactoryAddress:
        "0xc1777F38F660C5b381fb69904058636962C1fc8B" as `0x${string}`,
      AccountFactoryAddress:
        "0xc9966401164FEd576Bb9f56E67E87d98663FD5a2" as `0x${string}`,
      SessionKeyAddress:
        "0xC275b7e36faF2eBdaBf2B256443e88d911fd822e" as `0x${string}`,
    };
  }
};
