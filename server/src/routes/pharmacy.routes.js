const express = require("express");
const PharmacyItem = require("../models/PharmacyItem");
const { sortBy } = require("../data/store");

const router = express.Router();

// GET /api/pharmacy?category=Pain%20relief&q=paracetamol
router.get("/", async (req, res, next) => {
  try {
    const { category, q } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (q) filter.$text = { $search: q };
    const items = sortBy(await PharmacyItem.find(filter), [["createdAt", -1]]).slice(0, 200);
    return res.json(items);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

