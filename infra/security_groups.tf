# Web tier: 80/443 open to the world for the app; SSH is deliberately
# absent - access is via SSM Session Manager instead (see ec2.tf's IAM role).
resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-ec2-sg"
  description = "zeeklabs app server: HTTP/HTTPS in, no SSH"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP (redirects to HTTPS via Caddy)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound (LLM APIs, package installs, SSM, etc.)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-ec2-sg" }
}

# DB tier: only reachable from the EC2 security group, nothing public.
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "zeeklabs Postgres: only from the app server"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Postgres from the app server"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-rds-sg" }
}
