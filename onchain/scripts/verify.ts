import env, { ethers } from "hardhat";

async function main() {
  await env.run("verify:verify", {
    address: "0x110Dd2EE1776198f3CF62e4906feD9B28b8AeA49",
    constructorArguments: ["0x184c5F5fD4280e00234B12ef047cDb87E8aFff43"],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
