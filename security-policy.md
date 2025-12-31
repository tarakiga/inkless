# Security Policy: Project Inkless

## 1. Our Security Philosophy
Inkless is built on the principle of **Zero-Knowledge Privacy**. We never see your documents. All cryptographic operations, including SHA-3 hashing and ML-DSA (Crystals-Dilithium) signature generation, happen locally on the user's device via WebAssembly (Wasm).

## 2. Reporting a Vulnerability
We appreciate the work of security researchers in keeping the ecosystem safe. 
If you discover a vulnerability, please do not disclose it publicly. Email us at **security@inkless.ng** (or use our PGP key below).

**Please include:**
- A detailed description of the vulnerability.
- Steps to reproduce (POC).
- Potential impact assessment.

We aim to acknowledge all reports within **24 hours** and provide a resolution timeline within **72 hours**.

## 3. Scope
**In-Scope:**
- Inkless Web & Mobile Client (Wasm Hashing Engine).
- Private Ledger (Hyperledger Besu) Smart Contracts.
- NIMC vNIN Integration Logic.
- Cryptographic Implementation (Post-Quantum ML-DSA).

**Out-of-Scope:**
- Third-party NIMC infrastructure.
- Social engineering or physical attacks against users.

## 4. Post-Quantum Cryptography (PQC)
Inkless utilizes **Crystals-Dilithium (ML-DSA)**, the NIST-standardized lattice-based signature scheme. We are committed to maintaining a "Quantum-Ready" status and will update our implementation as NIST or NITDA standards evolve.

## 5. Security Measures
- **No Document Uploads:** Only cryptographic hashes are transmitted.
- **Hardware-Bound Keys:** Private keys are stored in the device's Secure Enclave/TPM and are never accessible to Inkless servers.
- **Audit Trails:** Every transaction is anchored to an immutable ledger for legal non-repudiation under the Nigerian Evidence Act.
- **Content Integrity:** We implement structural PDF auditing to prevent Shadow Attacks and hidden-layer manipulation.

## 6. Bug Bounty
We are currently in a **Private Bug Bounty** phase. Researchers who provide high-quality, actionable reports may be invited to our paid program.

---
*Last Updated: December 2025*