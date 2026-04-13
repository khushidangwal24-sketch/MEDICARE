const express = require("express");
const LabTest = require("../models/LabTest");
const { sortBy } = require("../data/store");

const router = express.Router();

// GET /api/labs?q=cbc
router.get("/", async (req, res, next) => {
  try {
    const { q } = req.query;
    const filter = q ? { $text: { $search: q } } : {};
    const tests = sortBy(await LabTest.find(filter), [["createdAt", -1]]).slice(0, 200);
    return res.json(tests);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

