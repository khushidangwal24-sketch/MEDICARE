const express = require("express");
const Booking = require("../models/Booking");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");
const { sortBy } = require("../data/store");
const { validate } = require("../utils/validate");
const { createBookingSchema } = require("../schemas/bookings.schemas");
const { authRequired } = require("../utils/auth");

const router = express.Router();

router.get("/", authRequired, async (req, res, next) => {
  try {
    const items = sortBy(await Booking.find({ userId: req.user.sub }), [["createdAt", -1]]).slice(0, 200);
    const doctors = await Doctor.find({});
    const hospitals = await Hospital.find({});
    const doctorsById = new Map(doctors.map((d) => [d._id, d]));
    const hospitalsById = new Map(hospitals.map((h) => [h._id, h]));
    const bookings = items.map((b) => ({
      ...b,
      doctorId: doctorsById.get(b.doctorId) || null,
      hospitalId: hospitalsById.get(b.hospitalId) || null,
    }));
    return res.json(bookings);
  } catch (err) {
    return next(err);
  }
});

router.post("/", authRequired, validate(createBookingSchema), async (req, res, next) => {
  try {
    const { doctorId, hospitalId, patientName, reason, appointmentDate, slot, mode } =
      req.validated.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    let hospital = null;
    if (hospitalId) {
      hospital = await Hospital.findById(hospitalId);
      if (!hospital) return res.status(404).json({ message: "Hospital not found" });
    }

    const booking = await Booking.create({
      userId: req.user.sub,
      doctorId,
      hospitalId: hospital ? hospital._id : doctor.hospitalId,
      patientName,
      reason,
      appointmentDate: new Date(appointmentDate),
      slot,
      mode: mode || "in_person",
    });

    const populated = {
      ...booking,
      doctorId: doctor,
      hospitalId: hospital || (doctor.hospitalId ? await Hospital.findById(doctor.hospitalId) : null),
    };

    return res.status(201).json(populated);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

