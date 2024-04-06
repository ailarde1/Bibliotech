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
    console.log(response)
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

app.get("/api/books/info/title/:title", async (req, res) => {
  try {
    const { title } = req.params;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    // Open Library URL
    const openLibrarySearchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`;
    const response = await axios.get(openLibrarySearchUrl);
    
    // take the first result
    const firstResult = response.data.docs[0];
    if (!firstResult) {
      return res.status(404).json({ message: "Book not found" });
    }
    let coverUrl = "Unknown cover URL";
    if (firstResult.cover_i) {
        coverUrl = `https://covers.openlibrary.org/b/id/${firstResult.cover_i}-M.jpg`;
    } else if (firstResult.cover_edition_key || (firstResult.edition_key && firstResult.edition_key.length > 0)) {
        const olid = firstResult.cover_edition_key || firstResult.edition_key[0];
        coverUrl = `https://covers.openlibrary.org/b/olid/${olid}-M.jpg`;
    }


    const bookInfo = {
      title: firstResult.title,
      authors: firstResult.author_name ? firstResult.author_name.join(', ') : 'Unknown Author',
      publishDate: firstResult.publish_date ? firstResult.publish_date[0] : 'Unknown Publish Date',
      publisher: firstResult.publisher ? firstResult.publisher.join(', ') : 'Unknown Publisher',
      isbn: firstResult.isbn ? firstResult.isbn[0] : 'Unknown ISBN',
      numberOfPages: firstResult.number_of_pages_median || 'Unknown Page Count',
      newCoverUrl: coverUrl,
    };

    res.json(bookInfo);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Error fetching data from Open Library",
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
    const books = await Book.find({ userId: userId});
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
    readStatus,
    readFormat,
    audioLength,
    ebookPageCount,
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

    //section sees if user with isbn already exists

    const existingBook = await Book.findOne({ isbn: isbn, userId: userId });
    if (existingBook) {
      // If a book with the same ISBN for this user exists, return a conflict status (409)
      return res.status(409).send("ISBN already exists for the user");
    }


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
      readStatus,
      readFormat,
      audioLength,
      ebookPageCount,
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
