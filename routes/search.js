const express = require('express');
const db = require('../config/db');
const router = express.Router();

const BASE_PATH = '/usr/204';

// Search page rendering
router.get('/', async (req, res) => {
    const userId = req.session.userId; // user ID

    if (!userId) {
        return res.redirect(BASE_PATH + '/user/login'); // Redirect to the login page if the user is not logged in
    }

    try {

        const [sessions] = await db.query('SELECT * FROM timers WHERE user_id = ?', [userId]);

        // Pass the sessions data to the EJS template
        return res.render('search', {
            title: 'search',
            sessions: sessions || []
        });
    } catch (err) {
        console.error('Failed to fetch study sessions:', err);
        return res.status(500).send('Internal Server Error');
    }
    return res.redirect('/search');
});

// Search results API
router.get('/results', async (req, res) => {
    const userId = req.session.userId;
    const query = req.query.q;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required.' });
    }

    const searchQuery = `
        SELECT 'Study Sessions' AS category, subject AS details, recorded_at AS date
        FROM study_sessions WHERE user_id = ? AND subject LIKE ?
        UNION ALL
        SELECT 'Tasks' AS category, task_name AS details, due_date AS date
        FROM tasks WHERE user_id = ? AND task_name LIKE ?
        UNION ALL
        SELECT 'Calendar Events' AS category, title AS details, date AS date
        FROM study_calendar WHERE user_id = ? AND title LIKE ?
        UNION ALL
        SELECT 'Timetable' AS category, subject AS details, CONCAT(day, ' ', time) AS date
        FROM timetable WHERE user_id = ? AND subject LIKE ?
        UNION ALL
        SELECT 'Timers' AS category, subject AS details, CONCAT(duration, ' seconds') AS date
        FROM timers WHERE user_id = ? AND subject LIKE ?;
    `;

    const params = Array(5).fill([userId, `%${query}%`]).flat();

    try {
        const [results] = await db.query(searchQuery, params);
        return res.json(results);
        console.log()
    } catch (err) {
        console.error('Search query failed:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    return res.redirect('/search');
});

module.exports = router;
