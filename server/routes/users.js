const express = require("express");
const router = express.Router();

const authModel = require("../models/auth");

router.get("/all", async (req, res) => {
    try {
        const allUsers = await authModel.find().sort({ createdAt: -1 })
        res.status(200).json({ message: 'User logged in successfully!', allUsers })
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message })
    }
});

router.put("/update/:id", async (req, res) => {
    try {
        const { username, email, role } = req.body

        const updatedUser = await authModel.findByIdAndUpdate(req.params.id, { username, email, role }, { new: true })

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" })
        }

        res.status(200).json({ message: "User updated successfully", user: updatedUser })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

router.delete("/delete/:id", async (req, res) => {
    try {
        const userId = req.params.id
        const deletedUser = await authModel.findByIdAndDelete(userId)

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" })
        }

        res.status(200).json({ message: "User deleted successfully", userId })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})


module.exports = router;