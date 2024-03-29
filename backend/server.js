require("dotenv").config(); //needed for using .env
const express = require("express");
const axios = require("axios");
const app = express();
const Book = require("../models/Book"); // Import Book model
const User = require("../models/User"); // Import the User model
const cors = require("cors");
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

//Search endpoint. Currently for Google Api.
app.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }
    const googleBooksApiUrl = process.env.GOOGLE_BOOKS_API_URL;
    const response = await axios.get(
      `${googleBooksApiUrl}?q=${encodeURIComponent(query)}`
    );
    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching data from Google Books API",
        error: error.toString(),
      });
  }
});

//Get books endpoint
app.get("/api/books", async (req, res) => {
  const username = req.query.username;

  //checks if valid username, finds corresponding userId
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const userId = user._id;

    // with userId finds all books with that userId
    const books = await Book.find({ userId: userId });
    res.json(books);
  } catch (error) {
    res.status(500).send("Error retrieving the user's books: " + error.message);
  }
});

//Add new book endpoint
app.post("/api/books", async (req, res) => {
  console.log("Received book data:", req.body);

  const {
    title,
    authors,
    publishedDate,
    thumbnail,
    description,
    pageCount,
    height,
    length,
    width,
    isbn,
    username,
  } = req.body;
  console.log("Received ISBN:", isbn); // Log the ISBN received
  console.log("Received username:", username); // Log the username received
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const userId = user._id;

    let book = new Book({
      title,
      authors,
      publishedDate,
      thumbnail,
      description,
      pageCount,
      height,
      length,
      width,
      isbn,
      userId,
    });

    book = await book.save();
    res.send(book);
  } catch (error) {
    res.status(500).send("Error saving the book: " + error.message);
  }
});

//Edit book endpoint
app.patch("/api/books/:isbn", async (req, res) => {
  const { isbn } = req.params;
  const { username, ...updateData } = req.body;
  console.log("Received ISBN:", isbn); // Log the ISBN received
  console.log("Received username:", username); // Log the username received
  try {
    // find the user to make sure they exist and get the userId

    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const userId = user._id;

    // find the book by ISBN and userId and update it with the new details
    let book = await Book.findOneAndUpdate(
      { isbn, userId },
      { $set: updateData },
      { new: true } // option returns the document after update was applied
    );

    if (!book) {
      return res.status(404).send("Book not found");
    }

    res.send(book);
  } catch (error) {
    res.status(500).send("Error updating the book: " + error.message);
  }
});

//Delete book endpoint
app.delete("/api/books/:isbn", async (req, res) => {
  const { isbn } = req.params;
  const { username } = req.body;
  console.log("Received ISBN to delete:", isbn);
  console.log("Received username:", username);

  try {
    // find the user to make sure they exist
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const userId = user._id;

    // attempt to delete the book by ISBN and userId
    const deletionResult = await Book.deleteOne({ isbn, userId });

    // check if a book was actually deleted
    if (deletionResult.deletedCount === 0) {
      return res.status(404).send("Book not found or user mismatch");
    }

    res.send({ message: "Book successfully deleted" });
  } catch (error) {
    res.status(500).send("Error deleting the book: " + error.message);
  }
});

// New user Creation
app.post("/api/new-user", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    let user = await User.findOne({ username });

    if (user) {
      return res.status(409).json({ message: "Username Exists" });
    } else {
      user = new User({ username });
      await user.save();
      res
        .status(201)
        .json({ message: "User created and logged in", user: user });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error during registration process",
        error: error.toString(),
      });
  }
});

//User login
app.post("/api/login", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    let user = await User.findOne({ username });

    if (user) {
      res.status(200).json({ message: "Username Exists", user: user });
    } else {
      res.status(404).json({ message: "Username Not Found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during login process", error: error.toString() });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));