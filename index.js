require("dotenv").config();
const express = require("express");
const cors = require("cors");

const siteStatsRoute = require("./routes/siteStatsRoute");
const userStatsRoute = require("./routes/userStatsRoute");
const tipsterRoute = require("./routes/tipsterRoute");

const PORT = process.env.PORT || 8080;

const app = express();

// Define middleware
app.use(express.json());

var allowedOrigins = ["http://localhost:3000", "https://www.sx-lab.bet"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

// Redirect routes
app.use("/api/site-stats-by", siteStatsRoute);
app.use("/api/user-stats", userStatsRoute);
app.use("/api/tipster", tipsterRoute);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
