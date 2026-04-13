const { z } = require("zod");

const createDoctorSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    specialty: z.string().min(2),
    hospitalId: z.string().optional(),
    experienceYears: z.number().min(0).optional(),
    fee: z.number().min(0).optional(),
    languages: z.array(z.string()).optional().default([]),
    imageUrl: z.string().optional(),
    availability: z
      .array(
        z.object({
          day: z.string().min(2),
          slots: z.array(z.string()).optional().default([]),
        })
      )
      .optional()
      .default([]),
    isTelemedicineAvailable: z.boolean().optional(),
  }),
});

module.exports = { createDoctorSchema };

