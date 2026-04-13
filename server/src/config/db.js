const fs = require("fs/promises");
const path = require("path");

async function connectDb() {
  const dbPath = path.join(__dirname, "..", "data", "db.json");
  try {
    await fs.access(dbPath);
  } catch {
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(
      dbPath,
      JSON.stringify(
        {
          hospitals: [],
          doctors: [],
          bookings: [],
          users: [],
          bloodDonors: [],
          pharmacyItems: [],
          labTests: [],
        },
        null,
        2
      ),
      "utf8"
    );
  }
  return { ok: true };
}

module.exports = { connectDb };

