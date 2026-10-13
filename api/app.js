const express = require('express');
const cors = require('cors');
const db = require('./event_db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Charity Events API is running.');
});

const PORT = 3000;

app.get('/events', (req, res) => {
    const sql = `
        SELECT 
            events.*,
            categories.category_name,
            organisations.name AS organisation_name
        FROM events
        JOIN categories
            ON events.category_id = categories.category_id
        JOIN organisations
            ON events.organisation_id = organisations.organisation_id
        WHERE events.is_active = TRUE
          AND events.event_date >= CURDATE()
        ORDER BY events.event_date ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({
                error: 'Failed to retrieve events.'
            });
            return;
        }

        res.json(results);
    });
});

app.get('/categories', (req, res) => {
    const sql = 'SELECT * FROM categories ORDER BY category_name';

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to retrieve categories.' });
            return;
        }

        res.json(results);
    });
});

app.get('/events/search', (req, res) => {
    const { city, date, location, category } = req.query;

    let sql = `
        SELECT 
            events.*,
            categories.category_name,
            organisations.name AS organisation_name
        FROM events
        JOIN categories
            ON events.category_id = categories.category_id
        JOIN organisations
            ON events.organisation_id = organisations.organisation_id
        WHERE 1 = 1
    `;

    const values = [];

    if (city) {
        sql += ' AND events.city = ?';
        values.push(city);
    }

    if (date) {
        sql += ' AND events.event_date = ?';
        values.push(date);
    }

    if (location) {
        sql += ' AND events.location LIKE ?';
        values.push(`%${location}%`);
    }

    if (category) {
        sql += ' AND events.category_id = ?';
        values.push(category);
    }

    sql += ' ORDER BY events.event_date ASC';

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to search events.' });
            return;
        }

        res.json(results);
    });
});

app.get('/events/:id', (req, res) => {
    const eventId = req.params.id;

    const sql = `
        SELECT 
            events.*,
            categories.category_name,
            organisations.name AS organisation_name
        FROM events
        JOIN categories
            ON events.category_id = categories.category_id
        JOIN organisations
            ON events.organisation_id = organisations.organisation_id
        WHERE events.event_id = ?
    `;

    db.query(sql, [eventId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to retrieve event.' });
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ error: 'Event not found.' });
            return;
        }

        res.json(results[0]);
    });
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});