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
        SessionKeyAccountFactory: "0xc1777F38F660C5b381fb69904058636962C1fc8B",
        SessionKeyAccount1: "0xc1777F38F660C5b381fb69904058636962C1fc8B",
      };
  }
};
