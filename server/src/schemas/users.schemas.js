const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const updateMedicalProfileSchema = z.object({
  body: z.object({
    bloodGroup: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    chronicConditions: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
  }),
});

const addMedicalHistoryEntrySchema = z.object({
  body: z.object({
    diagnosis: z.string().min(2),
    diagnosedOn: z.string().optional(),
    notes: z.string().optional(),
    treatmentStatus: z.enum(["ongoing", "resolved", "monitoring"]).optional(),
  }),
});

const addPathlabRecordSchema = z.object({
  body: z.object({
    testName: z.string().min(2),
    resultSummary: z.string().min(2),
    testDate: z.string().optional(),
    labName: z.string().optional(),
    reportUrl: z.string().url().optional(),
  }),
});

const updatePathlabRecordSchema = z.object({
  params: z.object({
    recordId: z.string().min(2),
  }),
  body: z.object({
    testName: z.string().min(2),
    resultSummary: z.string().min(2),
    testDate: z.string().optional(),
    labName: z.string().optional(),
    reportUrl: z.string().url().optional(),
  }),
});

const pathlabRecordIdSchema = z.object({
  params: z.object({
    recordId: z.string().min(2),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateMedicalProfileSchema,
  addMedicalHistoryEntrySchema,
  addPathlabRecordSchema,
  updatePathlabRecordSchema,
  pathlabRecordIdSchema,
};

