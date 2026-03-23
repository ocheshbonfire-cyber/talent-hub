const express = require('express');
const Talent = require('../models/Talent');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/talents
// @desc    Get all talents
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let filter = {};
        
        if (category && category !== 'all') {
            filter.category = category;
        }
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { skill: { $regex: search, $options: 'i' } },
                { bio: { $regex: search, $options: 'i' } }
            ];
        }
        
        const talents = await Talent.find(filter).sort({ createdAt: -1 });
        res.json(talents);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/talents/user/:name
// @desc    Get talents by user name
router.get('/user/:name', async (req, res) => {
    try {
        const talents = await Talent.find({ name: req.params.name }).sort({ createdAt: -1 });
        res.json(talents);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/talents/users/unique
// @desc    Get unique users with their talents
router.get('/users/unique', async (req, res) => {
    try {
        const talents = await Talent.find().sort({ createdAt: -1 });
        const uniqueUsers = [];
        const seenNames = new Set();
        
        for (const talent of talents) {
            if (!seenNames.has(talent.name)) {
                seenNames.add(talent.name);
                const userTalents = await Talent.find({ name: talent.name });
                uniqueUsers.push({
                    name: talent.name,
                    category: talent.category,
                    skill: talent.skill,
                    bio: talent.bio,
                    email: talent.email,
                    talentCount: userTalents.length
                });
            }
        }
        
        res.json(uniqueUsers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/talents
// @desc    Create a new talent
router.post('/', protect, async (req, res) => {
    try {
        const talent = await Talent.create({
            ...req.body,
            userId: req.user._id
        });
        res.status(201).json(talent);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/talents/:id
// @desc    Delete a talent
router.delete('/:id', protect, async (req, res) => {
    try {
        const talent = await Talent.findById(req.params.id);
        
        if (!talent) {
            return res.status(404).json({ message: 'Talent not found' });
        }
        
        // Check if user owns the talent
        if (talent.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        await talent.deleteOne();
        res.json({ message: 'Talent removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;