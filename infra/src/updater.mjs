export const handler = async (event) => {
    // O EventBridge envia os detalhes do Job concluído
    const { status, userMetadata, outputGroupDetails } = event.detail;
    const fileId = userMetadata.fileId;

    if (status === 'COMPLETE') {
        // Pega o primeiro path do manifesto gerado (index.m3u8)
        const playlistPath = outputGroupDetails[0].playlistFilePaths[0];
        // Converte o path de S3 para uma URL HTTPS acessível pelo Shaka Player
        const streamUrl = playlistPath.replace('s3://', 'https://amazonaws.com');

        console.log(`Tentando avisar o backend sobre o vídeo ${fileId}...`);

        try {
            // SUBSTITUA pela sua URL do ngrok
            const BACKEND_URL = "https://ngrok-free.app";

            const response = await fetch(`${BACKEND_URL}/complete/${fileId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status: 'COMPLETED',
                    streamUrl: streamUrl 
                })
            });

            const result = await response.json();
            console.log("Resposta do Backend:", result);
        } catch (err) {
            console.error("Falha ao conectar com o Backend local:", err.message);
        }
    }
};
