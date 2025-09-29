const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

const authModel = require("../models/auth");
const verifyToken = require("../middlewares/auth")

router.post("/create-user", async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        const existingUser = await authModel.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or email already exists!" });
        }

        const userID = uuidv4().replace(/-/g, "").slice(0, 8);
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            userID,
            username,
            email,
            password: hashedPassword,
            role: role || "user",
        }

        const user = await authModel.create(newUser)

        res.status(201).json({ message: "User created successfully!", user });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body

        const user = await authModel.findOne({ username })
        if (!user) {
            return res.status(404).json({ message: 'Invalid username    !' })
        }

        const matchedPassword = await bcrypt.compare(password, user.password)

        if (matchedPassword) {
            const { userID } = user
            const token = jwt.sign({ userID }, "secret-key", { expiresIn: '3d' })

            res.status(200).json({ message: 'User logged in successfully!', token, user })
        }
        else {
            res.status(401).json({ message: 'Invalid username or password!' })
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message })
    }
});

router.get("/user", verifyToken, async (req, res) => {
    try {
        const userID = req.userID
        const user = await authModel.findOne({ userID })

        if (!user) {
            res.status(404).json({ message: 'User not found!' })
        }

        res.status(200).json({ message: 'User found', user })
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message })
    }
});

module.exports = router;