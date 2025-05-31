document.getElementById('currentYear').textContent = new Date().getFullYear();

// --- Configuration ---
// Path to the local JSON files
const conferencesJsonUrl = 'data/conferences.json';
const abstractsJsonUrl = 'data/abstracts.json';
const bioJsonUrl = 'data/bio.json';

// --- Global Variables ---
let allConferences = []; // Store all conferences for filtering
let abstractsData = []; // Store abstracts data
let bioData = null; // Store bio data

// --- Helper Functions ---
function getYearFromDate(dateString) {
    if (!dateString) return 'Unknown Year';
    try {
        // Attempt to handle date ranges like "October 15-17, 2025" by taking the first part
        // and ensuring the year part is correctly isolated.
        const parts = dateString.split(',');
        let yearPart = parts.pop().trim(); // Get the last part, should be the year
        let monthDayPart = parts.join(',').trim(); // Get the rest

        // If yearPart is not 4 digits, try to find it in monthDayPart (e.g. "Jan 2025")
        if (!/^\d{4}$/.test(yearPart) && monthDayPart) {
            const yearMatchInMonthDay = monthDayPart.match(/\b\d{4}\b/);
            if (yearMatchInMonthDay) {
                yearPart = yearMatchInMonthDay[0];
                // Remove the year from monthDayPart if found there
                monthDayPart = monthDayPart.replace(yearPart, '').trim();
            }
        }

        // Ensure we have a month/day part before trying to construct a date
        // If monthDayPart is empty after extracting year (e.g. date was just "2025"),
        // we can just use the year.
        if (!monthDayPart && /^\d{4}$/.test(yearPart)) {
             return yearPart;
        } else if (!monthDayPart) { // If no month/day and year is not valid, fallback
            const yearMatchGeneral = dateString.match(/\b\d{4}\b/);
            if (yearMatchGeneral) return yearMatchGeneral[0];
            return 'Unknown Year';
        }


        const parsableDateString = monthDayPart.split('-')[0].trim() + ', ' + yearPart;
        const date = new Date(parsableDateString);

        if (!isNaN(date.getFullYear())) {
            return date.getFullYear().toString();
        }
    } catch (e) {
        console.warn(`Could not parse year from date: "${dateString}"`, e);
    }
     // Last resort: try to find any 4-digit number as a year
    const yearMatch = dateString.match(/\b\d{4}\b/);
    if (yearMatch) return yearMatch[0];
    return 'Unknown Year';
}


function createLinkButton(link, isUpcoming) {
    let bgColor = 'bg-gray-500 hover:bg-gray-600';
    let iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>`; // Default link icon

    if (link.type === 'event') {
        bgColor = isUpcoming ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-teal-500 hover:bg-teal-600';
    } else if (link.type === 'slides') {
        bgColor = 'bg-green-500 hover:bg-green-600';
        // Using a presentation/slides icon
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 000-2H3zm3 2h8v1H6V5zm0 2h8v1H6V7zm0 2h5v1H6V9z" clip-rule="evenodd" /></svg>`;
    } else if (link.type === 'video') {
        bgColor = 'bg-red-500 hover:bg-red-600';
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm14.553 1.106A1 1 0 0016 8v4a1 1 0 00.553.894l2-1A1 1 0 0019 11V9a1 1 0 00-.447-.894l-2-1z" /></svg>`;
    }

    return `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="text-sm ${bgColor} text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 inline-flex items-center shadow-sm hover:shadow-md">
            ${iconSvg}
            ${link.text}
        </a>
    `;
}


