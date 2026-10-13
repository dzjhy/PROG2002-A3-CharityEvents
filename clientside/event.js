const params = new URLSearchParams(window.location.search);
const eventId = params.get('id');

const detailContainer = document.getElementById('event-detail');

if (!eventId) {
    detailContainer.innerHTML = '<p>Event ID is missing.</p>';
} else {
    fetch(`http://localhost:3000/events/${eventId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Event not found');
            }

            return response.json();
        })
        .then(event => {
            detailContainer.innerHTML = `
                <h1>${event.event_name}</h1>

                <p><strong>Category:</strong> ${event.category_name}</p>
                <p><strong>Organisation:</strong> ${event.organisation_name}</p>
                <p><strong>Date:</strong> ${new Date(event.event_date).toLocaleDateString()}</p>
                <p><strong>City:</strong> ${event.city}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Price:</strong> $${event.price}</p>

                <h2>About this event</h2>
                <p>${event.description}</p>

                <button id="register-btn">Register</button>
            `;

            document
                .getElementById('register-btn')
                .addEventListener('click', function () {
                    alert('This feature is currently under construction.');
                });
        })
        .catch(error => {
            console.error(error);

            detailContainer.innerHTML =
                '<p>Unable to load event details.</p>';
        });
}