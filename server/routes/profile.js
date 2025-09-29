const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const User = require("../models/auth");

router.patch("/update", async (req, res) => {
    try {
        const { username, email, oldPassword, newPassword } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (oldPassword && newPassword) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Old password is incorrect" });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        if (username) user.username = username;
        if (email) user.email = email;

        await user.save();

        const { password, ...userData } = user.toObject();

        res.json({ message: "Profile updated successfully", user: userData, });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;