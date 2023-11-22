const { S3 } = require("aws-sdk");

exports.s3Uploadv2 = async () => {
  const s3 = new S3();

  const param = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: ``,
  };
  s3.upload();
};
