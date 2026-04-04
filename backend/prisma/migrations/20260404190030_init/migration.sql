-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "File_fileKey_key" ON "File"("fileKey");
