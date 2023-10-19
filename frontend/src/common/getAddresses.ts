export const getAddresses = (_chainId: number) => {
  if (_chainId === 420) {
    return {
      EntryPointAddress:
        "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789" as `0x${string}`, // Alchemy
      AoWNFTAddress:
        "0xf0AFdeB50fD85CfDC5e9D83c01119d12ED2840c7" as `0x${string}`,
      AccountFactoryAddress:
        "0xBE74Fed5f9C0d109BFEdFcb0baC49e6a1a8dC6DF" as `0x${string}`,
      AoWBattle: "0x28b175977E820668Bb26442ea5F7Ed0EE8E524E8" as `0x${string}`,

      NftContractAddress:
        "0x835629117Abb8cfe20a2e8717C691905A4725b7c" as `0x${string}`, // Alchemy
      SessionKeyAddress:
        "0xC275b7e36faF2eBdaBf2B256443e88d911fd822e" as `0x${string}`,
      SimpleAccountFactoryAddress:
        "0xc1777F38F660C5b381fb69904058636962C1fc8B" as `0x${string}`,
    };
  }
};
