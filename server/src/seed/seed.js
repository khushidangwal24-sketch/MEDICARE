const { connectDb } = require("../config/db");
const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const BloodDonor = require("../models/BloodDonor");
const PharmacyItem = require("../models/PharmacyItem");
const LabTest = require("../models/LabTest");
const User = require("../models/User");
const Booking = require("../models/Booking");
const { hashPassword } = require("../utils/auth");

async function seed() {
  await connectDb();

  await Hospital.deleteMany({});
  await Doctor.deleteMany({});
  await BloodDonor.deleteMany({});
  await PharmacyItem.deleteMany({});
  await LabTest.deleteMany({});
  await Booking.deleteMany({});
  await User.deleteMany({});

  const hospitals = await Hospital.insertMany([
    {
      name: "GreenLife Multispeciality Hospital",
      location: { city: "Delhi", address: "Sector 18, Dwarka, Delhi" },
      specialties: ["Cardiology", "Orthopedics", "Pediatrics"],
      phone: "+91 98765 43210",
      rating: 4.5,
      imageUrl:
        "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=60",
    },
    {
      name: "BlueCare City Hospital",
      location: { city: "Mumbai", address: "Andheri West, Mumbai" },
      specialties: ["Dermatology", "ENT", "General Medicine"],
      phone: "+91 99999 11111",
      rating: 4.3,
      imageUrl:
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=60",
    },
    {
      name: "Apollo-style Specialty Clinic",
      location: { city: "Bengaluru", address: "Indiranagar, Bengaluru" },
      specialties: ["Diabetology", "Neurology", "Psychiatry"],
      phone: "+91 88888 22222",
      rating: 4.4,
      imageUrl:
        "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=60",
    },
  ]);

  const [delhiHospital, mumbaiHospital, blrHospital] = hospitals;

  const doctors = await Doctor.insertMany([
    {
      name: "Dr. Anil Mehra",
      specialty: "Cardiology",
      hospitalId: delhiHospital._id,
      experienceYears: 12,
      fee: 800,
      languages: ["English", "Hindi"],
      imageUrl:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=60",
      availability: [
        { day: "Mon", slots: ["10:00", "10:30", "11:00"] },
        { day: "Wed", slots: ["16:00", "16:30"] },
      ],
      isTelemedicineAvailable: true,
    },
    {
      name: "Dr. Sana Qureshi",
      specialty: "Dermatology",
      hospitalId: mumbaiHospital._id,
      experienceYears: 8,
      fee: 700,
      languages: ["English", "Hindi", "Marathi"],
      imageUrl:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=60",
      availability: [
        { day: "Tue", slots: ["09:00", "09:30", "10:00"] },
        { day: "Thu", slots: ["18:00", "18:30"] },
      ],
      isTelemedicineAvailable: true,
    },
    {
      name: "Dr. Rohan Iyer",
      specialty: "Neurology",
      hospitalId: blrHospital._id,
      experienceYears: 10,
      fee: 1000,
      languages: ["English", "Kannada", "Hindi"],
      imageUrl:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=60",
      availability: [{ day: "Fri", slots: ["11:00", "11:30", "12:00"] }],
      isTelemedicineAvailable: false,
    },
  ]);
  const [drAnil, drSana] = doctors;

  await BloodDonor.insertMany([
    { name: "Rahul Singh", bloodGroup: "O+", phone: "9990001112", city: "Delhi", available: true },
    { name: "Meera Nair", bloodGroup: "A+", phone: "9990001113", city: "Mumbai", available: true },
    { name: "Kiran Rao", bloodGroup: "B-", phone: "9990001114", city: "Bengaluru", available: true },
  ]);

  await PharmacyItem.insertMany([
    { name: "Paracetamol 500mg", brand: "MediCare", category: "Fever & Pain", price: 35, inStock: true },
    { name: "Cetirizine 10mg", brand: "AllerFree", category: "Allergy", price: 45, inStock: true },
    { name: "ORS Sachet", brand: "HydraPlus", category: "Digestive", price: 25, inStock: true },
  ]);

  await LabTest.insertMany([
    { name: "Complete Blood Count (CBC)", description: "Basic blood health indicators", price: 399, fastingRequired: false, turnaroundTime: "24 hours" },
    { name: "Thyroid Profile (T3/T4/TSH)", description: "Thyroid screening panel", price: 699, fastingRequired: false, turnaroundTime: "24-48 hours" },
    { name: "Fasting Blood Sugar", description: "Diabetes screening test", price: 199, fastingRequired: true, turnaroundTime: "12-24 hours" },
  ]);

  const passwordHash = await hashPassword("password123");
  const demoUser = await User.create({
    name: "Demo User",
    email: "demo@healthhub.com",
    passwordHash,
    role: "user",
    medicalProfile: {
      bloodGroup: "O+",
      allergies: ["Dust", "Peanuts"],
      chronicConditions: ["Mild Asthma"],
      medications: ["Inhaler (SOS)"],
    },
    medicalHistory: [
      {
        id: "seed_history_1",
        diagnosis: "Mild Asthma",
        diagnosedOn: "2024-08-10",
        notes: "Symptoms are exercise induced; uses inhaler only when needed.",
        treatmentStatus: "ongoing",
        createdAt: new Date().toISOString(),
      },
      {
        id: "seed_history_2",
        diagnosis: "Seasonal Skin Allergy",
        diagnosedOn: "2025-06-03",
        notes: "Triggered during weather changes. Managed with antihistamines.",
        treatmentStatus: "monitoring",
        createdAt: new Date().toISOString(),
      },
    ],
    pathlabRecords: [
      {
        id: "seed_lab_1",
        testName: "Complete Blood Count (CBC)",
        resultSummary: "Hemoglobin slightly low; follow-up advised.",
        testDate: "2026-02-11",
        labName: "City Diagnostics",
        reportUrl: "https://example.com/reports/cbc-demo-user",
      },
      {
        id: "seed_lab_2",
        testName: "Fasting Blood Sugar",
        resultSummary: "Within normal range.",
        testDate: "2026-01-21",
        labName: "HealthHub Labs",
        reportUrl: "https://example.com/reports/fbs-demo-user",
      },
    ],
  });

  await Booking.insertMany([
    {
      userId: demoUser._id,
      doctorId: drAnil._id,
      hospitalId: delhiHospital._id,
      patientName: "Demo User",
      reason: "Chest discomfort during workout",
      appointmentDate: "2026-03-04T00:00:00.000Z",
      slot: "10:30",
      status: "completed",
      mode: "in_person",
    },
    {
      userId: demoUser._id,
      doctorId: drSana._id,
      hospitalId: mumbaiHospital._id,
      patientName: "Demo User",
      reason: "Recurring skin allergy rash",
      appointmentDate: "2026-02-14T00:00:00.000Z",
      slot: "09:30",
      status: "completed",
      mode: "telemedicine",
    },
  ]);

  // eslint-disable-next-line no-console
  console.log("Seed complete. Demo login: demo@healthhub.com / password123");
  process.exit(0);
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

