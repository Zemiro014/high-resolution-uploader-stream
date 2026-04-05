import { MediaConvertClient, CreateJobCommand } from "@aws-sdk/client-mediaconvert";

export const handler = async (event) => {
    const s3Record = event.Records[0].s3;
    const bucket = s3Record.bucket.name;
    const key = decodeURIComponent(s3Record.object.key.replace(/\+/g, ' '));
    
    const fileId = key.split('/')[1].split('-')[0];

    const client = new MediaConvertClient({ region: "us-east-1" });
    
    const params = {
        // AGORA É SEGURO: Pegamos a Role dinamicamente do ambiente
        Role: process.env.MEDIA_CONVERT_ROLE_ARN, 
        
        Settings: {
          Inputs: [{
            FileInput: `s3://${bucket}/${key}`,
            AudioSelectors: { "Audio Selector 1": { DefaultSelection: "DEFAULT" } }
          }],
          OutputGroups: [{
            Name: "File Group",
            OutputGroupSettings: {
              Type: "HLS_GROUP_SETTINGS",
              HlsGroupSettings: {
                // Usamos o nome do bucket vindo do ambiente também
                Destination: `s3://${process.env.OUTPUT_BUCKET_NAME}/output/${fileId}/index`,
                SegmentLength: 10,
                MinSegmentLength: 0
              }
            },
            Outputs: [
              // ... (suas configurações de outputs 720p/1080p permanecem iguais)
            ]
          }]
        },
        UserMetadata: { fileId: fileId.toString() }
    };

    try {
        await client.send(new CreateJobCommand(params));
        console.log(`Job enviado usando Role: ${process.env.MEDIA_CONVERT_ROLE_ARN}`);
    } catch (err) {
        console.error("Erro ao criar Job:", err);
        throw err;
    }
};
