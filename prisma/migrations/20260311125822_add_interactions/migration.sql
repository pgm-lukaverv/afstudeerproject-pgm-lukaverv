-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "beatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "beatId" TEXT NOT NULL,
    "text" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "followerProfileId" TEXT NOT NULL,
    "followingProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Like_beatId_idx" ON "Like"("beatId");

-- CreateIndex
CREATE INDEX "Like_profileId_idx" ON "Like"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_profileId_beatId_key" ON "Like"("profileId", "beatId");

-- CreateIndex
CREATE INDEX "Comment_beatId_idx" ON "Comment"("beatId");

-- CreateIndex
CREATE INDEX "Comment_profileId_idx" ON "Comment"("profileId");

-- CreateIndex
CREATE INDEX "Follow_followingProfileId_idx" ON "Follow"("followingProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerProfileId_followingProfileId_key" ON "Follow"("followerProfileId", "followingProfileId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_beatId_fkey" FOREIGN KEY ("beatId") REFERENCES "Beat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_beatId_fkey" FOREIGN KEY ("beatId") REFERENCES "Beat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerProfileId_fkey" FOREIGN KEY ("followerProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingProfileId_fkey" FOREIGN KEY ("followingProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
