import { ethers } from "hardhat";
import { AoWAccountFactory } from "../typechain-types/contracts/wallets/AoWAccountFactory";
import { getAddresses } from "./addresses";

async function main() {
  const a = getAddresses()!;
  const factory = (await ethers.getContractAt(
    "AoWAccountFactory",
    a.AoWAccountFactory
  )) as AoWAccountFactory;

  const tx = await factory.createAccount(a.Deployer, 1, {
    value: ethers.parseEther("0.1"),
  });
  console.log(tx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
