const mongoose = require('mongoose');

const mongooseData = new mongoose.Schema({

    userID: { type: String, required: true, unique: true },
    username: { type: String, default: '' },
    balance: { type: Number, default: 0 },
    
})

module.exports = { mongooseData };