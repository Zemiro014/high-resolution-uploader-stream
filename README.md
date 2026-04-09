# 📺 VOD Studio: High-Resolution Video Platform

Plataforma de **Video on Demand (VOD)** profissional desenvolvida para lidar com uploads de alta resolução, transcodificação automática e entrega global via CDN. Este projeto demonstra uma implementação robusta de arquitetura **Serverless** e **orientada a eventos** na AWS.

---

## 📐 Arquitetura do Sistema

O sistema foi desenhado seguindo os princípios de desacoplamento, segurança e escalabilidade horizontal:

<p align="center">
  <!-- Substitua o caminho abaixo pelo caminho real da sua imagem no repositório -->
  <img src="/home/jeronimo/Downloads/Captura de tela de 2026-04-04 09-03-42.png" alt="Arquitetura AWS VOD" width="850px">
</p>

### Fluxo de Funcionamento:
1.  **Upload Resiliente:** O Frontend (React) utiliza **S3 Multipart Upload** para enviar vídeos pesados diretamente para o S3, evitando sobrecarga no servidor Node.js.
2.  **Gatilho de Evento:** Assim que o upload termina, o **S3** dispara uma **Lambda (Python)** que cria um job de transcodificação no **AWS MediaConvert**.
3.  **Processamento:** O MediaConvert converte o vídeo original para formatos otimizados (HLS/Dash/MP4) e gera thumbnails.
4.  **Notificação de Status:** Ao finalizar, o MediaConvert notifica outra Lambda via **EventBridge**, que faz um webhook (PATCH) para o **Backend (Node.js)** atualizando o banco de dados.
5.  **Entrega Global:** Os vídeos são servidos através do **Amazon CloudFront (CDN)** com proteção **OAI (Origin Access Identity)**.

---

## 🛠️ Tecnologias e Ferramentas

### **Frontend**
*   **React.js** (Vite)
*   **Shaka Player** (Reprodução Adaptativa/DASH/HLS)
*   **Axios** (Multipart Upload)
*   **React Toastify** (Notificações de UX)
*   **Lucide React** (Ícones profissionais)

### **Backend**
*   **Node.js** com **Express**
*   **Prisma ORM** (Gerenciamento de banco de dados)
*   **PostgreSQL** (Rodando em AWS RDS ou Docker)
*   **AWS SDK v3** (Integração S3/MediaConvert)

### **Infraestrutura (Cloud Computing)**
*   **AWS ECS Fargate:** Containers Serverless para a API (Stateless).
*   **AWS Lambda (Python):** Orquestração leve e rápida.
*   **AWS MediaConvert:** Transcodificação de nível broadcast.
*   **AWS CloudFront:** CDN para entrega com baixa latência e proteção de borda.
*   **AWS CloudFormation:** Infraestrutura como Código (IaC).

---

## 📦 Funcionalidades Principais

*   ✅ **Multipart Upload:** Divisão de arquivos em partes de 5MB+ para garantir que uploads de vídeos em 4K/HD não falhem por oscilação de rede.
*   ✅ **Segurança Avançada:** Buckets S3 privados. O conteúdo só é acessível através do CloudFront, garantindo controle total de banda e acesso.
*   ✅ **Design orientado a Eventos:** O sistema escala automaticamente sem intervenção manual. Se 1 ou 1.000 vídeos forem enviados, a AWS gerencia a carga.
*   ✅ **UX Cinematográfica:** Interface com feedbacks de progresso, galeria de vídeos e player com tecnologia adaptativa.

---

## 🔧 Como Rodar o Projeto

### Pré-requisitos:
* Node.js v18+
* Docker (opcional para o banco local)
* Credenciais AWS configuradas

### Passo a passo:
1.  **Clone e Instale:**
    ```bash
    git clone https://github.com
    cd vod-studio
    ```

2.  **Backend:**
    * Configure o `.env` na pasta `/backend`.
    * `npm install`
    * `npx prisma migrate dev`
    * `npm run dev`

3.  **Frontend:**
    * `npm install`
    * `npm run dev`

---

## 🚀 Próximos Passos (Roadmap)
- [ ] Implementação de **CloudFront Signed URLs** para proteção de conteúdo premium.
- [ ] Suporte a múltiplas trilhas de áudio e legendas automáticas.
- [ ] Dashboards de analytics de visualização.

---
Desenvolvido por **Seu Nome** - [LinkedIn](https://linkedin.com) | [Portfolio](https://seu-portfolio.com
