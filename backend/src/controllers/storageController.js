const { GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3Client = require("../config/S3");
const { PrismaClient } = require("../../prisma/generated/client")
const prisma = new PrismaClient();

exports.getUploadUrl = async (req, res) => {
    const { fileName, fileType } = req.body;

    if(!fileName || !fileType){
        return res.status(400).json({error: "Insufficient Data"})
    }

    const fileKey = `uploads/${Date.now()}-${fileName}`;

    const fileRecord = await prisma.file.create({
        data: {
            fileName,
            fileKey,
            fileType,
            status: "PENDIND",
        }
    });

    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        ContentType: fileType,
        Metadata: {
          "fileId": String(fileRecord.id) // <--- ADICIONE ISSO
        }
    });

    try {
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300});
        res.json({
            uploadUrl,
            fileId: fileRecord.id,
            fileKey
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({error: "Error to get Upload URL"});
    }
};

exports.confirmUpload = async (req, res) => {
  const { fileId } = req.params;
  const status = (req.body && req.body.status) ? req.body.status : "PROCESSING";

  console.log("STATUUUUUUUUUUUSSSS: "+status)
  console.log("FILE ID CHEGOU NO confirmUpload: "+fileId)

  try {
    const currentFile = await prisma.file.findUnique({ where: { id: Number(fileId) } });
    
    // Se o status já for o mesmo, apenas retorne 200 sem fazer nada
    if (currentFile?.status === status) {
      return res.json({ message: "Status já atualizado", file: currentFile });
    }
    
    const updatedFile = await prisma.file.update({
      where: { id: Number(fileId) },
      data: { status: status, ...(processedKey && { videoUrl: `https://cloudfront.net{processedKey}` }) } // Ou "SUCCESS" como preferir
    });
    console.log("VIDEO URL: "+updatedFile.videoUrl)
    console.log(`✅ Registro ${fileId} movido para: ${status}`);
    res.json({ message: "URL do vídeo atualizada!", videoUrl: updatedFile.videoUrl });
  } catch (err) {
    res.status(404).json({ error: "Arquivo não encontrado ou erro na atualização" });
  }
};