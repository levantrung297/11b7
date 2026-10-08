const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: '11b7-secret-key-super-secure',
    resave: false,
    saveUninitialized: false
}));

// Middleware to check admin auth
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

// --- PUBLIC ROUTES ---
app.get('/', (req, res) => {
    const data = {};
    
    // Fetch all required data using Promises to avoid callback hell
    const getMembers = new Promise((resolve) => db.all("SELECT * FROM members", [], (err, rows) => resolve(rows || [])));
    const getGallery = new Promise((resolve) => db.all("SELECT * FROM gallery ORDER BY id DESC", [], (err, rows) => resolve(rows || [])));
    const getSchedule = new Promise((resolve) => db.all("SELECT * FROM schedule ORDER BY day, period", [], (err, rows) => resolve(rows || [])));
    const getHonors = new Promise((resolve) => db.all("SELECT * FROM honors", [], (err, rows) => resolve(rows || [])));
    const getGuestbook = new Promise((resolve) => db.all("SELECT * FROM guestbook ORDER BY created_at DESC", [], (err, rows) => resolve(rows || [])));

    Promise.all([getMembers, getGallery, getSchedule, getHonors, getGuestbook]).then(results => {
        data.members = results[0];
        data.gallery = results[1];
        data.schedule = results[2];
        data.honors = results[3];
        data.guestbook = results[4];
        
        res.render('index', { data });
    });
});

app.post('/guestbook', (req, res) => {
    const { gbName, gbGroup, gbMessage } = req.body;
    if (gbName && gbMessage) {
        db.run(`INSERT INTO guestbook (name, group_name, message) VALUES (?, ?, ?)`, [gbName, gbGroup, gbMessage], (err) => {
            res.redirect('/#guestbook');
        });
    } else {
        res.redirect('/#guestbook');
    }
});

// --- ADMIN ROUTES ---
app.get('/admin/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.userId = user.id;
            res.redirect('/admin');
        } else {
            res.render('login', { error: 'Tài khoản hoặc mật khẩu không đúng!' });
        }
    });
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

app.get('/admin', requireAuth, (req, res) => {
    const data = {};
    const getMembers = new Promise((resolve) => db.all("SELECT * FROM members", [], (err, rows) => resolve(rows || [])));
    const getGallery = new Promise((resolve) => db.all("SELECT * FROM gallery", [], (err, rows) => resolve(rows || [])));
    const getSchedule = new Promise((resolve) => db.all("SELECT * FROM schedule", [], (err, rows) => resolve(rows || [])));
    const getHonors = new Promise((resolve) => db.all("SELECT * FROM honors", [], (err, rows) => resolve(rows || [])));
    const getGuestbook = new Promise((resolve) => db.all("SELECT * FROM guestbook", [], (err, rows) => resolve(rows || [])));

    Promise.all([getMembers, getGallery, getSchedule, getHonors, getGuestbook]).then(results => {
        data.members = results[0];
        data.gallery = results[1];
        data.schedule = results[2];
        data.honors = results[3];
        data.guestbook = results[4];
        
        res.render('admin', { data });
    });
});

// Admin - Members CRUD
app.post('/admin/members/add', requireAuth, (req, res) => {
    const { name, nickname, group_name, avatar_url, description } = req.body;
    db.run("INSERT INTO members (name, nickname, group_name, avatar_url, description) VALUES (?, ?, ?, ?, ?)", [name, nickname, group_name, avatar_url, description], () => {
        res.redirect('/admin#members');
    });
});
app.post('/admin/members/delete/:id', requireAuth, (req, res) => {
    db.run("DELETE FROM members WHERE id = ?", [req.params.id], () => {
        res.redirect('/admin#members');
    });
});

// Admin - Gallery CRUD
app.post('/admin/gallery/add', requireAuth, (req, res) => {
    const { title, image_url, category } = req.body;
    db.run("INSERT INTO gallery (title, image_url, category) VALUES (?, ?, ?)", [title, image_url, category], () => {
        res.redirect('/admin#gallery');
    });
});
app.post('/admin/gallery/delete/:id', requireAuth, (req, res) => {
    db.run("DELETE FROM gallery WHERE id = ?", [req.params.id], () => {
        res.redirect('/admin#gallery');
    });
});

// Admin - Schedule CRUD
app.post('/admin/schedule/add', requireAuth, (req, res) => {
    const { day, period, time, subject, room } = req.body;
    db.run("INSERT INTO schedule (day, period, time, subject, room) VALUES (?, ?, ?, ?, ?)", [day, period, time, subject, room], () => {
        res.redirect('/admin#schedule');
    });
});
app.post('/admin/schedule/delete/:id', requireAuth, (req, res) => {
    db.run("DELETE FROM schedule WHERE id = ?", [req.params.id], () => {
        res.redirect('/admin#schedule');
    });
});

// Admin - Honors CRUD
app.post('/admin/honors/add', requireAuth, (req, res) => {
    const { name, title, description, image_url, badge } = req.body;
    db.run("INSERT INTO honors (name, title, description, image_url, badge) VALUES (?, ?, ?, ?, ?)", [name, title, description, image_url, badge], () => {
        res.redirect('/admin#honors');
    });
});
app.post('/admin/honors/delete/:id', requireAuth, (req, res) => {
    db.run("DELETE FROM honors WHERE id = ?", [req.params.id], () => {
        res.redirect('/admin#honors');
    });
});

// Admin - Guestbook CRUD
app.post('/admin/guestbook/delete/:id', requireAuth, (req, res) => {
    db.run("DELETE FROM guestbook WHERE id = ?", [req.params.id], () => {
        res.redirect('/admin#guestbook');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
