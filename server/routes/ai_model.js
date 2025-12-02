const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/predict', async (req, res) => {
    try {
        await axios.get('http://localhost:8000/isAlive');
    }
    catch (err) {
        console.log("API not Alive", err);
        return res.status(503).json({err:"Python backend not running"});
    }
    try {
        const results = await axios.post(
            'http://localhost:8000/predict',
            { image: req.body.image }
        );
        res.json(results.data);
    } catch (err) {
        console.log(err)
        res.status(500).json({error:"Model prediction failed"});
    }
});

module.exports = router;
