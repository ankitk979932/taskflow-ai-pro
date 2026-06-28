const path = require("path");
const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");

dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`TaskFlow AI Pro API running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error.message);
  process.exit(1);
});
