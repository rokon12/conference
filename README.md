# Speaking Journey

A responsive web application that displays speaking engagements, including conferences, Java User Group talks, and workshops over the years.

## Project Structure

The project has been modularized for better maintainability:

```
conference/
├── css/
│   └── styles.css       # Styles for the application
├── js/
│   └── main.js          # JavaScript functionality
├── data/
│   ├── conferences.json # Speaking engagements data in JSON format
│   ├── abstracts.json   # Talk abstracts in JSON format
│   └── bio.json         # Speaker bio and social profiles
├── index.html           # Main entry point
└── README.md            # This file
```

## Features

### Core Features
- Responsive design using Tailwind CSS
- Dynamic loading of speaking engagements data from a local JSON file
- Speaker bio section with profile image and social links
- Grouping events by year
- Sorting events by date within each year
- Visual distinction between upcoming and past events
- Support for different types of links (event, slides, video)
- Talk abstracts with expandable/collapsible sections

### Enhanced Features
- **Search Functionality**: Search events by name, location, talk title, abstract, or date
- **Filtering**: Filter events by upcoming/past events or talk/workshop type
- **Dark Mode**: Toggle between light and dark themes with system preference detection
- **Accessibility**: ARIA attributes and keyboard navigation for better accessibility
- **Back to Top Button**: Easy navigation for long pages
- **Lazy Loading**: Performance optimization for event cards
- **Analytics**: Simple event tracking for user interactions
- **Error Handling**: User-friendly error messages
- **SEO Optimization**: Meta tags and descriptive titles

## GitHub Pages Setup

To deploy this project to GitHub Pages:

1. Push this repository to GitHub
2. Go to the repository settings
3. Navigate to the "Pages" section
4. Select the branch you want to deploy (usually `main` or `master`)
5. Save the settings

GitHub Pages will automatically serve the `index.html` file as the entry point.

## Customization

### Data Customization
To customize the speaking engagements data:
1. Edit the `data/conferences.json` file
2. Follow the existing JSON structure for each event entry
3. Fields supported:
   - `name`: Event name (conference or Java User Group)
   - `date`: Date of the event
   - `location`: Location of the event
   - `eventUrl`: URL to the event website
   - `role`: Your role at the event (e.g., "Speaker", "Panelist")
   - `talkTitle`: Title of your talk or workshop
   - `type`: Type of engagement (e.g., "talk", "workshop")
   - `isUpcoming`: Boolean indicating if the event is in the future
   - `links`: Array of link objects with `type`, `url`, and `text` properties
   - `abstract`: Description of the talk (automatically added from abstracts.json)

To customize the talk abstracts:
1. Edit the `data/abstracts.json` file
2. Follow the existing JSON structure for each abstract entry
3. Fields required:
   - `talkTitle`: Must match exactly with the corresponding talk title in conferences.json
   - `abstract`: The full text description of the talk

To customize the speaker bio and social profiles:
1. Edit the `data/bio.json` file
2. Follow the existing JSON structure
3. Fields supported:
   - `name`: Speaker's full name
   - `title`: Professional title or role
   - `profileImage`: URL to the profile image
   - `bio`: Short biography text
   - `socialProfiles`: Array of social profile objects with `platform`, `url`, and `icon` properties
     - Supported icons: twitter, linkedin, github, globe (for website)

### Appearance Customization
To customize the appearance:
1. Edit the `css/styles.css` file
2. The project uses Tailwind CSS for styling, which is loaded from a CDN
3. Dark mode colors can be adjusted in the CSS variables in the `:root` selector

## Development

### Getting Started
To make changes to the project:
1. Clone the repository
2. Make your changes to the HTML, CSS, or JavaScript files
3. Test locally by opening `index.html` in a web browser
4. Push changes to GitHub to update the GitHub Pages site

### Key JavaScript Functions
- `loadSpeakingEngagements()`: Main function to load speaking engagements data and abstracts
- `displayEvents()`: Renders events to the DOM
- `searchEvents()`: Filters events based on search query (including abstracts)
- `filterEvents()`: Filters events based on category
- `createEventCard()`: Creates the HTML for an event card
- `toggleAbstract()`: Handles showing/hiding of talk abstracts
- `loadBioData()`: Loads speaker bio information from bio.json
- `displayBioSection()`: Creates and displays the bio section with social links
- `setupDarkModeToggle()`: Initializes dark mode functionality
- `setupLazyLoading()`: Sets up Intersection Observer for lazy loading
- `trackEvent()`: Simple analytics tracking

## Browser Compatibility

The application uses modern JavaScript features and APIs:
- ES6+ syntax
- Fetch API for data loading
- Intersection Observer API for lazy loading
- Local Storage API for theme preference

Compatible with all modern browsers (Chrome, Firefox, Safari, Edge).
