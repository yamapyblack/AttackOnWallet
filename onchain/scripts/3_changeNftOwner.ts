import { ethers } from "hardhat";
import { AoWNFT } from "../typechain-types/contracts/nft/AoWNFT";
import { getAddresses } from "./addresses";

async function main() {
  const a = getAddresses()!;
  const nft = (await ethers.getContractAt("AoWNFT", a.AoWNFT)) as AoWNFT;

  const tx = await nft.transferOwnership(a.AoWAccountFactory);
  console.log(tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
