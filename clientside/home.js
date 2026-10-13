fetch('http://localhost:3000/events')
    .then(response => response.json())
    .then(events => {
        const eventList = document.getElementById('event-list');

        eventList.innerHTML = '';

        events.forEach(event => {
            const card = document.createElement('div');

            card.innerHTML = `
    <div class="event-card-top">
        <span class="event-badge">${event.category_name}</span>

        <div class="date-box">
            <span class="date-day">
                ${new Date(event.event_date).getDate()}
            </span>
            <span class="date-month">
                ${new Date(event.event_date)
                    .toLocaleString('en-US', { month: 'short' })
                    .toUpperCase()}
            </span>
        </div>
    </div>

    <h3>${event.event_name}</h3>

    <div class="event-meta">
        <p>📍 ${event.city}</p>
        <p>🏢 ${event.organisation_name}</p>
    </div>

    <a class="details-link" href="event.html?id=${event.event_id}">
        View Details →
    </a>
`;

            eventList.appendChild(card);
        });
    })
    .catch(error => {
        console.error(error);

        document.getElementById('event-list').innerHTML =
            '<p>Unable to load events.</p>';
    });