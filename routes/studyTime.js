const express = require('express');
const db = require('../config/db');
const router = express.Router();

const BASE_PATH = '/usr/204';

// rendering Study Timer page
router.get('/', async (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect(BASE_PATH + '/user/login'); // Redirect to the login page if the user is not logged in
    }

    try {

        const [sessions] = await db.query('SELECT * FROM timers WHERE user_id = ?', [userId]);


        return res.render('studyTime', {
            title: 'Study Timer',
            sessions: sessions || []
        });
    } catch (err) {
        console.error('Failed to fetch study sessions:', err);
        return res.status(500).send('Internal Server Error');
    }
});

// total study time
router.get('/total-study-time/:userId', async (req, res) => {
    const userId = req.params.userId;

    console.log("Received request for total study time, userId:", userId);

    try {
        const [rows] = await db.query('SELECT COALESCE(SUM(duration), 0) AS total_study_time FROM timers WHERE user_id = ?', [userId]);

        if (!rows || rows.length === 0) {
            console.log("No study time found for userId:", userId);
            return res.status(404).json({ success: false, message: 'No study time data found' });
        }

        const totalStudyTime = rows[0].total_study_time;
        console.log("Total study time for userId:", userId, "is:", totalStudyTime);

        return res.status(200).json({ success: true, totalStudyTime });
    } catch (err) {
        console.error('Error fetching total study time for userId:', userId, err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// save study time
router.post('/save', async (req, res) => {
    const { subject, duration } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const query = `
        INSERT INTO timers (user_id, subject, duration, recorded_at)
        VALUES (?, ?, ?, NOW())
    `;

    try {
        // Execute asynchronous query
        const [result] = await db.query(query, [userId, subject, duration]);
        console.log('Study session saved:', result);

        return res.status(200).json({
            success: true,
            message: 'Session saved successfully',
            session: {
                id: result.insertId,
                subject,
                duration,
                recorded_at: new Date(),
            },
        });
    } catch (error) {
        console.error('Failed to save session:', error);
        return res.status(500).json({ success: false, message: 'Database error' });
    }
});


module.exports = router;
