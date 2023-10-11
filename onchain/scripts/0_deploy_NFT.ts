import { ethers } from "hardhat";

async function main() {
  const AoWNFT = await ethers.deployContract("AoWNFT", []);

  await AoWNFT.waitForDeployment();

  console.log(`deployed to ${AoWNFT.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
