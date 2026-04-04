const { GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3Client = require("../config/S3");

exports.getUploadUrl = async (req, res) => {
    const { fileName, fileType } = req.body;

    const command = new PutObjectCommand({
        Bucket: process.env.Bucket_Name,
        Key: `uploads/${Date.now()}-${fileName}`,
        ContentType: fileType,
    });

    try {
        const url = await getSignedUrl(s3Client, command, { expiresIn: 300});
        res.json({url})
    } catch (err) {
        res.status(500).json({error: "Error to get Upload URL"});
    }
}