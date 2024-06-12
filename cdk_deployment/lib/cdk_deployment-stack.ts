import * as cdk from "aws-cdk-lib";
import {
  aws_s3 as s3,
  aws_s3_deployment as s3deploy,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_iam as iam,
} from "aws-cdk-lib";

export class CdkDeploymentStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const shopAutoBucket = new s3.Bucket(this, "ShopAutoBucket", {
      websiteIndexDocument: "index.html",
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      // publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const oai = new cloudfront.OriginAccessIdentity(this, "OAI");

    const distribution = new cloudfront.Distribution(
      this,
      "ShopAutoDistribution",
      {
        defaultBehavior: {
          origin: new origins.S3Origin(shopAutoBucket, {
            originAccessIdentity: oai,
          }),
        },
        defaultRootObject: "index.html",
      }
    );

    shopAutoBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        principals: [new iam.ServicePrincipal("cloudfront.amazonaws.com")],
        resources: [shopAutoBucket.arnForObjects("*")],
        conditions: {
          StringEquals: {
            "AWS:SourceArn": `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
          },
        },
      })
    );

    shopAutoBucket.grantRead(oai);

    new s3deploy.BucketDeployment(this, "DeployShopAuto", {
      sources: [s3deploy.Source.asset("../dist")],
      destinationBucket: shopAutoBucket,
      distribution,
      distributionPaths: ["/*"],
    });

    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: distribution.domainName,
    });
  }
}
