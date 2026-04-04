const {S3Client} = require("@aws-sdk/client-s3");
require('dotenv').config();

const s3Client = new S3Client({
    region: process.env.Region,
    credentials: {
        accessKeyId: process.env.Access_Key_ID,
        secretAccessKey: process.env.Secret_Access_Key,
    },
});

module.exports = s3Client;