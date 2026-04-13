const express = require("express");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");
const LabTest = require("../models/LabTest");
const { sortBy } = require("../data/store");
const { validate } = require("../utils/validate");
const {
  registerSchema,
  loginSchema,
  updateMedicalProfileSchema,
  addMedicalHistoryEntrySchema,
  addPathlabRecordSchema,
  updatePathlabRecordSchema,
  pathlabRecordIdSchema,
} = require("../schemas/users.schemas");
const { hashPassword, verifyPassword, signToken, authRequired } = require("../utils/auth");

const router = express.Router();

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || "user",
    medicalProfile: user.medicalProfile || {
      bloodGroup: "",
      allergies: [],
      chronicConditions: [],
      medications: [],
    },
    medicalHistory: user.medicalHistory || [],
  };
}

async function buildRecordsPayload(user) {
  const bookings = sortBy(await Booking.find({ userId: user._id }), [["createdAt", -1]]);
  const doctors = await Doctor.find({});
  const hospitals = await Hospital.find({});
  const doctorsById = new Map(doctors.map((d) => [d._id, d]));
  const hospitalsById = new Map(hospitals.map((h) => [h._id, h]));

  const previousVisits = bookings.map((b) => ({
    id: b._id,
    appointmentDate: b.appointmentDate,
    slot: b.slot,
    mode: b.mode,
    reason: b.reason || "",
    status: b.status || "booked",
    doctorName: doctorsById.get(b.doctorId)?.name || "Unknown doctor",
    hospitalName: hospitalsById.get(b.hospitalId)?.name || "Unknown hospital",
  }));

  const problemsFaced = [...new Set(previousVisits.map((v) => v.reason).filter(Boolean))];
  const medicalHistory = sortBy(user.medicalHistory || [], [["diagnosedOn", -1], ["createdAt", -1]]);
  const pathlabRecords = sortBy(user.pathlabRecords || [], [["testDate", -1]]);
  const recommendedLabTests = (await LabTest.find({})).slice(0, 6);

  return {
    user: toPublicUser(user),
    medicalProfile: toPublicUser(user).medicalProfile,
    medicalHistory,
    previousVisits,
    problemsFaced,
    pathlabRecords,
    recommendedLabTests,
  };
}

router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.validated.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "user",
      medicalProfile: {
        bloodGroup: "",
        allergies: [],
        chronicConditions: [],
        medications: [],
      },
      medicalHistory: [],
      pathlabRecords: [],
    });
    const token = signToken(user);
    return res.status(201).json({
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.validated.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken(user);
    return res.json({
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/me/records", authRequired, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(await buildRecordsPayload(user));
  } catch (err) {
    return next(err);
  }
});

router.put(
  "/me/medical-profile",
  authRequired,
  validate(updateMedicalProfileSchema),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.sub);
      if (!user) return res.status(404).json({ message: "User not found" });

      const current = user.medicalProfile || {
        bloodGroup: "",
        allergies: [],
        chronicConditions: [],
        medications: [],
      };
      const updates = req.validated.body;
      const nextProfile = {
        ...current,
        ...updates,
      };
      const updated = await User.updateById(user._id, { medicalProfile: nextProfile });
      return res.json({ medicalProfile: updated.medicalProfile });
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/me/medical-history",
  authRequired,
  validate(addMedicalHistoryEntrySchema),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.sub);
      if (!user) return res.status(404).json({ message: "User not found" });

      const payload = req.validated.body;
      const history = user.medicalHistory || [];
      const nextEntry = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        diagnosis: payload.diagnosis,
        diagnosedOn: payload.diagnosedOn || new Date().toISOString().slice(0, 10),
        notes: payload.notes || "",
        treatmentStatus: payload.treatmentStatus || "ongoing",
        createdAt: new Date().toISOString(),
      };

      const updated = await User.updateById(user._id, {
        medicalHistory: [nextEntry, ...history],
      });
      return res.status(201).json({ medicalHistory: updated.medicalHistory || [] });
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/me/pathlabs",
  authRequired,
  validate(addPathlabRecordSchema),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.sub);
      if (!user) return res.status(404).json({ message: "User not found" });

      const payload = req.validated.body;
      const records = user.pathlabRecords || [];
      const nextRecord = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        testName: payload.testName,
        resultSummary: payload.resultSummary,
        testDate: payload.testDate || new Date().toISOString().slice(0, 10),
        labName: payload.labName || "External Lab",
        reportUrl: payload.reportUrl || "",
      };
      const updated = await User.updateById(user._id, {
        pathlabRecords: [nextRecord, ...records],
      });
      return res.status(201).json({ pathlabRecords: updated.pathlabRecords || [] });
    } catch (err) {
      return next(err);
    }
  }
);

router.put(
  "/me/pathlabs/:recordId",
  authRequired,
  validate(updatePathlabRecordSchema),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.sub);
      if (!user) return res.status(404).json({ message: "User not found" });

      const { recordId } = req.validated.params;
      const payload = req.validated.body;
      const records = user.pathlabRecords || [];
      const idx = records.findIndex((r) => r.id === recordId);
      if (idx === -1) return res.status(404).json({ message: "Pathlab record not found" });

      const nextRecords = [...records];
      nextRecords[idx] = { ...nextRecords[idx], ...payload };
      const updated = await User.updateById(user._id, { pathlabRecords: nextRecords });
      return res.json({ pathlabRecords: updated.pathlabRecords || [] });
    } catch (err) {
      return next(err);
    }
  }
);

router.delete(
  "/me/pathlabs/:recordId",
  authRequired,
  validate(pathlabRecordIdSchema),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.sub);
      if (!user) return res.status(404).json({ message: "User not found" });

      const { recordId } = req.validated.params;
      const records = user.pathlabRecords || [];
      const nextRecords = records.filter((r) => r.id !== recordId);
      if (nextRecords.length === records.length) {
        return res.status(404).json({ message: "Pathlab record not found" });
      }
      const updated = await User.updateById(user._id, { pathlabRecords: nextRecords });
      return res.json({ pathlabRecords: updated.pathlabRecords || [] });
    } catch (err) {
      return next(err);
    }
  }
);

router.get("/me/summary/download", authRequired, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ message: "User not found" });

    const payload = await buildRecordsPayload(user);
    const fileName = `patient-summary-${user._id}.json`;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);
    return res.status(200).send(JSON.stringify(payload, null, 2));
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

