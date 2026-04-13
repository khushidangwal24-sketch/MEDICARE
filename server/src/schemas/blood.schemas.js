const { z } = require("zod");

const createDonorSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
    phone: z.string().min(8),
    city: z.string().min(2),
    lastDonationDate: z.string().optional(),
    available: z.boolean().optional(),
  }),
});

module.exports = { createDonorSchema };

