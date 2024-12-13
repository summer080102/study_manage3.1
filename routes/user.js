const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const router = express.Router();

const BASE_PATH = '/usr/204';

// register
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).send('Please fill in all fields.');
    }

    try {
        const emailCheckQuery = `SELECT email FROM users WHERE email = ?`;
        const [emailResults] = await db.query(emailCheckQuery, [email]);

        if (emailResults.length > 0) {
            return res.status(400).send('This email is already registered.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = `INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)`;

        await db.query(insertQuery, [first_name, last_name, email, hashedPassword]);
        return res.redirect(BASE_PATH + '/user/login');
    } catch (err) {
        console.error('Unexpected error during registration:', err);
        res.status(500).send('Internal Server Error');
    }
    return res.redirect(BASE_PATH + '/login');
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Please enter your email and password.');
    }

    try {
        const query = `SELECT * FROM users WHERE email = ?`;
        const [results] = await db.query(query, [email]);

        if (results.length > 0) {
            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                req.session.userId = user.id;
                req.session.userName = user.first_name;
                return res.redirect(BASE_PATH + '/dashboard');
            } else {
                return res.status(401).send('The password is incorrect.');
            }
        } else {
            return res.status(404).send('User not found.');
        }
    } catch (err) {
        console.error('Failed to fetch user:', err);
        return res.status(500).send('Internal Server Error');
    }
    return res.redirect('/login');
});

// login page
router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login',
        session: req.session
    });
});

// register page
router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Register',
        session: req.session
    });
});

// logout
router.get('/logout', async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Failed to destroy session:', err);
            return res.status(500).send('Internal Server Error');
        }

        res.redirect(BASE_PATH + '/user/login');
    });
});

module.exports = router;
