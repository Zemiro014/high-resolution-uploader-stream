const { GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3Client = require("../config/S3");

exports.getUploadUrl = async (req, res) => {
    const { fileName, fileType, size, description } = req.body;

    if(!fileName || !fileType){
        return res.status(400).json({error: "Insufficient Data"})
    }

    const fileKey = `uploads/${Date.now()}-${fileName}`;

    const dbRecord = {
        id: Math.floor(Math.random() * 1000),
        fileName,
        fileKey,
        fileType,
        size,
        description,
        status: "PENDIND",
        createdAt: new Date()
    };

    const command = new PutObjectCommand({
        Bucket: process.env.Bucket_Name,
        Key: fileKey,
        ContentType: fileType,
    });

    try {
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300});
        res.json({
            uploadUrl,
            fileId: dbRecord.id,
            fileKey
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({error: "Error to get Upload URL"});
    }
}