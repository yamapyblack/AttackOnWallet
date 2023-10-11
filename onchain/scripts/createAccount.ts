import { ethers } from "hardhat";
import { SessionKeyAccountFactory } from "../typechain-types/contracts/wallets/SessionKeyAccountFactory";
import { getAddresses } from "./addresses";

async function main() {
  const a = getAddresses()!;
  const factory = (await ethers.getContractAt(
    "SessionKeyAccountFactory",
    a.SessionKeyAccountFactory
  )) as SessionKeyAccountFactory;

  const tx = await factory.createAccount(a.Deployer, 1, {
    value: ethers.parseEther("0.1"),
  });
  console.log(tx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
