const express = require('express');
const db = require('../config/db');
const router = express.Router();

const BASE_PATH = '/usr/204';

// Fetch and render calendar
router.get('/', async (req, res) => {
    const { month = new Date().getMonth(), year = new Date().getFullYear() } = req.query;
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect(BASE_PATH + '/user/login');
    }

    const date = new Date(year, month, 1);
    const daysInMonth = new Date(year, parseInt(month) + 1, 0).getDate();
    const firstDayOfMonth = date.getDay();

    const query = `SELECT * FROM study_calendar WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`;

    try {
        const [results] = await db.query(query, [userId, parseInt(month) + 1, year]);
        return res.render('calendar', {
            title: 'Monthly Calendar',
            monthName: date.toLocaleString('default', { month: 'long' }),
            month: parseInt(month),
            year: parseInt(year),
            daysInMonth,
            firstDayOfMonth,
            events: results,
        });
    } catch (err) {
        console.error('Failed to fetch calendar events:', err);
        return res.status(500).send('Internal Server Error');
    }
    return res.redirect('/calendar');
});

// Add new event
router.post('/add', async (req, res) => {
    const { date, title } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(403).send('Unauthorized');
    }

    const query = `INSERT INTO study_calendar (user_id, title, date) VALUES (?, ?, ?)`;

    try {
        const [results] = await db.query(query, [userId, title, date]);
        const newEvent = {
            id: results.insertId,
            title,
            date,
        };
        return res.json(newEvent); // Return the new event as JSON
    } catch (err) {
        console.error('Failed to add event:', err);
        return res.status(500).send('Internal Server Error');
    }
    return res.redirect('/calendar');
});

// Delete event
router.post('/delete', async (req, res) => {
    const { id } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(403).send('Unauthorized');
    }

    const query = `DELETE FROM study_calendar WHERE id = ? AND user_id = ?`;

    try {
        await db.query(query, [id, userId]);
        return res.json({ success: true });
    } catch (err) {
        console.error('Failed to delete event:', err);
        return res.status(500).json({ success: false, error: 'Failed to delete event.' });
    }
    return res.redirect('/calendar');
});


// Fetch upcoming events
router.get('/upcoming', async (req, res) => {
    const query = 'SELECT * FROM vw_upcoming_events'; // vw_upcoming_events 뷰 사용

    try {
        const [results] = await db.query(query);
        return res.json(results); // JSON 형식으로 이벤트 데이터 반환
    } catch (err) {
        console.error('Failed to fetch upcoming events:', err);
        return res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
