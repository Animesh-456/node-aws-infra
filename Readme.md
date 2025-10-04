# Nodejs deploy in EC2 using ALB and ASG launch template

## 📌 Overview
Deploy a Nodejs app to AWS EC2 using GitHub Actions and provision infra using Terraform.

## About the project
Simple Nodejs app that has API endpoints and the db is connected to a MongoDB Atlas cluster

## 🏗️ Infrastructure Details

### AWS Resources
- **VPC & Networking**
  - Default VPC
  - Multiple Availability Zones
  - Public Subnets

- **Compute & Scaling**
  - EC2 Instances (t3.micro)
  - Auto Scaling Group (ASG)
  - Launch Template with user data

- **Load Balancing**
  - Application Load Balancer (ALB)
  - Target Groups
  - Health Checks

- **Security**
  - IAM Roles & Policies
  - Security Groups
  - SSM Parameter Store for secrets

## 🚀 CI/CD Pipeline

### Application Deployment
- **Trigger**: Push to master (excluding /infra changes)
- **Actions**:
  - AWS Authentication
  - ASG Instance Refresh
  - Rolling Deployment Strategy

### Infrastructure Deployment
- **Trigger**: Changes in ./infra directory
- **Actions**:
  - Terraform Init
  - Terraform Plan
  - Terraform Apply

## 🛠️ Tech Stack
- Node.js
- Express.js
- MongoDB Atlas
- AWS Services
- Terraform
- GitHub Actions


## 🔧 Local Development
1. Clone the repository
```bash
git clone https://github.com/Animesh-456/node-aws-infra.git
```

2. Install dependencies
```bash
cd node-aws-infra

npm install
```

3. Set up environment variables
```bash
cp .env
# Edit .env with your MongoDB Atlas connection string
```

4. Run locally
```bash
npm run dev
```

## 🚀 Deployment

### Infrastructure
```bash
cd infra
terraform init
terraform plan
terraform apply
```

### Application
Push to master branch to trigger automatic deployment:
```bash
git add .
git commit -m "feat: your feature description"
git push origin master
```

## 🔐 Security
- Secrets stored in GitHub Secrets and AWS SSM
- IAM roles with least privilege
- Security groups with minimal required access
- HTTPS enabled on ALB