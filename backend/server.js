require("dotenv").config(); //needed for using .env
const express = require("express");
const axios = require("axios");
const app = express();
const Book = require("../models/Book"); // Import Book model
const User = require("../models/User"); // Import the User model
const bcrypt = require("bcrypt");
const saltRounds = 10;
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const { Upload } = require("@aws-sdk/lib-storage");

const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const { Readable } = require("stream");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use(express.json()); 

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  console.log("upload request sent");
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const fileStream = Readable.from(req.file.buffer);
  const fileKey = req.file.originalname;

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileKey,
    Body: fileStream,
  };

  try {
    const parallelUploads3 = new Upload({
      client: s3Client,
      params: uploadParams,
    });

    parallelUploads3.on("httpUploadProgress", (progress) => {
      console.log(progress); // Log upload progress
    });

    await parallelUploads3.done();

    // Construct URL of the uploaded file
    const uploadedFileUrl = `https://${uploadParams.Bucket}.s3.${
      process.env.AWS_REGION
    }.amazonaws.com/${encodeURIComponent(uploadParams.Key)}`;

    console.log("File uploaded successfully:", uploadedFileUrl);
    res.status(200).json({ message: "File uploaded", url: uploadedFileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to upload file");
  }
});

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
    //console.log(response);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
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
    const openLibrarySearchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(
      title
    )}`;
    const response = await axios.get(openLibrarySearchUrl);

    // take the first result
    const firstResult = response.data.docs[0];
    if (!firstResult) {
      return res.status(404).json({ message: "Book not found" });
    }
    let coverUrl = "Unknown cover URL";
    if (firstResult.cover_i) {
      coverUrl = `https://covers.openlibrary.org/b/id/${firstResult.cover_i}-M.jpg`;
    } else if (
      firstResult.cover_edition_key ||
      (firstResult.edition_key && firstResult.edition_key.length > 0)
    ) {
      const olid = firstResult.cover_edition_key || firstResult.edition_key[0];
      coverUrl = `https://covers.openlibrary.org/b/olid/${olid}-M.jpg`;
    }

    const bookInfo = {
      title: firstResult.title,
      authors: firstResult.author_name
        ? firstResult.author_name.join(", ")
        : "Unknown Author",
      publishDate: firstResult.publish_date
        ? firstResult.publish_date[0]
        : "Unknown Publish Date",
      publisher: firstResult.publisher
        ? firstResult.publisher.join(", ")
        : "Unknown Publisher",
      isbn: firstResult.isbn ? firstResult.isbn[0] : "Unknown ISBN",
      numberOfPages: firstResult.number_of_pages_median || "Unknown Page Count",
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
    const books = await Book.find({ userId: userId });
    res.json(books);
  } catch (error) {
    res.status(500).send("Error retrieving the user's books: " + error.message);
  }
});

app.get("/api/userinfo", async (req, res) => {
  const username = req.query.username; // Receive username from query parameters

  try {
    // Find user by username
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userInfo = {
      username: user.username,
      imageUrl: user.imageUrl,
      // Add other fields as necessary
    };

    res.json(userInfo); // Valid JSON response
  } catch (error) {
    res.status(500).json({
      error: "Error retrieving user information",
      message: error.message,
    });
  }
});

//Add new book endpoint
app.post("/api/books", async (req, res) => {
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
    startDate,
    endDate,
    readYear,
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

    const fixedEndDate = readStatus === "reading" ? null : endDate ? new Date(endDate) : null;

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
      startDate: startDate ? new Date(startDate) : null,
      endDate: fixedEndDate,
      readYear: readYear || null,
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
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Both Username and password are required" });
    }

    let user = await User.findOne({ username });

    if (user) {
      return res.status(409).json({ message: "Username already exists" });
    } else {
      user = new User({ username, password });
      await user.save();
      res.status(201).json({
        message: "User created and logged in",
        user: { username: user.username },
      }); // send username only back
    }
  } catch (error) {
    res.status(500).json({
      message: "Error during new user creation",
      error: error.toString(),
    });
  }
});

