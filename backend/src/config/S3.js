const {S3Client} = require("@aws-sdk/client-s3");
require('dotenv').config();

const s3Client = new S3Client({
    region: process.env.Region || "us-east-1"
});

module.exports = s3Client;