const express = require('express');
const db = require('../config/db');
const router = express.Router();

const BASE_PATH = '/usr/204';

// Tasks page rendering
// Tasks page rendering
router.get('/', async (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect(BASE_PATH + '/user/login');
    }

    const query = `SELECT * FROM tasks WHERE user_id = ? ORDER BY FIELD(progress, 'Not Started', 'In Progress', 'Completed'), due_date ASC`;

    try {
        const [results] = await db.query(query, [userId]);
        return res.render('tasks', {
            title: 'Manage Tasks',
            tasks: results
        });
    } catch (err) {
        console.error('Failed to fetch tasks:', err);
        return res.status(500).send('Internal Server Error');
    }
    return res.redirect('/tasks');
});

// Add Task
router.post('/add', async (req, res) => {
    const { subject, type, due_date, progress } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect(BASE_PATH + '/user/login');
    }

    const query = `INSERT INTO tasks (user_id, subject, type, due_date, progress) VALUES (?, ?, ?, ?, ?)`;

    try {
        await db.query(query, [userId, subject, type, due_date, progress || 'Not Started']);
        return res.redirect(BASE_PATH + '/tasks');
    } catch (err) {
        console.error('Failed to add task:', err);
        return res.status(500).send('Internal Server Error');
    }
    return res.redirect('/tasks');
});

// Edit Task
// Edit Task
router.post('/edit', async (req, res) => {
    const { id, progress } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect(BASE_PATH + '/user/login');
    }

    const query = `UPDATE tasks SET progress = ? WHERE id = ? AND user_id = ?`;

    try {
        await db.query(query, [progress, id, userId]);
        return res.redirect(BASE_PATH + '/tasks');
    } catch (err) {
        console.error('Failed to update task:', err);
        return res.status(500).send('Internal Server Error');
    }
    return res.redirect('/tasks');
});

// Delete Task
router.post('/delete', async (req, res) => {
    const { id } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect(BASE_PATH + '/user/login');
    }

    const query = `DELETE FROM tasks WHERE id = ? AND user_id = ?`;

    try {
        await db.query(query, [id, userId]);
        return res.redirect(BASE_PATH + '/tasks');
    } catch (err) {
        console.error('Failed to delete task:', err);
        return res.status(500).send('Internal Server Error');
    }
    return res.redirect('/tasks');
});

module.exports = router;

