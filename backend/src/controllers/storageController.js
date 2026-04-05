const { GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3Client = require("../config/S3");
const { PrismaClient } = require("../../prisma/generated/client")
const prisma = new PrismaClient();

const { STSClient, GetCallerIdentityCommand } = require("@aws-sdk/client-sts");

// Função para validar a conta no console do Node
const logAwsIdentity = async () => {
  const sts = new STSClient({
    region: process.env.Region,
    credentials: {
      accessKeyId: process.env.Access_Key_ID,
      secretAccessKey: process.env.Secret_Access_Key,
    },
  });
  try {
    const { Account, Arn } = await sts.send(new GetCallerIdentityCommand({}));
    console.log(`--- AWS IDENTITY CHECK ---`);
    console.log(`Account ID: ${Account}`);
    console.log(`User ARN: ${Arn}`);
    console.log(`--------------------------`);
  } catch (err) {
    console.error("ERRO: Falha ao validar credenciais AWS no .env", err.message);
  }
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
        Bucket: process.env.Bucket_Name,
        Key: fileKey,
        ContentType: fileType,
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
  logAwsIdentity();
  try {
    const updatedFile = await prisma.file.update({
      where: { id: Number(fileId) },
      data: { status: "UPLOADED" } // Ou "SUCCESS" como preferir
    });

    res.json({ message: "Upload confirmado com sucesso!", file: updatedFile });
  } catch (err) {
    res.status(404).json({ error: "Arquivo não encontrado ou erro na atualização" });
  }
};