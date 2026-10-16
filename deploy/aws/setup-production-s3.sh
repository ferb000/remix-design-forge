#!/usr/bin/env bash
# Run in AWS CloudShell. Creates private storage and grants only uploads/* access.
set -euo pipefail
export AWS_DEFAULT_REGION=eu-north-1 AWS_PAGER=''
instance=i-095b8bec3c69f8e9a
role=design-forge-api
account=$(aws sts get-caller-identity --query Account --output text)
bucket="designforge3d-uploads-$account-eu-north-1"
current=$(aws ec2 describe-iam-instance-profile-associations --filters "Name=instance-id,Values=$instance" --query 'IamInstanceProfileAssociations[?State!=`disassociated`].IamInstanceProfile.Arn' --output text)
if [[ -n "$current" && "$current" != *"instance-profile/$role" ]]; then
  echo 'Instance already has a different IAM profile. Stop and review before changing it.' >&2
  exit 1
fi
if ! aws s3api head-bucket --bucket "$bucket" 2>/dev/null; then
  aws s3api create-bucket --bucket "$bucket" --region eu-north-1 --create-bucket-configuration LocationConstraint=eu-north-1
fi
owner=$(aws s3api get-bucket-acl --bucket "$bucket" --expected-bucket-owner "$account" --query Owner.ID --output text)
test -n "$owner"
aws s3api put-public-access-block --bucket "$bucket" --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws s3api put-bucket-ownership-controls --bucket "$bucket" --ownership-controls 'Rules=[{ObjectOwnership=BucketOwnerEnforced}]'
aws s3api put-bucket-encryption --bucket "$bucket" --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
aws s3api put-bucket-versioning --bucket "$bucket" --versioning-configuration Status=Enabled
temp_dir=$(mktemp -d)
trap 'rm -f "$temp_dir/trust.json" "$temp_dir/policy.json"; rmdir "$temp_dir"' EXIT
cat > "$temp_dir/trust.json" <<'EOF'
{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}
EOF
cat > "$temp_dir/policy.json" <<EOF
{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["s3:PutObject","s3:GetObject","s3:DeleteObject"],"Resource":"arn:aws:s3:::$bucket/uploads/*"}]}
EOF
if ! aws iam get-role --role-name "$role" >/dev/null 2>&1; then
  aws iam create-role --role-name "$role" --assume-role-policy-document "file://$temp_dir/trust.json" >/dev/null
fi
aws iam put-role-policy --role-name "$role" --policy-name design-forge-s3 --policy-document "file://$temp_dir/policy.json"
if ! aws iam get-instance-profile --instance-profile-name "$role" >/dev/null 2>&1; then
  aws iam create-instance-profile --instance-profile-name "$role" >/dev/null
fi
roles=$(aws iam get-instance-profile --instance-profile-name "$role" --query 'InstanceProfile.Roles[].RoleName' --output text)
if [[ -z "$roles" ]]; then
  aws iam add-role-to-instance-profile --instance-profile-name "$role" --role-name "$role"
elif [[ "$roles" != "$role" ]]; then
  echo 'Existing instance profile contains a different role; stopping.' >&2
  exit 1
fi
if [[ -z "$current" ]]; then
  attached=false
  for attempt in {1..12}; do
    if aws ec2 associate-iam-instance-profile --instance-id "$instance" --iam-instance-profile "Name=$role" > "$temp_dir/association.json" 2> "$temp_dir/error.txt"; then
      attached=true
      break
    fi
    if ! grep -q InvalidParameterValue "$temp_dir/error.txt"; then cat "$temp_dir/error.txt" >&2; break; fi
    sleep 5
  done
  rm -f "$temp_dir/association.json" "$temp_dir/error.txt"
  if [[ "$attached" != true ]]; then echo 'IAM association failed. Re-run after reviewing IAM permissions.' >&2; exit 1; fi
fi
aws ec2 modify-instance-metadata-options --instance-id "$instance" --http-tokens required --http-put-response-hop-limit 2 --http-endpoint enabled >/dev/null
echo "S3_BUCKET=$bucket"
echo 'Private S3 and instance-role configuration complete. Send back the bucket name only.'
