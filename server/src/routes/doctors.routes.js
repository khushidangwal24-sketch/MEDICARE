const express = require("express");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");
const { sortBy } = require("../data/store");
const { validate } = require("../utils/validate");
const { createDoctorSchema } = require("../schemas/doctors.schemas");

const router = express.Router();

// GET /api/doctors?specialty=Dermatology&hospitalId=...&q=anil
router.get("/", async (req, res, next) => {
  try {
    const { specialty, hospitalId, q } = req.query;
    const filter = {};
    if (specialty) filter.specialty = specialty;
    if (hospitalId) filter.hospitalId = hospitalId;
    if (q) filter.$text = { $search: q };
    const rawDoctors = sortBy(await Doctor.find(filter), [["createdAt", -1]]).slice(0, 100);
    const hospitals = await Hospital.find({});
    const hospitalsById = new Map(hospitals.map((h) => [h._id, h]));
    const doctors = rawDoctors.map((d) => ({
      ...d,
      hospitalId: d.hospitalId ? hospitalsById.get(d.hospitalId) || null : null,
    }));
    return res.json(doctors);
  } catch (err) {
    return next(err);
  }
});

router.post("/", validate(createDoctorSchema), async (req, res, next) => {
  try {
    const doctor = await Doctor.create(req.validated.body);
    return res.status(201).json(doctor);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