app.patch("/api/userinfo", async (req, res) => {
  const { currentUsername, newUsername, imageUrl } = req.body;

  try {
    // Find the current user by their username
    const user = await User.findOne({ username: currentUsername });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check if the new username is already in use
    if (newUsername && newUsername !== currentUsername) {
      const usernameExists = await User.findOne({ username: newUsername });
      if (usernameExists) {
        return res.status(409).json({ message: "Username already taken" });
      }
      user.username = newUsername; // Update the username
    }

    // Update imageUrl if provided
    if (imageUrl) {
      user.imageUrl = imageUrl;
    }

    await user.save();
    res.status(200).json({ message: "User updated successfully", user: user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user info", error: error.toString() });
  }
});

//User login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Both username and password are required" });
    }

    let user = await User.findOne({ username });
    if (user) {
      // Compares submitted password with hash that is stored
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        res.status(200).json({ message: "Login successful", user: user });
      } else {
        res.status(401).json({ message: "Incorrect Credentials" });
      }
    } else {
      res.status(404).json({ message: "Username not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during login process", error: error.toString() });
  }
});

app.get("/api/reading", async (req, res) => {
  const username = req.query.username;

  try {
    // Checks if valid username, finds corresponding userId
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const userId = user._id;
    
    // Finds all books with that userId where readStatus is 'reading'
    const books = await Book.find({ userId: userId, readStatus: 'reading' });
    res.json(books);
  } catch (error) {
    res.status(500).send("Error retrieving the user's books: " + error.message);
  }
});

app.patch("/api/updatePage", async (req, res) => {
  const { bookId, currentPage } = req.body;
  const pagesInt = parseInt(currentPage, 10);

  if (!bookId || isNaN(pagesInt)) {
    return res.status(400).json({ message: "Book ID and current page must be provided and current page must be a number" });
  }

  try {
    
    const book = await Book.findByIdAndUpdate(bookId, { currentPage: pagesInt }, { new: true });
    
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Page updated successfully", book: book });
  } catch (error) {
    console.error("Error updating page:", error);
    res.status(500).json({ message: "Failed to update the page", error: error.toString() });
  }
});



app.get("/api/friends", async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username }).populate('friends', 'username imageUrl');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ friends: user.friends });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving friends", error: error.toString() });
  }
});

app.get("/api/friends/requests", async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username }).populate('requestsReceived', 'username imageUrl');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ requests: user.requestsReceived });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving friend requests", error: error.toString() });
  }
});

app.post("/api/friends/accept", async (req, res) => {
  const { username, requesterId } = req.body;

  try {
    const user = await User.findOne({ username });
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ message: "User not found" });
    }

    user.friends.push(requester._id);
    user.requestsReceived.pull(requester._id);
    requester.friends.push(user._id);
    requester.requestsSent.pull(user._id);

    await user.save();
    await requester.save();

    res.json({ message: "Friend request accepted", friend: { username: requester.username, imageUrl: requester.imageUrl } });
  } catch (error) {
    res.status(500).json({ message: "Error accepting friend request", error: error.toString() });
  }
});

app.post("/api/friends/decline", async (req, res) => {
  const { username, requesterId } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.requestsReceived.pull(requesterId);
    await user.save();

    res.json({ message: "Friend request declined" });
  } catch (error) {
    res.status(500).json({ message: "Error declining friend request", error: error.toString() });
  }
});

app.get("/api/users/search", async (req, res) => {
  const { search } = req.query;

  try {
    const users = await User.find({ username: new RegExp(search, 'i') }).select('username imageUrl');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error searching for users", error: error.toString() });
  }
});

app.post("/api/friends/send-request", async (req, res) => {
  const { fromUsername, toUsername } = req.body;

  try {
    const fromUser = await User.findOne({ username: fromUsername });
    const toUser = await User.findOne({ username: toUsername });

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "One or both users not found" });
    }

    if (toUser.requestsReceived.includes(fromUser._id) || fromUser.friends.includes(toUser._id)) {
      return res.status(409).json({ message: "Request already sent or users are already friends" });
    }

    toUser.requestsReceived.push(fromUser._id);
    fromUser.requestsSent.push(toUser._id);

    await toUser.save();
    await fromUser.save();

    res.status(200).json({ message: "friend request sent successfully", recipient: { username: toUser.username, imageUrl: toUser.imageUrl } });
  } catch (error) {
    res.status(500).json({ message: "Error sending friend request", error: error.toString() });
  }
}); 





app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
