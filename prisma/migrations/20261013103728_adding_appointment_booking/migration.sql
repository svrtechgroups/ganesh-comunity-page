-- CreateEnum
CREATE TYPE "DynamicFormFieldType" AS ENUM ('TEXT', 'TEXTAREA', 'SELECT', 'RADIO', 'CHECKBOX', 'DATE', 'APPOINTMENT');

-- CreateTable
CREATE TABLE "DynamicForm" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "creatorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DynamicForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicFormField" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "type" "DynamicFormFieldType" NOT NULL,
    "label" TEXT NOT NULL,
    "placeholder" TEXT,
    "helpText" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "options" JSONB DEFAULT '[]',
    "appointmentConfig" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DynamicFormField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentSlot" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "maxCapacity" INTEGER NOT NULL DEFAULT 1,
    "bookedCount" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppointmentSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicFormSubmission" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "DynamicFormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicSubmissionAnswer" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "fieldId" TEXT,
    "fieldSnapshot" JSONB NOT NULL,
    "answerValue" TEXT NOT NULL,
    "jsonValue" JSONB,
    "slotId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DynamicSubmissionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlotBooking" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "bookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',

    CONSTRAINT "SlotBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DynamicForm_isPublished_idx" ON "DynamicForm"("isPublished");

-- CreateIndex
CREATE INDEX "DynamicForm_createdAt_idx" ON "DynamicForm"("createdAt");

-- CreateIndex
CREATE INDEX "DynamicFormField_formId_orderIndex_idx" ON "DynamicFormField"("formId", "orderIndex");

-- CreateIndex
CREATE INDEX "DynamicFormField_formId_isActive_idx" ON "DynamicFormField"("formId", "isActive");

-- CreateIndex
CREATE INDEX "AppointmentSlot_fieldId_startTime_endTime_idx" ON "AppointmentSlot"("fieldId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "AppointmentSlot_fieldId_bookedCount_maxCapacity_idx" ON "AppointmentSlot"("fieldId", "bookedCount", "maxCapacity");

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentSlot_fieldId_startTime_key" ON "AppointmentSlot"("fieldId", "startTime");

-- CreateIndex
CREATE INDEX "DynamicFormSubmission_formId_submittedAt_idx" ON "DynamicFormSubmission"("formId", "submittedAt");

-- CreateIndex
CREATE INDEX "DynamicSubmissionAnswer_submissionId_idx" ON "DynamicSubmissionAnswer"("submissionId");

-- CreateIndex
CREATE INDEX "DynamicSubmissionAnswer_fieldId_answerValue_idx" ON "DynamicSubmissionAnswer"("fieldId", "answerValue");

-- CreateIndex
CREATE INDEX "SlotBooking_slotId_idx" ON "SlotBooking"("slotId");

-- CreateIndex
CREATE INDEX "SlotBooking_submissionId_idx" ON "SlotBooking"("submissionId");

-- AddForeignKey
ALTER TABLE "DynamicFormField" ADD CONSTRAINT "DynamicFormField_formId_fkey" FOREIGN KEY ("formId") REFERENCES "DynamicForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentSlot" ADD CONSTRAINT "AppointmentSlot_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "DynamicFormField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicFormSubmission" ADD CONSTRAINT "DynamicFormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "DynamicForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicSubmissionAnswer" ADD CONSTRAINT "DynamicSubmissionAnswer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "DynamicFormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicSubmissionAnswer" ADD CONSTRAINT "DynamicSubmissionAnswer_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "DynamicFormField"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlotBooking" ADD CONSTRAINT "SlotBooking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "AppointmentSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlotBooking" ADD CONSTRAINT "SlotBooking_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "DynamicFormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
