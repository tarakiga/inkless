This document serves as the **Master Technical Handoff** for the Inkless infrastructure. It includes the architectural blueprint, the deployment sequence, and the **Terraform** code required to provision a production-grade Hyperledger Besu network on AWS.

# ---

**📑 Inkless: High-Trust Infrastructure Handoff**

## **1\. High-Level Architecture**

To achieve **Consortium Trust** and satisfy **NITDA/NDPA** data residency requirements, we use a 3-node **IBFT 2.0** (Byzantine Fault Tolerance) consensus model.

* **Compute:** AWS ECS Fargate (Serverless Containers).  
* **Networking:** Private VPC across 3 Availability Zones (AZs).  
* **Storage:** Amazon EBS (Elastic Block Store) attached to Fargate tasks for chain data persistence.  
* **Trust Layer:** 3-Node Validator set (Nodes A, B, and C) requiring a 2/3 majority to finalize signatures.

## ---

**2\. Step-by-Step Deployment Flow**

1. **Environment Setup:** Initialize the AWS CLI and Terraform on the lead architect's machine.  
2. **Network Provisioning:** Run terraform apply to build the VPC, Security Groups, and ALB.  
3. **Genesis Generation:** Generate the genesis.json and node keys locally.  
4. **Secret Injection:** Upload node private keys to **AWS Secrets Manager**.  
5. **Task Launch:** ECS Fargate pulls the Hyperledger Besu image and mounts the EBS volumes.  
6. **Node Discovery:** Node A (Bootnode) starts first; Nodes B and C use the Bootnode’s enode address to join the network.

## ---

**3\. Terraform Infrastructure Template (IaC)**

Save this as main.tf. It provisions the core "Boardroom" infrastructure.

Terraform

\# \--- AWS Provider Configuration \---  
provider "aws" {  
  region \= "eu-west-1" \# Recommended for Nigeria/Africa latency  
}

\# \--- VPC & Networking \---  
resource "aws\_vpc" "inkless\_vpc" {  
  cidr\_block           \= "10.0.0.0/16"  
  enable\_dns\_hostnames \= true  
}

resource "aws\_subnet" "private\_subnets" {  
  count             \= 3  
  vpc\_id            \= aws\_vpc.inkless\_vpc.id  
  cidr\_block        \= "10.0.${count.index}.0/24"  
  availability\_zone \= element(\["eu-west-1a", "eu-west-1b", "eu-west-1c"\], count.index)  
}

\# \--- ECS Cluster for Besu \---  
resource "aws\_ecs\_cluster" "inkless\_cluster" {  
  name \= "inkless-consortium-cluster"  
}

\# \--- Security Group (P2P & RPC) \---  
resource "aws\_security\_group" "besu\_sg" {  
  vpc\_id \= aws\_vpc.inkless\_vpc.id

  ingress {  
    from\_port   \= 30303 \# P2P Discovery  
    to\_port     \= 30303  
    protocol    \= "tcp"  
    self        \= true  
  }

  ingress {  
    from\_port   \= 8545 \# JSON-RPC (Private API)  
    to\_port     \= 8545  
    protocol    \= "tcp"  
    cidr\_blocks \= \["10.0.0.0/16"\]  
  }  
}

\# \--- Task Definition (Besu Node) \---  
resource "aws\_ecs\_task\_definition" "besu\_node" {  
  family                   \= "besu-validator"  
  network\_mode             \= "awsvpc"  
  requires\_compatibilities \= \["FARGATE"\]  
  cpu                      \= "2048"  
  memory                   \= "4096"

  container\_definitions \= jsonencode(\[  
    {  
      name  \= "besu-node"  
      image \= "hyperledger/besu:latest"  
      command \= \[  
        "--network=private",  
        "--rpc-http-enabled",  
        "--data-storage-format=BONSAI",  
        "--sync-mode=FULL"  
      \]  
      mountPoints \= \[  
        {  
          sourceVolume  \= "besu-data"  
          containerPath \= "/opt/besu/data"  
        }  
      \]  
      logConfiguration \= {  
        logDriver \= "awslogs"  
        options \= {  
          "awslogs-group"         \= "/ecs/besu"  
          "awslogs-region"        \= "eu-west-1"  
          "awslogs-stream-prefix" \= "validator"  
        }  
      }  
    }  
  \])

  volume {  
    name \= "besu-data"  
    configure\_at\_launch \= true \# Fargate EBS Attachment  
  }  
}

## ---

**4\. Master Animation Prompt (The Visual Handoff)**

To explain this complex flow to users, provide this JSON to your motion agent to build the **Minimalist Holographic Assembler** we designed.

JSON

{  
  "animation\_metadata": {  
    "title": "Inkless: Minimalist Holographic Assembler",  
    "duration\_seconds": 10,  
    "aesthetic": "Minimalist Monoline / Precision 3D",  
    "palette": \["\#0A0C10", "\#2D5BFF", "\#10B981"\]  
  },  
  "scenes": \[  
    {  
      "time": "0s-3s",  
      "action": "A 1px monoline file icon sits in a SecureZone. A 3D wireframe lattice rises from it like a hologram.",  
      "label": "PRODUCING LOCAL FINGERPRINT"  
    },  
    {  
      "time": "3s-7s",  
      "action": "A fingerprint icon pulses. The wireframe lattice glows Quantum Blue and snaps into a solid, spinning geometric crystal.",  
      "label": "SEALING WITH PQC DILITHIUM"  
    },  
    {  
      "time": "7s-10s",  
      "action": "The file icon turns Green and stays put. The crystal token shoots up and locks into an infinite 3D grid.",  
      "label": "ANCHORED TO PRIVATE CONSORTIUM"  
    }  
  \]  
}

### ---

**Next Steps for the Dev Team**

1. **Configure ibftConfigFile.json**: This defines the initial validators.  
2. **Generate genesis.json**: Using the Besu binary locally before the first deploy.  
3. **Setup ALB**: Create the Load Balancer to handle the HTTPS-to-RPC traffic.

**Would you like me to generate the genesis.json configuration file that defines your 3-node IBFT 2.0 network?**