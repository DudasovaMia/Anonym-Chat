const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use("/uploads", express.static("uploads"));
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(bodyParser.json());

const mongoURI =
  "mongodb+srv://username:heslo@chatcluster.qkjrtbl.mongodb.net/?retryWrites=true&w=majority&appName=ChatCluster";
const dbName = "anonym";
const collectionName = "messages";
const usersCollectionName = "users";
const profileCollectionName = "profile";

let db;
let messagesCollection;
let usersCollection;
let profileCollection;

MongoClient.connect(mongoURI, { useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to MongoDB");
    db = client.db(dbName);
    messagesCollection = db.collection(collectionName);
    usersCollection = db.collection(usersCollectionName);
    profileCollection = db.collection(profileCollectionName);
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, "your_secret_key", (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = user;
    next();
  });
};

io.on("connection", (socket) => {
  console.log("New client connected");

  if (!messagesCollection) {
    console.error("Error: messagesCollection is not initialized");
    socket.emit("error", "Server error");
    socket.disconnect(true);
    return;
  }

  messagesCollection.find().toArray((err, messages) => {
    if (err) {
      console.error("Error fetching messages from MongoDB:", err);
      socket.emit("error", "Server error");
      socket.disconnect(true);
      return;
    }
    socket.emit("messageHistory", messages);
  });

  socket.on("message", (message) => {
    console.log("New message:", message);

    messagesCollection
      .insertOne({
        from: message.logged,
        to: message.selected || "chatter",
        text: message.text,
        timestamp: new Date(),
      })
      .then((result) => {
        console.log("Message inserted successfully:", result);

        io.emit("message", {
          from: message.logged,
          to: message.selected || "chatter",
          text: message.text,
          timestamp: new Date(),
        });
      })
      .catch((err) => {
        console.error("Error saving message to MongoDB:", err);

        socket.emit("error", "Server error occurred while saving message.");
      });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.post("/register", async (req, res) => {
  const { username, password, userType } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username, password are required." });
  }

  try {
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userData = {
      username,
      password: hashedPassword,
      userType: userType || "user",
      status: "done"
    };

    const result = await usersCollection.insertOne(userData);
    console.log(
      `Inserted ${result.insertedCount} document into the users collection.`
    );

    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    console.error("Error inserting user into the database:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const token = jwt.sign({ username: user.username }, "your_secret_key", {
      expiresIn: "1h",
    });

    res.status(200).json({ token, userId: user._id, username: user.username });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await usersCollection.find({}).toArray();

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.get("/userType/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const { userType } = user;
    res.status(200).json({ userType });
  } catch (error) {
    console.error("Error fetching user type:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.get("/status/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const { status } = user;
    res.status(200).json({ status });
  } catch (error) {
    console.error("Error fetching user type:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.put("/user/status/:username", async (req, res) => {
  const { username } = req.params;

  try {
    // Update user status to "done"
    const result = await usersCollection.updateOne(
      { username },
      { $set: { status: "done" } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User status updated successfully." });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.put("/users/status/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const result = await usersCollection.updateOne(
      { username },
      { $set: { status: "active" } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User status updated successfully." });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.get("/profile", async (req, res) => {
  try {
    const profile = await profileCollection.find({}).toArray();
    res.status(200).json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.get("/messages", async (req, res) => {
  const { loggedId, selectedId } = req.query;

  try {
    const messages = await messagesCollection
      .find({
        from: loggedId,
        to: selectedId,
      })
      .toArray();
    const messages2 = await messagesCollection
      .find({
        from: selectedId,
        to: loggedId,
      })
      .toArray();

    res.status(200).json({ messages: [...messages, ...messages2] });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
