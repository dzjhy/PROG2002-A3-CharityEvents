
const express = require('express');
const cors = require('cors');
const db = require('./event_db');

const app = express();
const PORT = process.env.PORT || 3000;

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
 * Validates a positive integer identifier.
 */
function validId(value) {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0;
}

/**
 * Validates and normalizes event information.
 * Returns an error message or a normalized event object.
 */
function validateEvent(body) {
    const {
        event_name,
        description,
        event_date,
        city,
        location,
        price,
        category_id,
        organisation_id,
        is_active
    } = body || {};

    const validText = (value, maximum) =>
        typeof value === 'string' &&
        value.trim().length > 0 &&
        value.trim().length <= maximum;

    if (!validText(event_name, 100)) {
        return { error: 'Please enter a valid event name.' };
    }

    if (!validText(city, 100)) {
        return { error: 'Please enter a valid city.' };
    }

    if (!validText(location, 150)) {
        return { error: 'Please enter a valid location.' };
    }

    if (
        description != null &&
        typeof description !== 'string'
    ) {
        return { error: 'Invalid description.' };
    }

    // Validate date format and actual calendar date.
    if (
        typeof event_date !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(event_date)
    ) {
        return { error: 'Event date must use YYYY-MM-DD.' };
    }

    const date = new Date(`${event_date}T00:00:00Z`);

    if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== event_date
    ) {
        return { error: 'Invalid event date.' };
    }

    const eventPrice = Number(price ?? 0);

    if (
        price === '' ||
        !Number.isFinite(eventPrice) ||
        eventPrice < 0 ||
        eventPrice > 99999999.99 ||
        Math.round(eventPrice * 100) !== eventPrice * 100
    ) {
        return {
            error: 'Price must be a non-negative amount with at most two decimal places.'
        };
    }

    if (!validId(category_id) || !validId(organisation_id)) {
        return {
            error: 'Valid category and organisation IDs are required.'
        };
    }

    let active = 1;

    if (is_active !== undefined) {
        if (
            is_active !== true &&
            is_active !== false &&
            is_active !== 1 &&
            is_active !== 0
        ) {
            return { error: 'Invalid active status.' };
        }

        active = Number(Boolean(is_active));
    }

    return {
        data: {
            event_name: event_name.trim(),
            description: description?.trim() || null,
            event_date,
            city: city.trim(),
            location: location.trim(),
            price: eventPrice,
            category_id: Number(category_id),
            organisation_id: Number(organisation_id),
            is_active: active
        }
    };
}

/**
 * Handles common database errors for event operations.
 */
function handleEventDatabaseError(err, res) {
    console.error('Event database error:', err);

    if (
        err.code === 'ER_NO_REFERENCED_ROW_2' ||
        err.code === 'ER_NO_REFERENCED_ROW'
    ) {
        return res.status(400).json({
            error: 'The selected category or organisation does not exist.'
        });
    }

    return res.status(500).json({
        error: 'Database operation failed.'
    });
}

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
 * Retrieves organisations for event management forms.
 */
app.get('/organisations', (req, res) => {
    db.query(
        'SELECT * FROM organisations ORDER BY name',
        (err, results) => {
            if (err) {
                console.error('Get organisations error:', err);
                return res.status(500).json({
                    error: 'Failed to retrieve organisations.'
                });
            }

            return res.json(results);
        }
    );
});

/**
 * Searches charity events using optional filters.
 */
