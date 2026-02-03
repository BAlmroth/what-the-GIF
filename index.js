import express from "express";

import gifRoutes from "./routes/gifs.js";
import connectDB from "./config/database.js";

const port = 4000;
const app = express();
app.use(express.json());

await connectDB();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


app.get("/", (req, res) => {
  res.send("alles gUt!");
});
app.use("/gifs", gifRoutes);
