const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    subject: { type: String, required: true, unique: true },
    message: { type: String, required: true, unique: true },
    status: { type: String, default: 'pending' },
}, { timestamps: true });

const contactModel = mongoose.models.contact || mongoose.model('contact', contactSchema);
module.exports = contactModel;