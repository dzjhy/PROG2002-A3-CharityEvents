
const express = require('express');
const cors = require('cors');
const db = require('./event_db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20kb' }));

/**
 * Checks whether the API server is running.
 */
app.get('/', (req, res) => {
    res.send('Charity Events API is running.');
});

/**
 * Retrieves all active upcoming charity events.
 */
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
            console.error('Get events error:', err);

            return res.status(500).json({
                error: 'Failed to retrieve events.'
            });
        }

        return res.json(results);
    });
});

/**
 * Retrieves all event categories.
 */
app.get('/categories', (req, res) => {
    const sql = `
        SELECT *
        FROM categories
        ORDER BY category_name
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Get categories error:', err);

            return res.status(500).json({
                error: 'Failed to retrieve categories.'
            });
        }

        return res.json(results);
    });
});

/**
 * Searches events by city, date, location and category.
 *
 * Query parameters:
 * - city
 * - date
 * - location
 * - category_id
 */
app.get('/events/search', (req, res) => {
    const {
        city,
        date,
        location,
        category_id
    } = req.query;

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
        sql += ' AND DATE(events.event_date) = ?';
        values.push(date);
    }

    if (location) {
        sql += ' AND events.location LIKE ?';
        values.push(`%${location}%`);
    }

    if (category_id) {
        sql += ' AND events.category_id = ?';
        values.push(category_id);
    }

    sql += ' ORDER BY events.event_date ASC';

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Search events error:', err);

            return res.status(500).json({
                error: 'Failed to search events.'
            });
        }

        return res.json(results);
    });
});

/**
 * Retrieves the details of one charity event.
 *
 * @param {string} req.params.id - Event ID
 */
app.get('/events/:id', (req, res) => {
    const eventId = Number(req.params.id);

    if (!Number.isSafeInteger(eventId) || eventId <= 0) {
        return res.status(400).json({
            error: 'Invalid event ID.'
        });
    }

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
            console.error('Get event details error:', err);

            return res.status(500).json({
                error: 'Failed to retrieve event.'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                error: 'Event not found.'
            });
        }

        return res.json(results[0]);
    });
});

/**
 * Creates a new registration for a charity event.
 *
 * Required request body:
 * - event_id
 * - full_name
 * - email
 * - ticket_quantity
 *
 * Optional request body:
 * - phone
 *
 * @returns {Object} Registration confirmation and ID
 */
app.post('/registrations', (req, res) => {
    const {
        event_id,
        full_name,
        email,
        phone,
        ticket_quantity
    } = req.body || {};

    // Validate event ID and ticket quantity
    const eventId = Number(event_id);
    const ticketQuantity = Number(ticket_quantity);

    if (
        !Number.isSafeInteger(eventId) ||
        eventId <= 0 ||
        !Number.isSafeInteger(ticketQuantity) ||
        ticketQuantity <= 0
    ) {
        return res.status(400).json({
            error: 'Invalid event ID or ticket quantity.'
        });
    }

    // Validate participant name
    if (
        typeof full_name !== 'string' ||
        full_name.trim().length === 0 ||
        full_name.trim().length > 100
    ) {
        return res.status(400).json({
            error: 'Please enter a valid full name.'
        });
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        typeof email !== 'string' ||
        email.trim().length > 100 ||
        !emailPattern.test(email.trim())
    ) {
        return res.status(400).json({
            error: 'Please enter a valid email address.'
        });
    }

    // Validate optional phone number
    if (
        phone != null &&
        (
            typeof phone !== 'string' ||
            phone.trim().length > 30
        )
    ) {
        return res.status(400).json({
            error: 'Invalid phone number.'
        });
    }

    // Check whether the selected event is available
    const checkSql = `
        SELECT event_id
        FROM events
        WHERE event_id = ?
          AND is_active = TRUE
          AND event_date >= CURDATE()
    `;

    db.query(checkSql, [eventId], (checkErr, events) => {
        if (checkErr) {
            console.error('Check event error:', checkErr);

            return res.status(500).json({
                error: 'Failed to verify event.'
            });
        }

        if (events.length === 0) {
            return res.status(404).json({
                error: 'Event not found or registration unavailable.'
            });
        }

        // Save the registration to MySQL
        const insertSql = `
            INSERT INTO registrations (
                event_id,
                full_name,
                email,
                phone,
                ticket_quantity
            )
            VALUES (?, ?, ?, ?, ?)
        `;

        const values = [
            eventId,
            full_name.trim(),
            email.trim(),
            phone?.trim() || null,
            ticketQuantity
        ];

        db.query(insertSql, values, (insertErr, result) => {
            if (insertErr) {
                console.error('Create registration error:', insertErr);

                return res.status(500).json({
                    error: 'Failed to create registration.'
                });
            }

            return res.status(201).json({
                message: 'Registration successful.',
                registration_id: result.insertId,
                event_id: eventId
            });
        });
    });
});

/**
 * Starts the Express server.
 */
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
