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

  # filter {
  #   name   = "availability-zone"
  #   values = ["ap-south-1a", "ap-south-1b"]
  # }
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
  instance_type = "t2.medium"
  key_name      = "Thanos"

  vpc_security_group_ids = [aws_security_group.ec2_sg.id]

  user_data = base64encode(<<-EOT
              #!/bin/bash
              # Update system
              apt update -y
              apt upgrade -y
              apt install -y curl git build-essential
              apt install -y awscli


              # Fetch secrets from SSM
              MONGO_URI=$(aws ssm get-parameter --name "/nodeapp/mongodb_uri" --with-decryption --query "Parameter.Value" --output text --region ap-south-1)
              JWT_SECRET=$(aws ssm get-parameter --name "/nodeapp/jwt_secret" --with-decryption --query "Parameter.Value" --output text --region ap-south-1)
              FRONTEND_LINK=$(aws ssm get-parameter --name "/nodeapp/frontend_link" --query "Parameter.Value" --output text --region ap-south-1)
              PORT=$(aws ssm get-parameter --name "/nodeapp/port" --query "Parameter.Value" --output text --region ap-south-1)

              # Install NVM
              export NVM_DIR="/home/ubuntu/.nvm"
              git clone https://github.com/nvm-sh/nvm.git $NVM_DIR
              cd $NVM_DIR
              git checkout v0.39.8
              . $NVM_DIR/nvm.sh

              # Install Node.js 18 using NVM
              nvm install 18
              nvm use 18
              nvm alias default 18

              # Install PM2 globally
              npm install -g pm2

              # Pull your Node.js app
              cd /home/ubuntu
              git clone https://github.com/your-repo/app.git
              cd app
              npm install


              cat <<EOF > /home/ubuntu/app/.env
              connect=$MONGO_URI
              SECRET=$JWT_SECRET
              frontendLink=$FRONTEND_LINK
              port=$PORT
              EOF


              # Start app with PM2
              pm2 start index.js --name "backend"
              pm2 startup systemd
              pm2 save

              # Ensure permissions
              chown -R ubuntu:ubuntu /home/ubuntu
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