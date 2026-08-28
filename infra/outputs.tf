output "ec2_public_ip" {
  description = "Elastic IP - use this to smoke-test the app before cutting DNS over at BigRock"
  value       = aws_eip.app.public_ip
}

output "ec2_instance_id" {
  description = "For SSM Session Manager: aws ssm start-session --target <this>"
  value       = aws_instance.app.id
}

output "rds_endpoint" {
  value = aws_db_instance.main.address
}

output "ssm_parameter_prefix" {
  value = "/${var.project_name}/"
}
