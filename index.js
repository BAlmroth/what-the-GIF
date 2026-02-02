import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import gifRoutes from "./routes/gifs.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("alles good!");
});

app.use("/gifs", gifRoutes);

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.DB_CONN)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(console.error);
