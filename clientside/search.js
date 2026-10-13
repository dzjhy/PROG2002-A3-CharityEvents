const form = document.getElementById('search-form');
const cityInput = document.getElementById('city');
const dateInput = document.getElementById('date');
const locationInput = document.getElementById('location');
const categorySelect = document.getElementById('category');
const clearButton = document.getElementById('clear-btn');
const resultsContainer = document.getElementById('search-results');

fetch('http://localhost:3000/categories')
    .then(response => response.json())
    .then(categories => {
        categories.forEach(category => {
            const option = document.createElement('option');

            option.value = category.category_id;
            option.textContent = category.category_name;

            categorySelect.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Failed to load categories:', error);
    });

form.addEventListener('submit', function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();
    const date = dateInput.value;
    const location = locationInput.value.trim();
    const category = categorySelect.value;

    const params = new URLSearchParams();

    if (city) {
        params.append('city', city);
    }

    if (date) {
        params.append('date', date);
    }

    if (location) {
        params.append('location', location);
    }

    if (category) {
        params.append('category', category);
    }

    resultsContainer.innerHTML = '<p>Searching...</p>';

    fetch(`http://localhost:3000/events/search?${params.toString()}`)
        .then(response => response.json())
        .then(events => {
            resultsContainer.innerHTML = '';

            if (events.length === 0) {
                resultsContainer.innerHTML = '<p>No matching events found.</p>';
                return;
            }

            events.forEach(event => {
                const card = document.createElement('div');

                card.innerHTML = `
    <span class="event-badge">${event.category_name}</span>

    <h3>${event.event_name}</h3>

    <p><strong>City:</strong> ${event.city}</p>
    <p><strong>Location:</strong> ${event.location}</p>
    <p><strong>Date:</strong> ${new Date(event.event_date).toLocaleDateString()}</p>

    <a class="details-link" href="event.html?id=${event.event_id}">
        View Details →
    </a>
`;

                resultsContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error(error);

            resultsContainer.innerHTML =
                '<p>Unable to search events.</p>';
        });
});

clearButton.addEventListener('click', function () {
    cityInput.value = '';
    dateInput.value = '';
    locationInput.value = '';
    categorySelect.value = '';

    resultsContainer.innerHTML =
        '<p>Filters cleared.</p>';
});