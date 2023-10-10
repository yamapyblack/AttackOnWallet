import { ethers } from "hardhat";
import { SessionKeyAccountFactory } from "../typechain-types/contracts/wallets/SessionKeyAccountFactory";
import { getAddresses } from "./addresses";

async function main() {
  const a = getAddresses()!;
  const factory = (await ethers.getContractAt(
    "SessionKeyAccountFactory",
    a.SessionKeyAccountFactory
  )) as SessionKeyAccountFactory;

  const tx = await factory.createAccount(a.Deployer, 1);
  console.log(tx);

  const accountAddress = await factory.getAddress(a.Deployer, 1);
  console.log("accountAddress:", accountAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
