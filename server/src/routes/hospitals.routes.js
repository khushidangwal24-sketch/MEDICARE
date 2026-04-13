const express = require("express");
const Hospital = require("../models/Hospital");
const { sortBy } = require("../data/store");
const { validate } = require("../utils/validate");
const { createHospitalSchema } = require("../schemas/hospitals.schemas");

const router = express.Router();

// GET /api/hospitals?city=Delhi&specialty=Cardiology&q=apollo
router.get("/", async (req, res, next) => {
  try {
    const { city, specialty, q } = req.query;

    const filter = {};
    if (city) filter["location.city"] = city;
    if (specialty) filter.specialties = specialty;
    if (q) filter.$text = { $search: q };
    const items = await Hospital.find(filter);
    const hospitals = sortBy(items, [
      ["rating", -1],
      ["createdAt", -1],
    ]).slice(0, 100);
    return res.json(hospitals);
  } catch (err) {
    return next(err);
  }
});

router.post("/", validate(createHospitalSchema), async (req, res, next) => {
  try {
    const hospital = await Hospital.create(req.validated.body);
    return res.status(201).json(hospital);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

