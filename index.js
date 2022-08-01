require("dotenv").config();
const express = require("express");
const cors = require("cors");

const siteStatsRoute = require("./routes/siteStatsRoute");

const PORT = process.env.PORT || 8080;

const app = express();

// Define middleware
app.use(express.json());
app.use(cors());

// Redirect routes
app.use("/api/site-stats-by", siteStatsRoute);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
