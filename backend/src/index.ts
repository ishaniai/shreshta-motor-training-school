import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { appointmentRouter } from "./routes/appointment.routes";
import { authRouter } from "./routes/auth.routes";
import { legalRouter } from "./routes/legal.routes";

const app = express();

app.use(express.json({ limit: "1mb" }));

app.use(
  cors({
    origin:
      env.corsOrigins.length > 0
        ? env.corsOrigins
        : true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "shreshta-backend" });
});

app.use("/", legalRouter);
app.use("/api/auth", authRouter);
app.use("/api/appointments", appointmentRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

const host = "0.0.0.0";

app.listen(env.port, host, () => {
  console.log(`✅ Shreshta API listening on http://localhost:${env.port}`);
  console.log(`📡 API accessible at http://${host}:${env.port}`);
});