app.get('/events/search', (req, res) => {
    const { city, date, location, category_id } = req.query;

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
 * Retrieves one charity event by its ID.
 */
app.get('/events/:id', (req, res) => {
    if (!validId(req.params.id)) {
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

    db.query(sql, [Number(req.params.id)], (err, results) => {
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
 * Creates a registration for an active upcoming event.
 */
app.post('/registrations', (req, res) => {
    const {
        event_id,
        full_name,
        email,
        phone,
        ticket_quantity
    } = req.body || {};

    const eventId = Number(event_id);
    const quantity = Number(ticket_quantity);

    if (
        !validId(event_id) ||
        !Number.isSafeInteger(quantity) ||
        quantity <= 0
    ) {
        return res.status(400).json({
            error: 'Invalid event ID or ticket quantity.'
        });
    }

    if (
        typeof full_name !== 'string' ||
        !full_name.trim() ||
        full_name.trim().length > 100
    ) {
        return res.status(400).json({
            error: 'Please enter a valid full name.'
        });
    }

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
            quantity
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
 * Retrieves registrations belonging to a specific event.
 * Most recent registrations are returned first.
 */
app.get('/events/:id/registrations', (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({
            error: 'Invalid event ID.'
        });
    }

    const sql = `
        SELECT
            registration_id,
            event_id,
            full_name,
            email,
            phone,
            ticket_quantity,
            registration_date
        FROM registrations
        WHERE event_id = ?
        ORDER BY registration_date DESC, registration_id DESC
    `;

    db.query(sql, [Number(req.params.id)], (err, results) => {
        if (err) {
            console.error('Get registrations error:', err);
            return res.status(500).json({
                error: 'Failed to retrieve registrations.'
            });
        }

        return res.json(results);
    });
});

/**
 * ADMIN READ
 * Retrieves all events, including past and inactive events.
 */
app.get('/admin/events', (req, res) => {
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
        ORDER BY events.event_id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Admin get events error:', err);
            return res.status(500).json({
                error: 'Failed to retrieve admin events.'
            });
        }

        return res.json(results);
    });
});

/**
 * ADMIN CREATE
 * Adds a new charity event to the database.
 */
app.post('/admin/events', (req, res) => {
    const validation = validateEvent(req.body);

    if (validation.error) {
        return res.status(400).json({
            error: validation.error
        });
    }

    const event = validation.data;

    const sql = `
        INSERT INTO events (
            event_name,
            description,
            event_date,
            city,
            location,
            price,
            is_active,
            category_id,
            organisation_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        event.event_name,
        event.description,
        event.event_date,
        event.city,
        event.location,
        event.price,
        event.is_active,
        event.category_id,
        event.organisation_id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            return handleEventDatabaseError(err, res);
        }

        return res.status(201).json({
            message: 'Event created successfully.',
            event_id: result.insertId
        });
    });
});

/**
 * ADMIN UPDATE
 * Updates an existing charity event.
 */
app.put('/admin/events/:id', (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({
            error: 'Invalid event ID.'
        });
    }

    const validation = validateEvent(req.body);

    if (validation.error) {
        return res.status(400).json({
            error: validation.error
        });
    }

    const event = validation.data;
    const eventId = Number(req.params.id);

    const sql = `
        UPDATE events
        SET event_name = ?,
            description = ?,
            event_date = ?,
            city = ?,
            location = ?,
            price = ?,
            is_active = ?,
            category_id = ?,
            organisation_id = ?
        WHERE event_id = ?
    `;

    const values = [
        event.event_name,
        event.description,
        event.event_date,
        event.city,
        event.location,
        event.price,
        event.is_active,
        event.category_id,
        event.organisation_id,
        eventId
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            return handleEventDatabaseError(err, res);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Event not found.'
            });
        }

        return res.json({
            message: 'Event updated successfully.',
            event_id: eventId
        });
    });
});

/**
 * ADMIN DELETE
 * Deletes an event only when it has no registrations.
 *
 * Existing foreign key constraints also prevent the deletion
 * of an event referenced by a registration.
 */
app.delete('/admin/events/:id', (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({
            error: 'Invalid event ID.'
        });
    }

    const eventId = Number(req.params.id);

    const checkSql = `
        SELECT COUNT(*) AS registration_count
        FROM registrations
        WHERE event_id = ?
    `;

    db.query(checkSql, [eventId], (checkErr, rows) => {
        if (checkErr) {
            console.error('Check registrations error:', checkErr);
            return res.status(500).json({
                error: 'Failed to check event registrations.'
            });
        }

        if (Number(rows[0].registration_count) > 0) {
            return res.status(409).json({
                error: 'This event cannot be deleted because registrations exist.'
            });
        }

        const deleteSql = `
            DELETE FROM events
            WHERE event_id = ?
        `;

        db.query(deleteSql, [eventId], (deleteErr, result) => {
            if (deleteErr) {
                if (
                    deleteErr.code === 'ER_ROW_IS_REFERENCED_2' ||
                    deleteErr.code === 'ER_ROW_IS_REFERENCED'
                ) {
                    return res.status(409).json({
                        error: 'This event has registrations and cannot be deleted.'
                    });
                }

                console.error('Delete event error:', deleteErr);
                return res.status(500).json({
                    error: 'Failed to delete event.'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Event not found.'
                });
            }

            return res.json({
                message: 'Event deleted successfully.',
                event_id: eventId
            });
        });
    });
});

/**
 * Starts the Express API server.
 */
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
