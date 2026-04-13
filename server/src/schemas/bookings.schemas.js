const { z } = require("zod");

const createBookingSchema = z.object({
  body: z.object({
    doctorId: z.string().min(1),
    hospitalId: z.string().optional(),
    patientName: z.string().min(2),
    reason: z.string().optional(),
    appointmentDate: z.string().min(8), // ISO string
    slot: z.string().min(1),
    mode: z.enum(["in_person", "telemedicine"]).optional(),
  }),
});

module.exports = { createBookingSchema };

