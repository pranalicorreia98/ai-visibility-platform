variable "aws_region" {
  description = "Matches the cost estimates in docs/AWS-DEPLOYMENT-PLAN-MVP.md"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "zeeklabs"
}

variable "domain_name" {
  type    = string
  default = "zeeklabs.ai"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  type    = string
  default = "10.0.1.0/24"
}

variable "private_subnet_cidrs" {
  description = "RDS subnet group requires subnets in >= 2 AZs, even for a Single-AZ instance"
  type        = list(string)
  default     = ["10.0.2.0/24", "10.0.3.0/24"]
}

variable "instance_type" {
  description = "Free-tier eligible (750 hrs/month combined t2/t3/t4g.micro)"
  type        = string
  default     = "t4g.micro"
}

variable "db_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "db_allocated_storage" {
  type    = number
  default = 20
}

# --- App secrets, pushed to SSM Parameter Store as SecureString.
# Populate these via infra/terraform.tfvars (gitignored) - see terraform.tfvars.example.
variable "nextauth_secret" {
  type      = string
  sensitive = true
}

variable "google_client_id" {
  type      = string
  sensitive = true
}

variable "google_client_secret" {
  type      = string
  sensitive = true
}

variable "google_ai_api_key" {
  type      = string
  sensitive = true
}

variable "github_token" {
  type      = string
  sensitive = true
}

variable "openrouter_api_key" {
  type      = string
  sensitive = true
}

variable "perplexity_api_key" {
  type      = string
  sensitive = true
}

variable "resend_api_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "admin_emails" {
  type    = string
  default = "founder@zeeklabs.ai"
}

variable "cron_secret" {
  description = "Bearer token for manually-triggered POST /api/monitoring/run"
  type        = string
  sensitive   = true
}
