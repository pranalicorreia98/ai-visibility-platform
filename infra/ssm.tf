# All app secrets live here as SecureString params under /zeeklabs/*, pulled
# by the app process on the EC2 box at start (docs/AWS-DEPLOYMENT-PLAN-MVP.md §10).
locals {
  db_connection_url = "postgresql://${aws_db_instance.main.username}:${random_password.db.result}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/${aws_db_instance.main.db_name}"
}

resource "aws_ssm_parameter" "database_url" {
  name  = "/${var.project_name}/DATABASE_URL"
  type  = "SecureString"
  value = local.db_connection_url
}

resource "aws_ssm_parameter" "nextauth_url" {
  name  = "/${var.project_name}/NEXTAUTH_URL"
  type  = "String"
  value = "https://${var.domain_name}"
}

resource "aws_ssm_parameter" "nextauth_secret" {
  name  = "/${var.project_name}/NEXTAUTH_SECRET"
  type  = "SecureString"
  value = var.nextauth_secret
}

resource "aws_ssm_parameter" "google_client_id" {
  name  = "/${var.project_name}/GOOGLE_CLIENT_ID"
  type  = "SecureString"
  value = var.google_client_id
}

resource "aws_ssm_parameter" "google_client_secret" {
  name  = "/${var.project_name}/GOOGLE_CLIENT_SECRET"
  type  = "SecureString"
  value = var.google_client_secret
}

resource "aws_ssm_parameter" "google_ai_api_key" {
  name  = "/${var.project_name}/GOOGLE_AI_API_KEY"
  type  = "SecureString"
  value = var.google_ai_api_key
}

resource "aws_ssm_parameter" "github_token" {
  name  = "/${var.project_name}/GITHUB_TOKEN"
  type  = "SecureString"
  value = var.github_token
}

resource "aws_ssm_parameter" "openrouter_api_key" {
  name  = "/${var.project_name}/OPENROUTER_API_KEY"
  type  = "SecureString"
  value = var.openrouter_api_key
}

resource "aws_ssm_parameter" "perplexity_api_key" {
  name  = "/${var.project_name}/PERPLEXITY_API_KEY"
  type  = "SecureString"
  value = var.perplexity_api_key
}

resource "aws_ssm_parameter" "resend_api_key" {
  count = var.resend_api_key != "" ? 1 : 0
  name  = "/${var.project_name}/RESEND_API_KEY"
  type  = "SecureString"
  value = var.resend_api_key
}

resource "aws_ssm_parameter" "admin_emails" {
  name  = "/${var.project_name}/ADMIN_EMAILS"
  type  = "String"
  value = var.admin_emails
}

resource "aws_ssm_parameter" "cron_secret" {
  name  = "/${var.project_name}/CRON_SECRET"
  type  = "SecureString"
  value = var.cron_secret
}
