const { ethers } = require("ethers");

async function main() {
    const wallet = ethers.Wallet.createRandom();
    console.log("----------------------------------------------------");
    console.log("🆕 NEW DEPLOYER WALLET GENERATED");
    console.log("----------------------------------------------------");
    console.log("Address:     " + wallet.address);
    console.log("Private Key: " + wallet.privateKey);
    console.log("----------------------------------------------------");
    console.log("⚠️  SAVE THIS PRIVATE KEY SECURELY. DO NOT SHARE IT.");
    console.log("👉 Fund this address at: https://faucet.polygon.technology/");
    console.log("----------------------------------------------------");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
