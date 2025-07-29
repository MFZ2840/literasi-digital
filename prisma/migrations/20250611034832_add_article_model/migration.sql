/*
  Warnings:

  - You are about to drop the column `coverImage` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `publishDate` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `series` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `seriesOrder` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Article` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[seriesSlug,order]` on the table `Article` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `seriesSlug` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Article_slug_key";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "coverImage",
DROP COLUMN "isPublished",
DROP COLUMN "publishDate",
DROP COLUMN "series",
DROP COLUMN "seriesOrder",
DROP COLUMN "slug",
DROP COLUMN "tags",
ADD COLUMN     "image" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "seriesSlug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Article_seriesSlug_order_key" ON "Article"("seriesSlug", "order");