function createEventCard(event) {
    const linksHtml = event.links && event.links.length > 0
        ? event.links.map(link => createLinkButton(link, event.isUpcoming)).join('')
        : '';

    const titleColor = event.isUpcoming ? 'text-indigo-700 hover:text-indigo-800' : 'text-teal-700 hover:text-teal-800';
    const statusBadgeClass = event.isUpcoming ? 'status-upcoming' : 'status-past';
    const statusText = event.isUpcoming ? 'Upcoming' : 'Past Event';

    const locationEmoji = event.locationIcon || '📍';
    const talkEmoji = event.talkIcon || (event.type === 'workshop' ? '🧪' : '🎤');
    const talkLabel = event.type === 'workshop' ? 'Workshop' : 'Talk';

    // Generate unique ID for the abstract toggle
    const abstractId = `abstract-${event.name.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substring(2, 8)}`;

    const card = document.createElement('div');
    card.className = 'bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 event-card-enter transform hover:-translate-y-1';

    card.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <span class="status-badge ${statusBadgeClass}">${statusText}</span>
            <div class="text-sm text-gray-500 whitespace-nowrap">
                🗓️ ${event.date}
            </div>
        </div>
        <div>
            <h3 class="text-2xl font-bold ${titleColor} mb-1 transition-colors">
                <a href="${event.eventUrl || '#'}" class="hover:underline" target="_blank" rel="noopener noreferrer">${event.name}</a>
            </h3>
            <p class="text-sm text-gray-600 mb-1 font-medium">${event.role || 'Attendee'}</p>
        </div>
        <p class="text-gray-700 my-3 text-sm">
            <span class="font-semibold">${locationEmoji} Location:</span> ${event.location}
        </p>
        ${event.talkTitle ? `
        <p class="bg-gray-50 p-3 rounded-md text-gray-800 mb-4 text-sm">
            <span class="font-semibold block mb-1 text-gray-600">${talkEmoji} ${talkLabel}:</span>
            "${event.talkTitle}"
        </p>
        ` : ''}
        ${event.abstract ? `
        <div class="mt-3 mb-4">
            <button class="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center focus:outline-none" 
                    onclick="toggleAbstract('${abstractId}')" 
                    aria-expanded="false" 
                    aria-controls="${abstractId}">
                <svg id="${abstractId}-icon-closed" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                </svg>
                <svg id="${abstractId}-icon-open" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 hidden" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                </svg>
                <span id="${abstractId}-text">Show Abstract</span>
            </button>
            <div id="${abstractId}" class="mt-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-md hidden">
                ${event.abstract}
            </div>
        </div>
        ` : ''}
        ${linksHtml ? `<div class="mt-4 flex flex-wrap gap-3 items-center">${linksHtml}</div>` : ''}
    `;
    requestAnimationFrame(() => {
        card.classList.add('conference-card-enter-active');
    });
    return card;
}

// --- Search and Filter Functions ---
function searchEvents(query) {
    if (!query || query.trim() === '') {
        return allConferences;
    }

    query = query.toLowerCase().trim();
    return allConferences.filter(conf => {
        return (
            (conf.name && conf.name.toLowerCase().includes(query)) ||
            (conf.location && conf.location.toLowerCase().includes(query)) ||
            (conf.talkTitle && conf.talkTitle.toLowerCase().includes(query)) ||
            (conf.role && conf.role.toLowerCase().includes(query)) ||
            (conf.date && conf.date.toLowerCase().includes(query)) ||
            (conf.abstract && conf.abstract.toLowerCase().includes(query))
        );
    });
}

function filterEvents(filter) {
    if (filter === 'all') {
        return allConferences;
    }

    return allConferences.filter(conf => {
        if (filter === 'upcoming') return conf.isUpcoming;
        if (filter === 'past') return !conf.isUpcoming;
        if (filter === 'talk') return conf.type !== 'workshop';
        if (filter === 'workshop') return conf.type === 'workshop';
        return true;
    });
}

function applySearchAndFilter() {
    const searchQuery = document.getElementById('eventSearch').value;
    const activeFilter = document.querySelector('.filter-tag.active').dataset.filter;

    let filteredEvents = filterEvents(activeFilter);
    filteredEvents = searchEvents(searchQuery).filter(conf => 
        filterEvents(activeFilter).includes(conf)
    );

    displayEvents(filteredEvents);
}

// --- UI Interaction Functions ---
function setupDarkModeToggle() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Check for saved theme preference or use the system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
        document.body.classList.add('dark-mode');
    }

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });
}

function setupBackToTop() {
    const backToTopButton = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function setupSearchAndFilter() {
    const searchInput = document.getElementById('eventSearch');
    const filterTags = document.querySelectorAll('.filter-tag');

    searchInput.addEventListener('input', applySearchAndFilter);

    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            applySearchAndFilter();
        });
    });
}

// --- Lazy Loading Implementation ---
function setupLazyLoading() {
    // Use Intersection Observer to detect when cards enter the viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the 'loaded' class to make the card visible
                entry.target.classList.add('loaded');
                // Stop observing this card once it's loaded
                observer.unobserve(entry.target);

                // Track for analytics
                trackEvent('card_viewed', { 
                    event: entry.target.dataset.eventName,
                    year: entry.target.dataset.year
                });
            }
        });
    }, {
        root: null, // Use viewport as root
        rootMargin: '0px 0px 100px 0px', // Start loading when card is 100px from viewport
        threshold: 0.1 // Trigger when 10% of the card is visible
    });

    // Observe all cards with the lazy-load class
    document.querySelectorAll('.lazy-load').forEach(card => {
        observer.observe(card);
    });
}

// --- Display Events Function ---
function displayEvents(events) {
    const mainListContainer = document.getElementById('events-main-list');

    // Group events by year
    const eventsByYear = {};
    events.forEach(event => {
        const year = getYearFromDate(event.date);
        if (!eventsByYear[year]) {
            eventsByYear[year] = [];
        }
        eventsByYear[year].push(event);
    });

    // Sort years in descending order (most recent first)
    const sortedYears = Object.keys(eventsByYear).sort((a, b) => {
        // Handle "Unknown Year" by placing it at the end
        if (a === 'Unknown Year') return 1;
        if (b === 'Unknown Year') return -1;
        return parseInt(b) - parseInt(a);
    });

    // Clear main container
    mainListContainer.innerHTML = '';

    if (sortedYears.length === 0) {
        mainListContainer.innerHTML = '<p class="text-center text-gray-500 text-lg">No matching speaking engagements found.</p>';
        return;
    }

    // Create a document fragment to improve performance
    const fragment = document.createDocumentFragment();

    sortedYears.forEach(year => {
        const yearSection = document.createElement('section');
        yearSection.className = 'year-group mb-12'; 

        const yearHeader = document.createElement('h2');
        yearHeader.className = 'year-header';
        yearHeader.textContent = year;
        yearSection.appendChild(yearHeader);

        const yearCardContainer = document.createElement('div');
        yearCardContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-6'; // Using grid for better card layout

        const eventsInYear = eventsByYear[year].sort((a, b) => {
            if (a.isUpcoming && !b.isUpcoming) return -1;
            if (!a.isUpcoming && b.isUpcoming) return 1;
            try {
                const dateA = new Date(a.date.split('-')[0].trim().split(',')[0] + ', ' + getYearFromDate(a.date));
                const dateB = new Date(b.date.split('-')[0].trim().split(',')[0] + ', ' + getYearFromDate(b.date));
                if (a.isUpcoming) return dateA - dateB; 
                return dateB - dateA; 
            } catch (e) {
                return a.name.localeCompare(b.name);
            }
        });

        eventsInYear.forEach(event => {
            const card = createEventCard(event);
            // Add lazy loading classes and data attributes
            card.classList.add('lazy-load');
            card.dataset.eventName = event.name;
            card.dataset.year = year;
            yearCardContainer.appendChild(card);
        });

        yearSection.appendChild(yearCardContainer);
        fragment.appendChild(yearSection);
    });

    // Append all content at once for better performance
    mainListContainer.appendChild(fragment);

    // Setup lazy loading after adding cards to the DOM
    setupLazyLoading();
}

// --- Generate Structured Data for Events ---
function generateStructuredData(events) {
    // Filter to only include upcoming events
    const upcomingEvents = events.filter(event => event.isUpcoming);

    // Create structured data for events
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": []
    };

    // Add each event to the structured data
    upcomingEvents.forEach((event, index) => {
        const eventData = {
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Event",
                "name": event.talkTitle || event.name,
                "description": event.abstract || `${event.role} at ${event.name}`,
                "startDate": event.date,
                "location": {
                    "@type": "Place",
                    "name": event.location
                },
                "performer": {
                    "@type": "Person",
                    "name": "Bazlur Rahman"
                }
            }
        };

        // Add URL if available
        if (event.eventUrl) {
            eventData.item.url = event.eventUrl;
        }

        structuredData.itemListElement.push(eventData);
    });

    return structuredData;
}

// --- Main Function to Load and Display Speaking Engagements ---
async function loadSpeakingEngagements() {
    const mainListContainer = document.getElementById('events-main-list');
    const loadingMessage = document.getElementById('loading-events');

    try {
        // Fetch conferences data
        const conferenceResponse = await fetch(conferencesJsonUrl);
        if (!conferenceResponse.ok) {
            throw new Error(`HTTP error! status: ${conferenceResponse.status} - Could not fetch ${conferencesJsonUrl}`);
        }
        const conferences = await conferenceResponse.json();

        if (!conferences || conferences.length === 0) {
            loadingMessage.textContent = 'No speaking engagements found.';
            loadingMessage.classList.remove('py-10'); 
            const spinner = loadingMessage.querySelector('svg');
            if(spinner) spinner.remove();
            return;
        }

        // Fetch abstracts data
        try {
            const abstractsResponse = await fetch(abstractsJsonUrl);
            if (abstractsResponse.ok) {
                abstractsData = await abstractsResponse.json();

                // Merge abstracts with conferences
                conferences.forEach(conference => {
                    const matchingAbstract = abstractsData.find(
                        abstract => abstract.talkTitle === conference.talkTitle
                    );
                    if (matchingAbstract) {
                        conference.abstract = matchingAbstract.abstract;
                    }
                });
            } else {
                console.warn(`Could not fetch abstracts: ${abstractsResponse.status}`);
            }
        } catch (abstractError) {
            console.warn('Error loading abstracts:', abstractError);
        }

        // Store conferences globally for search/filter
        allConferences = conferences;

        // Generate and update structured data
        const structuredData = generateStructuredData(allConferences);
        document.getElementById('eventStructuredData').textContent = JSON.stringify(structuredData);

        // Remove loading message
        loadingMessage.remove();

        // Display all events initially
        displayEvents(allConferences);

        // Set up UI interactions
        setupDarkModeToggle();
        setupBackToTop();
        setupSearchAndFilter();

        // Add keyboard navigation for filter tags
        const filterTags = document.querySelectorAll('.filter-tag');
        filterTags.forEach(tag => {
            tag.setAttribute('tabindex', '0');
            tag.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    tag.click();
                }
            });
        });


    } catch (error) {
        console.error('Error loading speaking engagements:', error);
        if (loadingMessage) { // Check if loadingMessage still exists
            loadingMessage.innerHTML = `<p class="text-red-500 text-center">Failed to load speaking engagements. Please check the console for errors or try again later.</p>`;
        } else { // If loadingMessage was removed, append error to main container
            mainListContainer.innerHTML = `<p class="text-red-500 text-center">Failed to load speaking engagements. Please check the console for errors or try again later.</p>`;
        }
    }
}

// --- Toggle Abstract Function ---
// Define as global function so it can be called from HTML
window.toggleAbstract = function(abstractId) {
    const abstractElement = document.getElementById(abstractId);
    const iconClosed = document.getElementById(`${abstractId}-icon-closed`);
    const iconOpen = document.getElementById(`${abstractId}-icon-open`);
    const textElement = document.getElementById(`${abstractId}-text`);

    if (abstractElement.classList.contains('hidden')) {
        // Show abstract
        abstractElement.classList.remove('hidden');
        iconClosed.classList.add('hidden');
        iconOpen.classList.remove('hidden');
        textElement.textContent = 'Hide Abstract';

        // Set aria-expanded attribute for accessibility
        abstractElement.parentElement.querySelector('button').setAttribute('aria-expanded', 'true');

        // Track event
        trackEvent('abstract_viewed', { abstractId });
    } else {
        // Hide abstract
        abstractElement.classList.add('hidden');
        iconClosed.classList.remove('hidden');
        iconOpen.classList.add('hidden');
        textElement.textContent = 'Show Abstract';

        // Set aria-expanded attribute for accessibility
        abstractElement.parentElement.querySelector('button').setAttribute('aria-expanded', 'false');
    }
};

// --- Simple Analytics ---
function trackEvent(eventName, eventData = {}) {
    // This is a simple analytics function that logs events to the console
    // In a real application, you would send this data to your analytics service
    console.log(`[Analytics] ${eventName}`, eventData);

    // You could implement a simple endpoint to collect analytics
    // Example (commented out):
    /*
    if (navigator.sendBeacon) {
        const data = new FormData();
        data.append('event', eventName);
        data.append('data', JSON.stringify(eventData));
        data.append('timestamp', new Date().toISOString());
        navigator.sendBeacon('/analytics', data);
    }
    */
}

// --- Error Handling with User Feedback ---
function showErrorMessage(message, container) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded';
    errorDiv.setAttribute('role', 'alert');

    errorDiv.innerHTML = `
        <div class="flex items-center">
            <svg class="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>${message}</p>
        </div>
        <p class="text-sm mt-2">Please try again later or contact support if the problem persists.</p>
    `;

    container.innerHTML = '';
    container.appendChild(errorDiv);

    // Track error for analytics
    trackEvent('error_displayed', { message });
}

// --- Bio Section Functions ---
async function loadBioData() {
    try {
        const response = await fetch(bioJsonUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - Could not fetch ${bioJsonUrl}`);
        }
        bioData = await response.json();
        displayBioSection();
    } catch (error) {
        console.error('Error loading bio data:', error);
    }
}

