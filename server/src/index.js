const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const { PORT, CLIENT_ORIGIN } = require("./config/env");
const { connectDb } = require("./config/db");

const { notFound, errorHandler } = require("./middleware/errors");

const hospitalRoutes = require("./routes/hospitals.routes");
const doctorRoutes = require("./routes/doctors.routes");
const bookingRoutes = require("./routes/bookings.routes");
const userRoutes = require("./routes/users.routes");
const bloodRoutes = require("./routes/blood.routes");
const pharmacyRoutes = require("./routes/pharmacy.routes");
const labRoutes = require("./routes/labs.routes");

async function main() {
  await connectDb();

  const app = express();
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(
    cors({
      origin: [CLIENT_ORIGIN],
      credentials: true,
    })
  );

  app.get("/api/health", (req, res) => res.json({ ok: true }));

  app.use("/api/hospitals", hospitalRoutes);
  app.use("/api/doctors", doctorRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/blood", bloodRoutes);
  app.use("/api/pharmacy", pharmacyRoutes);
  app.use("/api/labs", labRoutes);

  const clientDistPath = path.resolve(__dirname, "../../client/dist");
  const hasClientBuild = fs.existsSync(path.join(clientDistPath, "index.html"));

  if (hasClientBuild) {
    app.use(express.static(clientDistPath));
    app.use((req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      return res.sendFile(path.join(clientDistPath, "index.html"));
    });
  }

  app.use("/api", notFound);
  app.use(errorHandler);

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`App running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

