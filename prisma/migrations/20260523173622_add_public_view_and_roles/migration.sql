-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('EDITOR', 'VIEWER');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "publicViewEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ProjectCollaborator" ADD COLUMN     "role" "ProjectRole" NOT NULL DEFAULT 'EDITOR';