function displayBioSection() {
    if (!bioData) return;

    const bioSection = document.createElement('section');
    bioSection.className = 'bio-section bg-white rounded-xl shadow-lg p-6 mb-12 max-w-4xl mx-auto';

    // Create social profile icons HTML
    const socialIconsHtml = bioData.socialProfiles.map(profile => {
        let iconSvg = '';

        // Define SVG icons for different platforms
        switch(profile.icon) {
            case 'twitter':
                iconSvg = `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>`;
                break;
            case 'linkedin':
                iconSvg = `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>`;
                break;
            case 'github':
                iconSvg = `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>`;
                break;
            case 'globe':
                iconSvg = `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm7.931 9h-2.764a14.67 14.67 0 00-.496-2.995c.5-.239.97-.517 1.404-.826 1.116 1.048 1.886 2.447 1.856 3.821zm-7.932-8c.888 0 1.686 1.09 2.205 2.8.116.383.215.774.302 1.176-.875.07-1.78.07-2.654 0 .085-.402.185-.793.303-1.176.517-1.71 1.315-2.8 2.203-2.8zm-1.306 4.086c.436-.007.871-.007 1.306 0 .435.007.87.007 1.305 0 .12.423.214.858.3 1.301a20.602 20.602 0 01-3.212 0c.086-.443.18-.878.301-1.301zM12 20c-.887 0-1.686-1.09-2.205-2.8-.116-.383-.215-.774-.302-1.176.875-.07 1.78-.07 2.654 0-.085.402-.185.793-.303 1.176-.517 1.71-1.315 2.8-2.203 2.8zm1.304-4.086L12 15.915l-1.304-.001c-.436.007-.871.007-1.306 0-.435-.007-.87-.007-1.305 0-.12-.423-.214-.858-.3-1.301a20.602 20.602 0 013.212 0c-.086.443-.18.878-.301 1.301zm-7.39-1.001c-.03-1.374.74-2.773 1.856-3.821.434.31.904.587 1.404.826a14.67 14.67 0 00-.496 2.995H4.069zm0 2h2.764c.135 1.03.292 2.023.496 2.995-.5.239-.97.517-1.404.826-1.116-1.048-1.886-2.447-1.856-3.821zm12.261 3.821c-.434-.31-.904-.587-1.404-.826.203-.972.36-1.965.496-2.995h2.764c.03 1.374-.74 2.773-1.856 3.821zm1.092-5.821h-2.356c-.065-.962-.172-1.881-.313-2.732.72-.13 1.393-.32 2.005-.558.704.963 1.166 2.095 1.205 3.29h-.54zm-4.792-3.001c-.198-.657-.415-1.263-.648-1.802.917.19 1.76.51 2.503.95-.318.122-.646.233-.985.33-.28.169-.57.323-.87.522zm-2.632-1.802c-.233.539-.45 1.145-.648 1.802-.3-.199-.59-.353-.87-.522a10.8 10.8 0 01-.985-.33c.743-.44 1.586-.76 2.503-.95zm-3.858 1.194c.612.238 1.285.428 2.005.558-.141.851-.248 1.77-.313 2.732H4.069c.039-1.195.501-2.327 1.205-3.29z"/>
                </svg>`;
                break;
            default:
                iconSvg = `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>`;
        }

        return `
            <a href="${profile.url}" target="_blank" rel="noopener noreferrer" 
               class="social-icon-link text-gray-600 hover:text-indigo-600 transition-colors duration-300"
               aria-label="${profile.platform}">
                ${iconSvg}
            </a>
        `;
    }).join('');

    bioSection.innerHTML = `
        <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div class="w-32 h-32 md:w-48 md:h-48 flex-shrink-0">
                <picture>
                    <img src="${bioData.profileImage}" alt="${bioData.name}" 
                         width="192" height="192" loading="lazy"
                         class="w-full h-full object-cover rounded-full shadow-md"
                         onload="this.classList.add('loaded')">
                </picture>
            </div>
            <div class="flex-1">
                <div class="text-center md:text-left">
                    <h2 class="text-2xl md:text-3xl font-bold text-gray-800">${bioData.name}</h2>
                    <p class="text-indigo-600 font-medium mb-3">${bioData.title}</p>
                </div>
                <p class="text-gray-600 mb-4 text-center md:text-left">${bioData.bio}</p>
                <div class="flex justify-center md:justify-start space-x-4">
                    ${socialIconsHtml}
                </div>
            </div>
        </div>
    `;

    // Insert the bio section after the header and before the main content
    const header = document.querySelector('header');
    header.insertAdjacentElement('afterend', bioSection);
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    // Track page load
    trackEvent('page_view', { 
        page: window.location.pathname,
        referrer: document.referrer,
        screenWidth: window.innerWidth
    });

    // Load bio data
    loadBioData();

    // Load speaking engagements
    loadSpeakingEngagements();

    // Track interactions
    document.getElementById('darkModeToggle').addEventListener('click', () => {
        trackEvent('dark_mode_toggle', { 
            isDarkMode: document.body.classList.contains('dark-mode') 
        });
    });

    document.getElementById('eventSearch').addEventListener('input', () => {
        trackEvent('search_used', { 
            query: document.getElementById('eventSearch').value 
        });
    });

    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            trackEvent('filter_used', { filter: tag.dataset.filter });
        });
    });

    document.getElementById('backToTop').addEventListener('click', () => {
        trackEvent('back_to_top_used');
    });
});
