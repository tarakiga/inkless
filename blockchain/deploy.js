/**
 * Inkless Registry Deployment Script
 * Deploys InklessRegistry.sol to the local Hyperledger Besu node.
 */

import { ethers } from "ethers";
import solc from "solc";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const RPC_URL = "http://localhost:8545";
// Besu Dev Network Account 1 (pre-funded with 200 ETH)
const DEPLOYER_PRIVATE_KEY = "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63";

async function main() {
    console.log("🚀 Deploying InklessRegistry to local Besu node...\n");

    // Connect to local Besu node
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);

    console.log(`📍 Deployer Address: ${wallet.address}`);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Deployer Balance: ${ethers.formatEther(balance)} ETH\n`);

    // Read and compile the Solidity contract
    const contractPath = path.join(__dirname, "..", "contracts", "InklessRegistry.sol");
    const source = fs.readFileSync(contractPath, "utf8");

    console.log("📦 Compiling InklessRegistry.sol...");

    const input = {
        language: "Solidity",
        sources: {
            "InklessRegistry.sol": {
                content: source,
            },
        },
        settings: {
            outputSelection: {
                "*": {
                    "*": ["abi", "evm.bytecode.object"],
                },
            },
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    // Check for compilation errors
    if (output.errors) {
        const hasErrors = output.errors.some((e) => e.severity === "error");
        if (hasErrors) {
            console.error("❌ Compilation Errors:");
            output.errors.forEach((e) => console.error(e.formattedMessage));
            process.exit(1);
        }
        // Print warnings
        output.errors.forEach((e) => {
            if (e.severity === "warning") {
                console.warn(`⚠️  ${e.message}`);
            }
        });
    }

    const contract = output.contracts["InklessRegistry.sol"]["InklessRegistry"];
    const abi = contract.abi;
    const bytecode = "0x" + contract.evm.bytecode.object;

    console.log("✅ Compilation successful!\n");

    // Deploy with explicit gas limit (bypasses eth_estimateGas issues on Besu dev)
    console.log("📤 Deploying contract...");
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const deployedContract = await factory.deploy({ gasLimit: 5000000 });
    await deployedContract.waitForDeployment();

    const contractAddress = await deployedContract.getAddress();
    console.log(`\n✅ InklessRegistry deployed at: ${contractAddress}`);

    // Save deployment info
    const deploymentInfo = {
        network: "besu-local",
        chainId: 1337,
        contractAddress: contractAddress,
        deployedAt: new Date().toISOString(),
        deployerAddress: wallet.address,
        abi: abi,
    };

    const deploymentPath = path.join(__dirname, "deployment.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`📁 Deployment info saved to: ${deploymentPath}`);

    // Verify owner
    const owner = await deployedContract.owner();
    console.log(`👤 Contract Owner: ${owner}`);

    console.log("\n🎉 Deployment complete!");
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
});
