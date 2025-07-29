-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Article_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
