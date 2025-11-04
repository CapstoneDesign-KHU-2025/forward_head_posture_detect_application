-- CreateTable
CREATE TABLE "PostureSample" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "ts" TIMESTAMPTZ(6) NOT NULL,
    "angleDeg" DOUBLE PRECISION NOT NULL,
    "isTurtle" BOOLEAN NOT NULL,
    "hasPose" BOOLEAN NOT NULL DEFAULT true,
    "sessionId" BIGINT,
    "sampleGapS" DOUBLE PRECISION,

    CONSTRAINT "PostureSample_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostureSample_userId_ts_idx" ON "PostureSample"("userId", "ts");
