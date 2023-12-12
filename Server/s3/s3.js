const { S3 } = require("aws-sdk");

exports.s3Uploadv2 = async () => {
  const s3 = new S3();

  s3.upload();
};
