const { z } = require("zod");

const createHospitalSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    location: z.object({
      city: z.string().min(2),
      address: z.string().min(5),
      lat: z.number().optional(),
      lng: z.number().optional(),
    }),
    specialties: z.array(z.string()).optional().default([]),
    phone: z.string().optional(),
    imageUrl: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
  }),
});

module.exports = { createHospitalSchema };

