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
    hasSubtitles: {
      type: Boolean,
      default: false,
    },
    subtitleLanguage: String,
    subtitleType: {
      type: String,
      enum: ['youtube', 'custom', 'upload', 'null'],
    }
  },
  { timestamps: true }
);

const Gif = model("Gif", gifSchema);

export default Gif;
