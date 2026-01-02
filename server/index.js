const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { config } = require('dotenv');

const app = express();
app.use(express.json());
app.use(cors());
config();

mongoose.connect(process.env.MONGO_URI, { dbName: "pddetector", })
    .then(() => {
        console.log("Connected to MongoDB");
    }).catch((err) => {
        console.log(err);
    });

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

const authRouter = require("./routes/auth")
const usersRouter = require("./routes/users")
const profileRouter = require("./routes/profile")
const contactRouter = require("./routes/contact")
const inference = require("./routes/ai_model")
const deepseek = require("./routes/deepseek")

app.use("/auth", authRouter)
app.use("/users", usersRouter)
app.use("/profile", profileRouter)
app.use("/contact", contactRouter)
app.use("/api",inference)
app.use("/api", deepseek)