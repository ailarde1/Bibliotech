const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://maxxgarris33:baCd578D7LCVAV16@cluster0.rlrwlhn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

const bookSchema = new mongoose.Schema({
  title: String,
  authors: [String],
  publishedDate: String,
  thumbnail: String,
  description: String,
  pageCount: Number,
  currentPage: Number,
  height: String,
  length: String,
  width: String,
  isbn: String,
  readStatus: {
    type: String,
    required: true,
    enum: ["read", "reading", "not read"], // Ensures only valid status set
    default: "not read", // Default value
  },
  readFormat: {
    type: String,
    required: true,
    enum: ["audio", "physical", "digital"], // Ensures only valid status set
    default: "physical", // Default value
  },
  audioLength: {
    type: Number,
    required: false, //optional
  },
  ebookPageCount: {
    type: Number,
    required: false, //optional
  },
  dateFormat: {
    type: String,
    required: true,
    enum: ["date", "year"], // Ensures only valid status set
  }, 
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  readYear: { type: Number, default: null },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
