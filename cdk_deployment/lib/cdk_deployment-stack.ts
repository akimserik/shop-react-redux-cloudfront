import * as cdk from "aws-cdk-lib";
import {
  aws_s3 as s3,
  aws_s3_deployment as s3deploy,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
} from "aws-cdk-lib";
import { BlockPublicAccess } from "aws-cdk-lib/aws-s3";

export class CdkDeploymentStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an S3 bucket to host the React app
    const shopAutoBucket = new s3.Bucket(this, "ShopAutoBucket", {
      websiteIndexDocument: "index.html",
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
    });

    // Create a CloudFront distribution
    const distribution = new cloudfront.Distribution(
      this,
      "ShopAutoDistribution",
      {
        defaultBehavior: { origin: new origins.S3Origin(shopAutoBucket) },
        defaultRootObject: "index.html",
      }
    );

    // Deploy the built React app to the S3 bucket
    new s3deploy.BucketDeployment(this, "DeployShopAuto", {
      sources: [s3deploy.Source.asset("../dist")],
      destinationBucket: shopAutoBucket,
      distribution,
      distributionPaths: ["/*"], // Invalidate all files
    });

    new cdk.CfnOutput(this, "BucketURL", {
      value: shopAutoBucket.bucketWebsiteUrl,
    });
    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: distribution.domainName,
    });
  }
}
