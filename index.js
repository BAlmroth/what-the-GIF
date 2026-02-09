import express from "express";
import connectDB from "./config/database.js";
import gifRoutes from "./routes/gifs.js";
import gifConverterRoutes from "./routes/convert.js";
import path from 'path';
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
const PORT = process.env.PORT || 4000;

app.use("/gifs", gifRoutes);
app.use("/convert", gifConverterRoutes);


app.use(express.static(path.join(__dirname, "public")));

await connectDB();




app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
