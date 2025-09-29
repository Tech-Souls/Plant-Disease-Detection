const express = require("express");
const router = express.Router();

const contactModel = require("../models/contact")

router.get("/messages/all", async (req, res) => {
    try {
        const messages = await contactModel.find().sort({ createdAt: -1 })
        res.status(200).json({ message: "Messages fetched successfully!", messages });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ message: "Something went wrong. Please try again!" });
    }
});

router.post("/message/send", async (req, res) => {
    try {
        const state = req.body
        await contactModel.create(state)

        res.status(201).json({ message: "Message sent successfully!" });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ message: "Something went wrong. Please try again!" });
    }
});

router.patch("/message/update/:id", async (req, res) => {
    try {
        const { id } = req.params
        const updatingMessage = req.body
        const updatedMessage = await contactModel.findOneAndUpdate({ _id: id }, { ...updatingMessage }, { new: true })

        res.status(202).json({ message: "Message updated successfully!", updatedMessage });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ message: "Something went wrong. Please try again!" });
    }
});

router.delete("/message/delete/:id", async (req, res) => {
    try {
        const { id } = req.params
        await contactModel.findByIdAndDelete(id)

        res.status(203).json({ message: "Message deleted successfully!" });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ message: "Something went wrong. Please try again!" });
    }
});

module.exports = router