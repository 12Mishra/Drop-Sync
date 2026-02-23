-- AlterTable
ALTER TABLE "Files" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Uncategorized',
ADD COLUMN     "tags" TEXT[];
