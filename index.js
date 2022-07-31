require("dotenv").config();
const express = require("express");
const cors = require("cors");

const LeaguesController = require("./controllers/LeaguesController");

const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", LeaguesController.findAll);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
