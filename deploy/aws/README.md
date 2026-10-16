# Private S3 setup

**Run this section in AWS CloudShell**, opened from the AWS Console, using an
account allowed to manage S3 and IAM. These AWS commands create billable cloud
resources; choose the intended AWS account and region.

Set the bucket and region you will use in the production `.env` file:

```bash
AWS_REGION='eu-north-1'
S3_BUCKET='your-unique-design-forge-uploads-bucket'
export AWS_DEFAULT_REGION="$AWS_REGION"
aws sts get-caller-identity
```

Verify the account ID before continuing. Bucket names must be globally unique,
lowercase, and contain no spaces. Use a dedicated bucket for this application.

```bash
if [ "$AWS_REGION" = 'us-east-1' ]; then
  aws s3api create-bucket --bucket "$S3_BUCKET" --region "$AWS_REGION"
else
  aws s3api create-bucket --bucket "$S3_BUCKET" --region "$AWS_REGION" \
    --create-bucket-configuration "LocationConstraint=$AWS_REGION"
fi

aws s3api put-public-access-block --bucket "$S3_BUCKET" \
  --public-access-block-configuration 'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true'

aws s3api put-bucket-ownership-controls --bucket "$S3_BUCKET" \
  --ownership-controls 'Rules=[{ObjectOwnership=BucketOwnerEnforced}]'

aws s3api put-bucket-encryption --bucket "$S3_BUCKET" \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

aws s3api put-bucket-versioning --bucket "$S3_BUCKET" \
  --versioning-configuration Status=Enabled
```

Create the restricted application policy. It can read, write and clean up
objects only within this bucket's uploads/ prefix:

```bash
cat > /tmp/design-forge-s3-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
    "Resource": "arn:aws:s3:::$S3_BUCKET/uploads/*"
  }]
}
EOF
AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
```

Choose **one** credential method:

**A. EC2 VPS — recommended: instance IAM role**

Run in CloudShell:

```bash
cat > /tmp/design-forge-ec2-trust.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ec2.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
EOF

aws iam create-role --role-name design-forge-api \
  --assume-role-policy-document file:///tmp/design-forge-ec2-trust.json
aws iam put-role-policy --role-name design-forge-api \
  --policy-name design-forge-s3 \
  --policy-document file:///tmp/design-forge-s3-policy.json
aws iam create-instance-profile --instance-profile-name design-forge-api
aws iam add-role-to-instance-profile --instance-profile-name design-forge-api \
  --role-name design-forge-api
```

Set your real instance ID and **the EC2 instance's region**, which may differ
from the bucket region:

```bash
EC2_INSTANCE_ID='i-REPLACE_WITH_YOUR_INSTANCE_ID'
EC2_REGION='eu-north-1'
aws ec2 associate-iam-instance-profile --region "$EC2_REGION" \
  --instance-id "$EC2_INSTANCE_ID" \
  --iam-instance-profile Name=design-forge-api
```

IAM changes may take a short time to propagate. If the instance already has an
IAM profile, attach the upload policy to its existing role instead of replacing
or associating another profile. The Node SDK automatically uses the instance
role; no AWS access keys go into the application environment.

**B. Other VPS — restricted IAM user**

Run in CloudShell instead of option A:

```bash
aws iam create-user --user-name design-forge-api
aws iam put-user-policy --user-name design-forge-api \
  --policy-name design-forge-s3 \
  --policy-document file:///tmp/design-forge-s3-policy.json
aws iam create-access-key --user-name design-forge-api
```

Save the returned AccessKeyId and SecretAccessKey in your password manager.
The secret is shown only at creation. You will enter them into the protected
production `.env` file. Do not commit them, paste them into chat,
or grant AdministratorAccess to this application user.

**Return to the [Compose guide](../README.md) after setup.**


## EC2 container credentials

When using an EC2 instance role, require IMDSv2 and set the response hop limit
to two so the API container can obtain credentials through its bridge network.
Run this in AWS CloudShell after setting the instance ID and region:

```bash
aws ec2 modify-instance-metadata-options --region "$EC2_REGION" \
  --instance-id "$EC2_INSTANCE_ID" --http-tokens required \
  --http-put-response-hop-limit 2 --http-endpoint enabled
```

Leave AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY empty in `.env` for this
option. Do not mount the Docker socket or your personal AWS credentials into
containers. See [AWS guidance for container metadata access](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-IMDS-new-instances.html).
