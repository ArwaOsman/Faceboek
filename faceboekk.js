require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'views' folder (including index.html)
app.use(express.static(path.join(__dirname, 'views'))); // The folder containing static assets (like index.html)

// MongoDB connection
mongoose.connect('mongodb+srv://drarwaa83:oPq24xta80tHqQW7@cluster0.nevpzwi.mongodb.net/faceboekDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Create the schema for posts
const feedSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 15 },
    message: { type: String, required: true, maxlength: 40 },
    date: { type: Date, default: Date.now }
});

const FEED = mongoose.model('FEED', feedSchema);

// GET all posts
app.get('/feed', async (req, res) => {
    try {
        const posts = await FEED.find().sort({ date: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new post
app.post('/feed', async (req, res) => {
    const { name, message } = req.body;

    if (!name || !message) {
        return res.status(400).json({ error: 'Name and Message are required' });
    }

    if (name.length > 15) {
        return res.status(400).json({ error: 'Name cannot exceed 15 characters' });
    }
    if (message.length > 40) {
        return res.status(400).json({ error: 'Message cannot exceed 40 characters' });
    }

    try {
        const newPost = new FEED({ name, message });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE a post by ID
app.delete('/feed/delete/:id', async (req, res) => {
    try {
        const post = await FEED.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Serve index.html when the root URL is accessed
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));