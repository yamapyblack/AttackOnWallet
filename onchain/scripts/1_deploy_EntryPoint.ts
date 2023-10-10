import { ethers } from "hardhat";

async function main() {
  const EntryPoint = await ethers.deployContract("EntryPoint", []);

  await EntryPoint.waitForDeployment();

  console.log(`deployed to ${EntryPoint.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
