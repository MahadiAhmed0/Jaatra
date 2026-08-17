require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const placeRoutes = require("./routes/placeRoutes");
const { nestedRouter: reviewRoutes, flatRouter: reviewItemRoutes } = require("./routes/reviewRoutes");
const { nestedRouter: reportRoutes, flatRouter: reportItemRoutes } = require("./routes/reportRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

connectDB();

app.use(helmet());
app.use(cors());
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }));
app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize());

app.use("/api/auth", authRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/places/:placeId/reviews", reviewRoutes);
app.use("/api/reviews", reviewItemRoutes);
app.use("/api/reviews/:id/report", reportRoutes);
app.use("/api/reports", reportItemRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found", status: 404 });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
