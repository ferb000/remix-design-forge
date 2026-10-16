#!/usr/bin/env bash
# Run in AWS CloudShell after uploading this script and the PUBLIC key only.
set -euo pipefail
export AWS_REGION=eu-north-1 AWS_DEFAULT_REGION=eu-north-1 AWS_PAGER=''
name=designforge3d-prod
instance_type=${INSTANCE_TYPE:-m7i-flex.large}
key_file=${1:-design-forge-ec2.pub}
ssh_cidr=${2:-}
if [[ ! -r "$key_file" || ! "$ssh_cidr" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}/32$ ]]; then
  echo 'Usage: bash create-instance.sh PUBLIC_KEY_FILE YOUR_COMPUTER_PUBLIC_IPV4/32' >&2
  exit 1
fi
python3 -c 'import ipaddress,sys; ipaddress.IPv4Network(sys.argv[1],strict=True)' "$ssh_cidr"
account=$(aws sts get-caller-identity --query Account --output text)
echo "Creating $name in account $account, region $AWS_REGION."
echo "Configuration: On-Demand $instance_type, Ubuntu 24.04 x86-64, encrypted 50 GB gp3, Elastic IP."
echo 'These resources incur AWS charges. SSH is restricted to the supplied /32 address.'
existing=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=$name" 'Name=instance-state-name,Values=pending,running,stopping,stopped' --query 'Reservations[].Instances[].InstanceId' --output text)
if [[ -n "$existing" && "$existing" != None ]]; then
  echo "An instance already exists: $existing. Refusing to create a duplicate."
  aws ec2 describe-instances --instance-ids $existing --query 'Reservations[].Instances[].{Instance:InstanceId,State:State.Name,IP:PublicIpAddress}' --output table
  exit 0
fi
eligible=$(aws ec2 describe-instance-types --instance-types "$instance_type" --filters Name=free-tier-eligible,Values=true --query 'length(InstanceTypes)' --output text)
if [[ "$eligible" != 1 ]]; then
  echo "$instance_type is not marked Free Tier eligible. Available eligible types:" >&2
  aws ec2 describe-instance-types --filters Name=free-tier-eligible,Values=true --query 'InstanceTypes[].{Type:InstanceType,MemoryMiB:MemoryInfo.SizeInMiB,Architecture:ProcessorInfo.SupportedArchitectures}' --output table
  exit 1
fi
vpc=$(aws ec2 describe-vpcs --filters Name=is-default,Values=true --query 'Vpcs[0].VpcId' --output text)
if [[ -z "$vpc" || "$vpc" == None ]]; then echo 'No default VPC exists in eu-north-1. Create/select a public VPC before continuing.' >&2; exit 1; fi
subnet=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$vpc" Name=default-for-az,Values=true Name=state,Values=available --query 'Subnets[0].SubnetId' --output text)
if [[ -z "$subnet" || "$subnet" == None ]]; then echo 'No default public subnet found. Stop and review VPC networking.' >&2; exit 1; fi
ami=$(aws ssm get-parameter --name /aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id --query Parameter.Value --output text)
root_device=$(aws ec2 describe-images --image-ids "$ami" --query 'Images[0].RootDeviceName' --output text)
if ! aws ec2 describe-key-pairs --key-names "$name" >/dev/null 2>&1; then
  aws ec2 import-key-pair --key-name "$name" --public-key-material "fileb://$key_file" >/dev/null
else
  remote_key=$(aws ec2 describe-key-pairs --key-names "$name" --include-public-key --query 'KeyPairs[0].PublicKey' --output text)
  python3 -c 'import sys; local=open(sys.argv[1]).read().split(); remote=sys.argv[2].split(); sys.exit(0 if local[:2] == remote[:2] else "Existing AWS key differs from uploaded public key; stopping.")' "$key_file" "$remote_key"
fi
group=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=$name" "Name=vpc-id,Values=$vpc" --query 'SecurityGroups[0].GroupId' --output text)
if [[ -z "$group" || "$group" == None ]]; then
  group=$(aws ec2 create-security-group --group-name "$name" --description 'Design Forge HTTPS and restricted SSH' --vpc-id "$vpc" --query GroupId --output text)
fi
aws ec2 create-tags --resources "$group" --tags "Key=Name,Value=$name"
allow_port() {
  local result
  if ! result=$(aws ec2 authorize-security-group-ingress --group-id "$group" --protocol tcp --port "$1" --cidr "$2" 2>&1); then
    if [[ "$result" != *InvalidPermission.Duplicate* ]]; then echo "$result" >&2; return 1; fi
  fi
}
allow_port 22 "$ssh_cidr"
allow_port 80 0.0.0.0/0
allow_port 443 0.0.0.0/0
credit_options=()
if [[ "$instance_type" == t3.* ]]; then credit_options=(--credit-specification CpuCredits=standard); fi
instance=$(aws ec2 run-instances --image-id "$ami" --instance-type "$instance_type" --key-name "$name" \
  --subnet-id "$subnet" --security-group-ids "$group" --associate-public-ip-address \
  --metadata-options HttpEndpoint=enabled,HttpTokens=required,HttpPutResponseHopLimit=2 \
  "${credit_options[@]}" \
  --block-device-mappings "[{\"DeviceName\":\"$root_device\",\"Ebs\":{\"VolumeSize\":50,\"VolumeType\":\"gp3\",\"Encrypted\":true,\"DeleteOnTermination\":true}}]" \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$name}]" "ResourceType=volume,Tags=[{Key=Name,Value=$name}]" \
  --count 1 --query 'Instances[0].InstanceId' --output text)
echo "Instance created: $instance"
echo 'If a later command fails, retain this ID and inspect the instance rather than creating another.'
aws ec2 wait instance-running --instance-ids "$instance"
allocation=$(aws ec2 allocate-address --domain vpc --tag-specifications "ResourceType=elastic-ip,Tags=[{Key=Name,Value=$name}]" --query AllocationId --output text)
aws ec2 associate-address --instance-id "$instance" --allocation-id "$allocation" >/dev/null
aws ec2 describe-instances --instance-ids "$instance" --query 'Reservations[].Instances[].{Instance:InstanceId,IP:PublicIpAddress,Region:Placement.AvailabilityZone,SSHUser:`ubuntu`}' --output table
echo 'Namecheap: set an A record for @ to the displayed IP and a CNAME for www to designforge3d.com.'
echo 'Do not remove unrelated email/MX/TXT records. Send back the instance ID and IP, not credentials.'
