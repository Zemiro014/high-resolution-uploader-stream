const { GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { 
  S3Client, 
  CreateMultipartUploadCommand, 
  UploadPartCommand, 
  CompleteMultipartUploadCommand 
} = require("@aws-sdk/client-s3");
require('dotenv').config();
const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1"
});
const { PrismaClient } = require("../../prisma/generated/client")
const prisma = new PrismaClient();

// A. Iniciar o Upload
exports.startMultipartUpload = async (req, res) => {
    const { fileName, fileType } = req.body;
    const fileKey = `uploads/${Date.now()}-${fileName}`;

    // Cria o registro no Prisma como PENDING
    const fileRecord = await prisma.file.create({
        data: { fileName, fileKey, fileType, status: "PENDING" }
    });

    const command = new CreateMultipartUploadCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        ContentType: fileType,
        Metadata: { "fileid": String(fileRecord.id) }
    });

    const response = await s3Client.send(command);
    res.json({ uploadId: response.UploadId, fileKey, fileId: fileRecord.id });
};

// B. Gerar URL para cada Parte (Chunk)
exports.getPartPresignedUrl = async (req, res) => {
    const { fileKey, uploadId, partNumber } = req.body;

    const command = new UploadPartCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        UploadId: uploadId,
        PartNumber: Number(partNumber),
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    res.json({ url });
};

// C. Finalizar (Juntar as partes no S3)
exports.completeMultipartUpload = async (req, res) => {
    const { fileKey, uploadId, parts } = req.body;

    const command = new CompleteMultipartUploadCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts } // Array de { ETag, PartNumber }
    });

    await s3Client.send(command);
    res.json({ message: "Upload concluído com sucesso!" });
};

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
          "fileid": String(fileRecord.id) // <--- ADICIONE ISSO
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
  const { fileid } = req.params;
  const status = (req.body && req.body.status) ? req.body.status : "PROCESSING";
  const { processedKey } = req.body; 

  console.log("STATUUUUUUUUUUUSSSS: "+status)
  console.log("FILE ID CHEGOU NO confirmUpload: "+fileid)

  try {
    const currentFile = await prisma.file.findUnique({ where: { id: Number(fileid) } });
    
    // Se o status já for o mesmo, apenas retorne 200 sem fazer nada
    if (currentFile?.status === status) {
      return res.json({ message: "Status já atualizado", file: currentFile });
    }
    
    const updatedFile = await prisma.file.update({
      where: { id: Number(fileid) },
      data: { status: status, ...(processedKey && { videoUrl: `https://cloudfront.net{processedKey}` }) } // Ou "SUCCESS" como preferir
    });
    console.log(`✅ Registro ${fileid} atualizado.`);
    console.log("VIDEO URL: "+updatedFile.videoUrl)
    console.log(`✅ Registro ${fileid} movido para: ${status}`);
    res.json({ message: "URL do vídeo atualizada!", videoUrl: updatedFile.videoUrl });
  } catch (err) {
    console.error("Erro Prisma:", err);
    res.status(500).json({ error: "Erro interno ao atualizar banco" });
  }
};