-- CreateTable
CREATE TABLE "code_works" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "sourceCode" TEXT NOT NULL,
    "sha3Hash" TEXT NOT NULL,
    "codeteiXml" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "code_works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "explanations" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lineNumber" INTEGER,
    "content" TEXT NOT NULL,
    "agent" TEXT NOT NULL DEFAULT 'chatgpt',
    "model" TEXT,
    "confidence" DOUBLE PRECISION,
    "understanding" INTEGER,
    "question" TEXT,
    "codeWorkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "explanations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executions" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "containerInfo" TEXT,
    "chainName" TEXT,
    "txId" TEXT,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "codeWorkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "executions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "code_works_sha3Hash_key" ON "code_works"("sha3Hash");

-- AddForeignKey
ALTER TABLE "explanations" ADD CONSTRAINT "explanations_codeWorkId_fkey" FOREIGN KEY ("codeWorkId") REFERENCES "code_works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executions" ADD CONSTRAINT "executions_codeWorkId_fkey" FOREIGN KEY ("codeWorkId") REFERENCES "code_works"("id") ON DELETE CASCADE ON UPDATE CASCADE;
