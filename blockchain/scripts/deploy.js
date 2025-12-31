/**
 * Inkless Registry Deployment Script (Hardhat)
 */
const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying InklessRegistry to local Hardhat network...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log(`📍 Deployer Address: ${deployer.address}`);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`💰 Deployer Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

    // Deploy
    console.log("📤 Deploying InklessRegistry...");
    const InklessRegistry = await hre.ethers.getContractFactory("InklessRegistry");
    const registry = await InklessRegistry.deploy();
    await registry.waitForDeployment();

    const contractAddress = await registry.getAddress();
    console.log(`\n✅ InklessRegistry deployed at: ${contractAddress}`);

    // Verify owner
    const owner = await registry.owner();
    console.log(`👤 Contract Owner: ${owner}`);

    // Save deployment info
    const fs = require("fs");
    const deploymentInfo = {
        network: hre.network.name,
        chainId: hre.network.config.chainId ?? 31337,
        contractAddress: contractAddress,
        deployedAt: new Date().toISOString(),
        deployerAddress: deployer.address,
    };

    fs.writeFileSync(
        "./deployment.json",
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log(`📁 Deployment info saved to deployment.json`);

    console.log("\n🎉 Deployment complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
