-- CreateTable
CREATE TABLE "games_vs_human" (
    "id" UUID NOT NULL,
    "board" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "playerOneId" UUID NOT NULL,
    "playerTwoId" UUID,
    "playerOneSymbol" INTEGER NOT NULL,
    "playerTwoSymbol" INTEGER NOT NULL,
    "winner" TEXT,
    "winnerId" UUID,
    "winningLine" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_vs_human_pkey" PRIMARY KEY ("id")
);
