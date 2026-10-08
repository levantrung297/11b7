const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        db.serialize(() => {
            // 1. Members
            db.run(`CREATE TABLE IF NOT EXISTS members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                nickname TEXT,
                group_name TEXT NOT NULL,
                avatar_url TEXT,
                description TEXT
            )`);

            // 2. Gallery
            db.run(`CREATE TABLE IF NOT EXISTS gallery (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                image_url TEXT NOT NULL,
                category TEXT NOT NULL
            )`);

            // 3. Schedule
            db.run(`CREATE TABLE IF NOT EXISTS schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                day TEXT NOT NULL,
                period INTEGER NOT NULL,
                time TEXT,
                subject TEXT NOT NULL,
                room TEXT
            )`);

            // 4. Honors
            db.run(`CREATE TABLE IF NOT EXISTS honors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                image_url TEXT,
                badge TEXT
            )`);

            // 5. Guestbook
            db.run(`CREATE TABLE IF NOT EXISTS guestbook (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                group_name TEXT,
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // 6. Users (Admin)
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )`, (err) => {
                if (!err) {
                    // Thêm tài khoản admin mặc định nếu chưa có
                    db.get(`SELECT id FROM users WHERE username = 'admin'`, (err, row) => {
                        if (!row) {
                            const salt = bcrypt.genSaltSync(10);
                            const hash = bcrypt.hashSync('admin123', salt);
                            db.run(`INSERT INTO users (username, password) VALUES ('admin', ?)`, [hash]);
                            console.log('Tạo tài khoản admin mặc định thành công.');
                        }
                    });
                }
            });
        });
    }
});

module.exports = db;
