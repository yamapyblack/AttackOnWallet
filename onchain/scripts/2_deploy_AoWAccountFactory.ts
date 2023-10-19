import { ethers } from "hardhat";
import { getAddresses } from "./addresses";

async function main() {
  const a = getAddresses()!;

  const Factory = await ethers.deployContract("AoWAccountFactory", [
    a.EntryPoint,
    a.AoWNFT,
    a.AoWBattle,
  ]);

  await Factory.waitForDeployment();

  console.log(`deployed to ${Factory.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
