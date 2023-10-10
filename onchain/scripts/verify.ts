import env from "hardhat";
import { getAddresses } from "./addresses";

async function main() {
  const a = getAddresses()!;

  await env.run("verify:verify", {
    address: a.SessionKeyAccountFactory,
    constructorArguments: [a.EntryPoint],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
