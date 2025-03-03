# Acheter en France (Buy in France) 🏠

A comprehensive web application for researching and analyzing French locations, providing detailed information about cities including risks, amenities, political data, and more. Perfect for making informed decisions about where to live or invest in France.

## Features ✨

### Location Management

- Search cities by postal code with automatic city suggestions
- Save favorite destinations with GPS coordinates
- Calculate travel times and distances between saved locations
- Modern and responsive user interface
- Data persistence using localStorage

### Risk Assessment

- Natural disaster risk analysis (GeoGaspar)
- Seismic risk evaluation
- Soil pollution data
- Drinking water quality analysis (last 100 tests)

### Local Amenities

- Healthcare facilities mapping
- Commercial establishments inventory
- Educational institutions (schools, colleges, universities)
- Local associations and community organizations

### Demographics & Politics

- Detailed INSEE demographic data
- Election results:
  - 2022 Presidential elections
  - 2022 Legislative elections
  - 2024 Legislative elections
- Voter participation statistics
- Detailed election results by candidate

### Climate & Environment

- Historical weather data
- Temperature trends
- Precipitation patterns
- Climate analysis

## Technologies Used 🛠️

- Astro
- React.js
- Tailwind CSS
- Nanostores for state management
- Netlify for deployment

## Prerequisites 📋

- Node.js (version 16 or higher)
- npm or yarn

## Installation 🚀

1. Clone the repository

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:4321](http://localhost:4321)

## Usage 💡

### Basic Search

1. Enter a 5-digit French postal code in the "Code postal" field
2. Select the corresponding city from the dropdown list
3. Click "Rechercher" to view comprehensive data about the location

### Managing Favorites

1. Enter the postal code and city
2. Click "Ajouter une destination" to save to favorites
3. View saved destinations with their GPS coordinates
4. Calculate travel times between saved locations
5. Remove destinations using the delete button (×)

### Exploring Data

The application provides detailed information organized in sections:

- Duration & Distance calculations
- Risk assessments (natural, seismic, pollution)
- Water quality analysis
- Healthcare facilities
- Commercial establishments
- Educational institutions
- Local associations
- Electoral data
- INSEE demographic statistics
- Climate data

## Project Structure 📁

```
buy-in-france/
├── src/
│   ├── components/
│   │   ├── Destinations.jsx
│   │   ├── Results.jsx
│   │   ├── Search.jsx
│   │   ├── Accordions.jsx
│   │   └── ...
│   ├── services/
│   │   ├── durations.js
│   │   ├── georisks.js
│   │   ├── political.js
│   │   ├── insee.js
│   │   └── ...
│   ├── stores/
│   │   └── search.js
│   ├── data/
│   │   └── france.json
│   ├── App.jsx
│   └── main.jsx
├── public/
├── astro.config.mjs
└── package.json
```

## Contributing 🤝

Contributions are welcome! Feel free to:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
