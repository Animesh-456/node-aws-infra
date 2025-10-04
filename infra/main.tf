terraform {
  backend "s3" {
    bucket = "my-nodejs-app-tf-state-12345" 
    
    # Path inside the bucket where the state file will be stored
    key = "environments/nodejs-app-prod.tfstate" 

    region = "ap-south-1" 

    dynamodb_table = "terraform-state-locks" 
    
    # Encryption is highly recommended
    encrypt = true 
  }
}

provider "aws" {
  region = "ap-south-1"
}

# Get default VPC
data "aws_vpc" "default" {
  default = true
}

# Get subnets in two AZs
data "aws_subnets" "available" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# IAM Role for EC2
resource "aws_iam_role" "ec2_role" {
  name = "ec2-ssm-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

# IAM Policy for SSM Access
resource "aws_iam_role_policy" "ssm_policy" {
  name = "ssm-policy"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ],
        Resource = "*"
      }
    ]
  })
}


# IAM Instance Profile (to attach to EC2/ASG)
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "ec2-ssm-profile"
  role = aws_iam_role.ec2_role.name
}



# Latest Ubuntu 24.04 AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
  owners = ["099720109477"] # Canonical
}

# Security Group for EC2 instances (SSH + HTTP)
resource "aws_security_group" "ec2_sg" {
  name        = "ec2-sg"
  description = "Allow SSH and HTTP"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # 🔴 replace with your IP later
  }

  ingress {
    description = "HTTP"
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security Group for ALB (allow HTTP from internet)
resource "aws_security_group" "alb_sg" {
  name        = "alb-sg"
  description = "Allow HTTP inbound traffic"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Launch Template (userdata installs Node.js + PM2 + pulls code)
resource "aws_launch_template" "nodejs_lt" {
  name_prefix   = "nodejs-template-"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = "t3.medium"
  key_name      = "Thanos"

  vpc_security_group_ids = [aws_security_group.ec2_sg.id]

  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_profile.name
  }


  user_data = base64encode(<<-EOT
              #!/bin/bash
              # Run everything as ubuntu
              sudo -i -u ubuntu bash << 'EOF'

              # Update system
              sudo apt update -y
              sudo apt upgrade -y
              sudo apt install -y curl git build-essential unzip
              curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
              unzip awscliv2.zip
              sudo ./aws/install

              # Install NVM for ubuntu
              export NVM_DIR="/home/ubuntu/.nvm"
              git clone https://github.com/nvm-sh/nvm.git $NVM_DIR
              cd $NVM_DIR
              git checkout v0.39.8
              . $NVM_DIR/nvm.sh

              # Make NVM available in future shells
              echo 'export NVM_DIR="$HOME/.nvm"' >> /home/ubuntu/.bashrc
              echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> /home/ubuntu/.bashrc

              # Install Node.js 18 and PM2
              nvm install 18
              nvm alias default 18
              npm install -g pm2


              # Clone your app
              cd /home/ubuntu
              git clone https://github.com/Animesh-456/node-aws-infra.git
              cd node-aws-infra
              npm install

              # Create .env file
              cat <<EENV > /home/ubuntu/node-aws-infra/.env
              connect=$(aws ssm get-parameter --name "/myapp/connect" --with-decryption --query "Parameter.Value" --output text --region ap-south-1)
              SECRET=$(aws ssm get-parameter --name "/myapp/SECRET" --with-decryption --query "Parameter.Value" --output text --region ap-south-1)
              frontendLink=$(aws ssm get-parameter --name "/myapp/frontendLink" --query "Parameter.Value" --output text --region ap-south-1)
              port=$(aws ssm get-parameter --name "/myapp/port" --query "Parameter.Value" --output text --region ap-south-1)
              EENV


              # Start app with PM2
              pm2 start index.js --name "backend"
              pm2 startup systemd -u ubuntu --hp /home/ubuntu
              pm2 save

              EOF
              EOT
)

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "nodejs-app-instance"
    }
  }
}

# Auto Scaling Group
resource "aws_autoscaling_group" "asg" {
  desired_capacity    = 2
  max_size            = 4
  min_size            = 1
  vpc_zone_identifier = data.aws_subnets.available.ids

  launch_template {
    id      = aws_launch_template.nodejs_lt.id
    version = "$Latest"
  }

  target_group_arns = [aws_lb_target_group.app_tg.arn]

  tag {
    key                 = "Name"
    value               = "nodejs-asg-instance"
    propagate_at_launch = true
  }
}

# Application Load Balancer
resource "aws_lb" "app_alb" {
  name               = "nodejs-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = data.aws_subnets.available.ids

  enable_deletion_protection = false
}

# Target Group for ALB
resource "aws_lb_target_group" "app_tg" {
  name     = "nodejs-target-group"
  port     = 4000
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id

  health_check {
    path                = "/status"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200-399"
  }
}

# Listener for ALB
resource "aws_lb_listener" "app_listener" {
  load_balancer_arn = aws_lb.app_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }
}

output "alb_dns_name" {
  value = aws_lb.app_alb.dns_name
}