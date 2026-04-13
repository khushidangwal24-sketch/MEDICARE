const express = require("express");
const BloodDonor = require("../models/BloodDonor");
const { sortBy } = require("../data/store");
const { validate } = require("../utils/validate");
const { createDonorSchema } = require("../schemas/blood.schemas");

const router = express.Router();

// GET /api/blood/donors?city=Delhi&bloodGroup=O%2B
router.get("/donors", async (req, res, next) => {
  try {
    const { city, bloodGroup } = req.query;
    const filter = {};
    if (city) filter.city = city;
    if (bloodGroup) filter.bloodGroup = bloodGroup;

    const donors = sortBy(await BloodDonor.find(filter), [["updatedAt", -1]]).slice(0, 200);
    return res.json(donors);
  } catch (err) {
    return next(err);
  }
});

router.post("/donors", validate(createDonorSchema), async (req, res, next) => {
  try {
    const donor = await BloodDonor.create({
      ...req.validated.body,
      lastDonationDate: req.validated.body.lastDonationDate
        ? new Date(req.validated.body.lastDonationDate)
        : undefined,
    });
    return res.status(201).json(donor);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

