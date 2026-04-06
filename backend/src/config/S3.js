const {S3Client} = require("@aws-sdk/client-s3");
require('dotenv').config();

const s3Client = new S3Client({
    region: process.env.Region || "us-east-1",
    credentials: {
        accessKeyId: process.env.Access_Key_ID,
        secretAccessKey: process.env.Secret_Access_Key,
    },
});

module.exports = s3Client;