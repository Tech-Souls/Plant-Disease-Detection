const mongoose = require('mongoose');
const { Schema } = mongoose;

const authSchema = new Schema({
    userID: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'user' },
}, { timestamps: true });

const authModel = mongoose.models.auth || mongoose.model('auth', authSchema);
module.exports = authModel;