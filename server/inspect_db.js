const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('--- Connected to SQLite Database ---');

db.serialize(() => {
    db.each("SELECT * FROM Students", (err, row) => {
        if (err) {
            console.error(err);
        } else {
            console.log('------------------------------------------------');
            console.log(`ID: ${row.id}`);
            console.log(`CourseId: ${row.courseId}`);
            console.log(`Data: ${row.data}`); // Data is stored as JSON string usually, or dependent on model
        }
    });
});

db.close(() => {
    console.log('------------------------------------------------');
    console.log('--- Database Connection Closed ---');
});
