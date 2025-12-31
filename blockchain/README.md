# Inkless Blockchain (Local Hyperledger Besu)

This directory contains the configuration for running a local, permissioned Hyperledger Besu blockchain node for Inkless development.

## Quick Start

```bash
# Start the node
docker compose up -d

# Check logs
docker compose logs -f besu

# Stop the node
docker compose down
```

## Configuration

- **Chain ID**: 1337 (Local Development)
- **Consensus**: IBFT 2.0 (single validator for dev, scales to multi-node for prod)
- **Gas Price**: 0 (free transactions)
- **RPC Endpoint**: `http://localhost:8545`

## Pre-funded Accounts

| Address | Private Key | Purpose |
|---------|-------------|---------|
| `0x627306090abaB3A6e1400e9345bC60c78a8BEf57` | `c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3` | Contract Deployer |
| `0xfe3b557e8fb62b89f4916b721be55ceb828dbd73` | `8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63` | Validator/Miner |

> **WARNING**: These are development keys. NEVER use in production.

## Deploying InklessRegistry

After starting the node, deploy the contract using Foundry or Hardhat.
