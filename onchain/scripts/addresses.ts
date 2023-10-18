import env from "hardhat";

export const getAddresses = () => {
  switch (env.network.name) {
    case "opgoerli":
      return {
        Deployer: "0x6C4502B639ab01Cb499cEcCA7D84EB21Fde928F8",
        // Original EntryPoint
        // EntryPoint: "0x184c5f5fd4280e00234b12ef047cdb87e8afff43", // deployed originally
        // SessionKeyAccountFactory: "0xeCE9c68E8a4e8A1afE9b24EE03D011F36e97Accc",
        // SessionKeyAccount1: " 0xeCE9c68E8a4e8A1afE9b24EE03D011F36e97Accc",

        // Alchemy EntryPoint
        EntryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // for Alchemy
        // SessionKeyAccountFactory: "0xc1777F38F660C5b381fb69904058636962C1fc8B",
        SessionKeyAccountFactory: "0xA27DC7598BBA0e3d3942008E260973D4e562E1Dd",
        SessionKeyAccount1: "0xc1777F38F660C5b381fb69904058636962C1fc8B",
        AoWNFT: "0x864C3639f48b52DE7EC7E4f2dB6435dcb8956606",
        AoWAccountFactory: "0xc9966401164FEd576Bb9f56E67E87d98663FD5a2",
        AoWBattle: "0xBa3F74522BF9A4d82a6CA3c1dE052724862A093b",
      };
  }
};
