import express from "express";
import connectDB from "./config/database.js";
import gifRoutes from "./routes/gifs.js";
import gifConverterRoutes from "./routes/convert.js";

const port = 4000;
const app = express();

app.use(express.json());
app.use(express.static("public"));

await connectDB();

app.use("/gifs", gifRoutes);
app.use("/convert", gifConverterRoutes);

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
