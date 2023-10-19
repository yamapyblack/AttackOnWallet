import { ethers } from "hardhat";

async function main() {
  const EntryPoint = await ethers.deployContract("SimpleAccountFactory", [
    "0x184c5f5fd4280e00234b12ef047cdb87e8afff43",
  ]);

  await EntryPoint.waitForDeployment();

  console.log(`deployed to ${EntryPoint.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
