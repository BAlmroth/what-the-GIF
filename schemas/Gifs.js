import { Schema, model } from "mongoose";

const gifSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true, // lägg till validering/säkerhet?
    },
  },
  { timestamps: true }
);

const Gif = model("Gif", gifSchema);

export default Gif;
