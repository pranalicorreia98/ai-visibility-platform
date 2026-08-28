resource "random_password" "db" {
  length  = 24
  special = false # keep it URL-safe since it goes straight into a postgresql:// connection string
}

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id
  tags       = { Name = "${var.project_name}-db-subnet-group" }
}

resource "aws_db_instance" "main" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = "16"

  instance_class    = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  storage_type      = "gp3"

  db_name  = "zeeklabs"
  username = "zeeklabs_app"
  password = random_password.db.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  multi_az               = false # explicit per the plan: latency/downtime-tolerant, not worth 2x cost

  backup_retention_period = 1 # AWS's free-plan tier rejects anything higher; revisit once account plan/usage allows more
  skip_final_snapshot     = true # acceptable pre-launch; revisit once carrying real user data

  tags = { Name = "${var.project_name}-db" }
}
