

import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/index.js";
import {app} from "./app.js";

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Server startup failed:",
      error
    );

    process.exit(1);
  }
};

startServer();