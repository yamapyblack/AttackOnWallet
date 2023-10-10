import { ethers } from "hardhat";
import { getAddresses } from "./addresses";

async function main() {
  const a = getAddresses()!;

  const Factory = await ethers.deployContract("SessionKeyAccountFactory", [
    a.EntryPoint,
  ]);

  await Factory.waitForDeployment();

  console.log(`deployed to ${Factory.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
