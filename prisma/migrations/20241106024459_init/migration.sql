-- CreateTable
CREATE TABLE "StaffMember" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "StaffMember_pkey" PRIMARY KEY ("id")
);
