-- CreateTable
CREATE TABLE "games_vs_computer" (
    "slot" INTEGER NOT NULL,
    "board" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "winner" TEXT,
    "winningLine" JSONB,

    CONSTRAINT "games_vs_computer_pkey" PRIMARY KEY ("slot")
);
