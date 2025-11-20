-- CreateTable
CREATE TABLE "games" (
    "slot" INTEGER NOT NULL,
    "board" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "winner" TEXT,
    "winningLine" JSONB,

    CONSTRAINT "games_pkey" PRIMARY KEY ("slot")
);
