import env from "hardhat";
import { getAddresses } from "./addresses";

async function main() {
  const a = getAddresses()!;

  await env.run("verify:verify", {
    address: a.AoWAccountFactory,
    constructorArguments: [a.EntryPoint, a.AoWNFT, a.AoWBattle],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
