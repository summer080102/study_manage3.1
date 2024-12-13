const express = require('express');
const router = express.Router();

// rendering main page
router.get('/', (req, res) => {
    return res.render('home', { title: 'Home' });
});

module.exports = router;
