const bcrypt = require("bcryptjs");

const users = [
  {
    name: "Swapnil",
    username: "swapnil14",
    email: "swapnil@example.com",
    password: bcrypt.hashSync("password123", 10), // Hash password before inserting
    avatar: "https://via.placeholder.com/150",
    bio: "I love coding!",
  },
  {
    name: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    password: bcrypt.hashSync("password123", 10),
    avatar: "https://via.placeholder.com/150",
    bio: "Tech enthusiast!",
  },
  {
    name: "Jane Doe",
    username: "janedoe",
    email: "jane@example.com",
    password: bcrypt.hashSync("password123", 10),
    avatar: "https://via.placeholder.com/150",
    bio: "Software Engineer",
  },
];

module.exports = users;
