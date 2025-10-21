const cors = require("cors");
require('dotenv').config(); 
const corsOptions = {
  origin: process.env.FE_PORT, 
  credentials: true,               
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

module.exports = cors(corsOptions);