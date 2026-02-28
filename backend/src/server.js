// src/server.js

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js"
import collegeRoutes from "./routes/college.routes.js";


const app = express();

app.use(
  cors()
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK ALL WORKING FINE" });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/colleges", collegeRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});