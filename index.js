import express from "express";
import connectDB from "./config/database.js";
import gifRoutes from "./routes/gifs.js";
import gifConverterRoutes from "./routes/convert.js";
import path from 'path';
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 4000;

app.use("/gifs", gifRoutes);
app.use("/convert", gifConverterRoutes);

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

await connectDB();




app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
