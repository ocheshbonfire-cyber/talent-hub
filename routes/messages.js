const express = require('express');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
router.get('/conversations', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { from: req.user.name },
                { to: req.user.name }
            ]
        }).sort({ timestamp: -1 });
        
        const participants = new Set();
        messages.forEach(msg => {
            if (msg.from === req.user.name) participants.add(msg.to);
            else participants.add(msg.from);
        });
        
        const conversations = [];
        for (const participant of participants) {
            const lastMessage = await Message.findOne({
                $or: [
                    { from: req.user.name, to: participant },
                    { from: participant, to: req.user.name }
                ]
            }).sort({ timestamp: -1 });
            
            const unreadCount = await Message.countDocuments({
                from: participant,
                to: req.user.name,
                read: false
            });
            
            conversations.push({
                user: participant,
                lastMessage: lastMessage?.text || '',
                lastTime: lastMessage?.timestamp || new Date(0),
                unread: unreadCount
            });
        }
        
        conversations.sort((a, b) => b.lastTime - a.lastTime);
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/messages/:user
// @desc    Get messages between current user and another user
router.get('/:user', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { from: req.user.name, to: req.params.user },
                { from: req.params.user, to: req.user.name }
            ]
        }).sort({ timestamp: 1 });
        
        // Mark messages as read
        await Message.updateMany(
            { from: req.params.user, to: req.user.name, read: false },
            { read: true }
        );
        
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/messages
// @desc    Send a new message
router.post('/', protect, async (req, res) => {
    try {
        const { to, text } = req.body;
        
        const message = await Message.create({
            from: req.user.name,
            to,
            text,
            timestamp: new Date()
        });
        
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;