const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photo: String,
    role: { 
        type: String, 
        enum: ['user', 'vendor', 'admin'], 
        default: 'user' 
    },
    status: {
        type: String,
        enum: ['active', 'fraud'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);