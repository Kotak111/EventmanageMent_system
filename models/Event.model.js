
const mongoose = require('mongoose');


const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: Date,
        required: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    maxAttendance: {
        type: Number,
        required: true,
        min: 1,
    },
    type:{
        type:String,
        required:true
    },
    image: {
        type: String,
        required: true
    },
    cloudinary_id: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },

    RSVPs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});


// Create and export the model
const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
