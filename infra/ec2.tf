# Amazon Linux 2023, arm64 (matches t4g.micro/Graviton), resolved via AWS's
# public SSM parameter so this doesn't hardcode a region/time-specific AMI id.
data "aws_ssm_parameter" "al2023_arm64" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-arm64"
}

# SSM Session Manager access instead of SSH - no key pair, no open port 22,
# no bastion host (docs/AWS-DEPLOYMENT-PLAN-MVP.md §10).
resource "aws_iam_role" "ec2_ssm" {
  name = "${var.project_name}-ec2-ssm-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2_ssm.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Scoped read access to just this project's SSM parameters (app secrets),
# not every parameter in the account.
resource "aws_iam_role_policy" "ssm_param_read" {
  name = "${var.project_name}-ssm-param-read"
  role = aws_iam_role.ec2_ssm.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ssm:GetParameter", "ssm:GetParameters", "ssm:GetParametersByPath"]
        Resource = "arn:aws:ssm:${var.aws_region}:*:parameter/${var.project_name}/*"
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_ssm" {
  name = "${var.project_name}-ec2-ssm-profile"
  role = aws_iam_role.ec2_ssm.name
}

resource "aws_instance" "app" {
  ami                         = data.aws_ssm_parameter.al2023_arm64.value
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.ec2.id]
  iam_instance_profile        = aws_iam_instance_profile.ec2_ssm.name
  associate_public_ip_address = true

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  # Baseline tooling only. App deploy, Caddy config, pm2 processes and
  # crontab entries happen in a follow-up step once the box exists (they
  # need the repo + secrets pulled from SSM, not just installed binaries).
  user_data = <<-EOF
    #!/bin/bash
    set -e
    dnf update -y
    dnf install -y git
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    dnf install -y nodejs
    npm install -g pm2 tsx
    curl -fsSL "https://github.com/caddyserver/caddy/releases/latest/download/caddy_2.8.4_linux_arm64.tar.gz" -o /tmp/caddy.tar.gz
    tar -xzf /tmp/caddy.tar.gz -C /usr/local/bin caddy
    chmod +x /usr/local/bin/caddy
  EOF

  tags = { Name = "${var.project_name}-app" }
}

resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"
  tags     = { Name = "${var.project_name}-eip" }
}
