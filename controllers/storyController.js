const Story = require('../models/story');


exports.createStory = async (req, res) => {
    try {
        const { title, content, author } = req.body;
        const story = await Story.create({ title, content, author });
        res.status(201).json({ success: true, data: story });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.getActiveStories = async (req, res) => {
    try {
        const stories = await Story.find({ isActive: true }).sort({ createdAt: -1 });
        res.json({ success: true, data: stories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.getStoryById = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story || !story.isActive) {
            return res.status(404).json({ success: false, message: "Story not found" });
        }
        res.json({ success: true, data: story });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.deleteStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story || !story.isActive) {
            return res.status(404).json({ success: false, message: "Story not found" });
        }
        story.isActive = false;
        await story.save();
        res.json({ success: true, message: "Story deleted (soft delete)" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
