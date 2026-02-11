-- DropIndex
DROP INDEX "project_slug_key";

-- AlterTable
ALTER TABLE "project" ALTER COLUMN "slug" DROP NOT NULL;
