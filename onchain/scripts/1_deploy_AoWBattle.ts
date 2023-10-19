import { ethers } from "hardhat";

async function main() {
  const AoWBattle = await ethers.deployContract("AoWBattle", []);

  await AoWBattle.waitForDeployment();

  console.log(`deployed to ${AoWBattle.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
