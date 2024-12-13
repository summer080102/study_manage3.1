const express = require('express');
const db = require('../config/db');
const router = express.Router();

const BASE_PATH = '/usr/204';

// rendering timer
router.get('/', async (req, res) => {
    const userId = req.session.userId;
    console.log('User ID:', userId); // debugging

    if (!userId) {
        console.log('User not logged in, redirecting to login...');
        return res.redirect(BASE_PATH + '/user/login');
    }

    try {
        console.log('Fetching sessions...');
        const [sessionResults] = await db.promise().query(
            `SELECT * FROM study_sessions WHERE user_id = ? ORDER BY recorded_at DESC`,
            [userId]
        );
        console.log('Session Results:', sessionResults); // debugging

        const [totalResults] = await db.promise().query(
            `SELECT COALESCE(SUM(duration), 0) AS total_study_time FROM study_sessions WHERE user_id = ?`,
            [userId]
        );
        console.log('Total Results:', totalResults); // debugging

        const totalStudyTime = totalResults[0]?.total_study_time || 0;

        return res.render('timer', {
            title: 'Study Timer',
            sessions: sessionResults,
            totalStudyTime,
        });
        console.log('Rendered timer page successfully'); // debugging
    } catch (err) {
        console.error('Failed to fetch timer data:', err);
        return res.status(500).send('Internal Server Error');
    }
    return res.redirect('/timer');
});



// save study time
router.post('/save', async (req, res) => {
    const { subject, duration } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect(BASE_PATH + '/user/login');
    }

    try {
        const query = `INSERT INTO study_sessions (user_id, subject, duration) VALUES (?, ?, ?)`;
        await db.promise().query(query, [userId, subject, duration]);

        return res.status(200).send({ success: true, subject, duration, recorded_at: new Date() });
    } catch (err) {
        console.error('Failed to save session:', err);
        return res.status(500).send({ success: false, message: 'Database error' });
    }
    return res.redirect('/timer');
});

/*/ 공부 기록 삭제
router.post('/delete', (req, res) => {
    const { id } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect('/user/login'); // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    }

    const query = `DELETE FROM study_sessions WHERE id = ? AND user_id = ?`;
    db.query(query, [id, userId], (err) => {
        if (err) {
            console.error('Failed to delete study session:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/timer');
    });
}); */


// total study time
router.get('/total-study-time', (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect(BASE_PATH + '/user/login'); // 로그인하지 않은 경우
    }

    const query = `SELECT COALESCE(SUM(duration), 0) AS total_study_time FROM study_sessions WHERE user_id = ?`;
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Failed to fetch total study time:', err);
            return res.status(500).send({ success: false, message: 'Database error' });
        }

        const totalStudyTime = results[0].total_study_time;
        return res.status(200).send({ success: true, totalStudyTime });
    });
    return res.redirect(BASE_PATH + '/timer');
});


router.post('/save', (req, res) => {
    const { subject, duration } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect(BASE_PATH + '/user/login');
    }

    const query = `INSERT INTO study_sessions (user_id, subject, duration) VALUES (?, ?, ?)`;
    db.query(query, [userId, subject, duration], (err) => {
        if (err) {
            console.error('Failed to save session:', err);
            return res.status(500).send({ success: false, message: 'Database error' });
        }
        return res.status(200).send({ success: true, subject, duration, recorded_at: new Date() });
    });
    return res.redirect(BASE_PATH + '/timer');
});



module.exports = router;
