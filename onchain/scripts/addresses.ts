import env from "hardhat";

export const getAddresses = () => {
  switch (env.network.name) {
    case "opgoerli":
      return {
        Deployer: "0x6C4502B639ab01Cb499cEcCA7D84EB21Fde928F8",

        EntryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // Alchemy EntryPoint
        AoWNFT: "0xf0AFdeB50fD85CfDC5e9D83c01119d12ED2840c7",
        AoWAccountFactory: "0xBE74Fed5f9C0d109BFEdFcb0baC49e6a1a8dC6DF",
        AoWBattle: "0x28b175977E820668Bb26442ea5F7Ed0EE8E524E8",

        // Original EntryPoint
        // EntryPoint: "0x184c5f5fd4280e00234b12ef047cdb87e8afff43", // deployed originally
        // SessionKeyAccountFactory: "0xeCE9c68E8a4e8A1afE9b24EE03D011F36e97Accc",
        // SessionKeyAccount1: " 0xeCE9c68E8a4e8A1afE9b24EE03D011F36e97Accc",
        // SessionKeyAccountFactory: "0xc1777F38F660C5b381fb69904058636962C1fc8B",
        SessionKeyAccountFactory: "0xA27DC7598BBA0e3d3942008E260973D4e562E1Dd",
        // SessionKeyAccount1: "0xc1777F38F660C5b381fb69904058636962C1fc8B",
      };
  }
};
