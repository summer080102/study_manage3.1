const express = require('express');
const db = require('../config/db');
const router = express.Router();

const BASE_PATH = '/usr/204';

// HTML rendering
router.get('/', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.redirect(BASE_PATH + '/user/login');
    }

    try {
        const [results] = await db.query(
            `SELECT * FROM timetable WHERE user_id = ? ORDER BY FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), time`,
            [userId]
        );
        return res.render('timetable', {
            title: 'Weekly Timetable',
            timetable: results,
        });
    } catch (err) {
        console.error('Failed to fetch timetable:', err);
        return res.status(500).send('Internal Server Error');
    }
    return res.redirect(BASE_PATH + '/timetable');
});

// JSON
router.get('/data', async (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const [timetable] = await db.query(
            'SELECT * FROM timetable WHERE user_id = ? ORDER BY day, time',
            [userId]
        );
        console.log('Queried timetable:', timetable); // debugging
        return res.json({ success: true, timetable : timetable });
    } catch (err) {
        console.error('Failed to fetch timetable:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add a new timetable entry
router.post('/add', async (req, res) => {
    const { day, time, subject, activity } = req.body;
    const userId = req.session.userId;

    console.log("req.session.userId == ", req.session.userId);

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        await db.query(
            `INSERT INTO timetable (user_id, day, time, subject, activity) VALUES (?, ?, ?, ?, ?)`,
            [userId, day, time, subject, activity]
        );
        const [newTimetable] = await db.query('SELECT * FROM timetable WHERE user_id = ?', [userId]);
        return res.json({ success: true, timetable: newTimetable });
    } catch (err) {
        console.error('Failed to add timetable entry:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    return res.redirect('/timetable');
});

// Delete an entry
router.post('/delete', async (req, res) => {
    const { id } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        await db.query('DELETE FROM timetable WHERE id = ? AND user_id = ?', [id, userId]);
        return res.redirect(BASE_PATH + '/timetable'); // redirect after delete
    } catch (err) {
        console.error('Failed to delete timetable entry:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    return res.redirect('/timetable');
});

// Edit an existing timetable entry
router.post('/edit', async (req, res) => {
    const { id, subject, activity } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        await db.query(
            'UPDATE timetable SET subject = ?, activity = ? WHERE id = ? AND user_id = ?',
            [subject, activity, id, userId]
        );
        const [updatedTimetable] = await db.query('SELECT * FROM timetable WHERE user_id = ?', [userId]);
        return res.json({ success: true, timetable: updatedTimetable });
    } catch (err) {
        console.error('Failed to edit timetable entry:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    return res.redirect('/timetable');
});

module.exports = router;
