const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const db = require('./config/db'); 

const app = express();


dotenv.config();


app.set('views', path.join(__dirname, 'views')); // views 
app.set('view engine', 'ejs'); 

// 
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(
    session({
        secret: 'your_secret_key',
        resave: false,
        saveUninitialized: true,
    })
);
app.use(express.static(path.join(__dirname, 'public'))); 



app.use((req, res, next) => {
    console.log("Session Data:", req.session); 
    res.locals.session = req.session; 
    next();
});

// router
const userRouter = require('./routes/user');
const timetableRouter = require('./routes/timetable');
const tasksRouter = require('./routes/tasks');
const calendarRouter = require('./routes/calendar');
// const timerRouter = require('./routes/timer');
const studyTimeRouter = require('./routes/studyTime');


app.use('/user', userRouter);
app.use('/timetable', timetableRouter);
app.use('/tasks', tasksRouter);
app.use('/calendar', calendarRouter);
// app.use('/timer', timerRouter);
app.use('/studyTime', studyTimeRouter); // '/timer'
// app.use('/api', studyTimeRouter);   // '/api'

const searchRoutes = require('./routes/search');
app.use('/search', searchRoutes);



app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Study Management', 
        session: req.session 
    });
});

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/user/login'); 
    }

    res.render('dashboard', {
        title: 'Dashboard',
        session: req.session 
    });
});


app.get('/user/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Failed to destroy session:', err);
            return res.status(500).send('Failed to log out');
        }
        res.redirect('/user/logout-success');
    });
});


app.get('/user/logout-success', (req, res) => {
    res.render('logout-success', { title: 'Logout Successful' });
});


app.use((req, res, next) => {
    res.status(404).render('404', {
        title: 'Page Not Found',
        session: req.session 
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});