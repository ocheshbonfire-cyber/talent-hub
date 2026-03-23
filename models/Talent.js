const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['image', 'video', 'audio'],
        required: true
    },
    url: {
        type: String,
        required: true
    },
    filename: String,
    size: Number
});

const TalentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Development', 'Design', 'Music', 'Writing', 'Marketing', 'Coaching', 'Art', 'Photography', 'Other']
    },
    skill: {
        type: String,
        required: [true, 'Please provide a talent title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    bio: {
        type: String,
        required: [true, 'Please provide a description'],
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email']
    },
    social: {
        type: String,
        default: ''
    },
    media: [MediaSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Talent', TalentSchema);