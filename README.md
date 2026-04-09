# 📺 VOD Studio: Professional Video-on-Demand Platform

A high-performance **Video-on-Demand (VOD)** platform designed to handle high-resolution uploads, automated transcoding, and global content delivery. This project implements a robust **Event-Driven Architecture** on AWS to ensure cost-efficiency and infinite scalability.

---

## 📐 System Architecture

The system was engineered following the principles of decoupling, security, and horizontal scalability:
<img width="1104" height="466" alt="Captura de tela de 2026-04-04 09-03-42" src="https://github.com/user-attachments/assets/e6b57fe9-aa33-4645-a191-c0883bad30dd" />


### Workflow Overview:
1.  **Resilient Upload:** The Frontend (React) utilizes **S3 Multipart Upload** to send large high-res files directly to S3. This bypasses the Node.js server to avoid **RAM bottlenecks** and **request timeouts**.
2.  **Event Trigger:** Upon successful upload, **Amazon S3** triggers an **AWS Lambda (Python)** function that initializes a transcoding job in **AWS MediaConvert**.
3.  **Transcoding:** MediaConvert processes the raw video into optimized streaming formats (HLS/Dash/MP4) and generates automated thumbnails.
4.  **Status Notification:** Once completed, MediaConvert notifies a second Lambda via **Amazon EventBridge**, which executes a webhook (PATCH) to the **Node.js Backend** to update the database.
5.  **Global Delivery:** Content is served through **Amazon CloudFront (CDN)** secured by **OAI (Origin Access Identity)** to ensure the S3 buckets remain private.

---

## 🛠️ Technology Stack

### **Frontend**
*   **React.js** (Vite)
*   **Shaka Player** (Adaptive Bitrate Streaming / DASH / HLS)
*   **Axios** (Multipart Upload logic)
*   **React Toastify** (UI/UX Feedback)
*   **Lucide React** (Iconography)

### **Backend**
*   **Node.js** with **Express**
*   **Prisma ORM** (Database management)
*   **PostgreSQL** (AWS RDS or local Docker)
*   **AWS SDK v3** (S3 & MediaConvert integration)

### **Infrastructure (AWS Cloud)**
*   **AWS ECS Fargate:** Serverless containers for the Stateless API.
*   **AWS Lambda (Python):** Lightweight, low-latency orchestration.
*   **AWS MediaConvert:** Broadcast-grade video transcoding.
*   **AWS CloudFront:** Low-latency global CDN with Edge protection.
*   **AWS CloudFormation:** Infrastructure as Code (IaC).

---

## 📦 Key Features

*   ✅ **Multipart Upload:** Chunks large files (5MB+) to ensure upload resilience against network instability.
*   ✅ **Advanced Security:** S3 buckets are 100% private. Content is only accessible via CloudFront, preventing unauthorized direct access and "hotlinking."
*   ✅ **Event-Driven Design:** The system scales automatically. Whether processing 1 or 1,000 videos, AWS manages the compute load seamlessly.
*   ✅ **Cinematic UX:** Real-time progress feedback, automated video gallery, and a player with adaptive technology.

---

## 🔧 Getting Started

### Prerequisites:
* Node.js v18+
* Docker (optional for local DB)
* AWS Credentials configured

### Installation:
1.  **Clone the repository:**
    ```bash
    git clone https://github.com
    cd vod-studio
    ```

2.  **Backend Setup:**
    * Configure the `.env` file in the `/backend` folder.
    * `npm install`
    * `npx prisma migrate dev`
    * `npm run dev`

3.  **Frontend Setup:**
    * `npm install`
    * `npm run dev`

---

## 🚀 Future Roadmap
- [ ] Implement **CloudFront Signed URLs** for premium content protection.
- [ ] Support for multiple audio tracks and automated subtitles.
- [ ] Advanced viewership analytics dashboard.

---
Developed by **Your Name** - [LinkedIn](https://www.linkedin.com/in/jeronimo-kulandissa-b17780120/)
