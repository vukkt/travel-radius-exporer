# Travel Radius Explorer

Travel Radius Explorer is a demo Next.js application that visualises which places you can reach from your current position. It uses the browser's geolocation API and the Leaflet mapping library. You can explore a simple "distance" mode, which plots a circle of points, or a "time" mode that provides sample recommendations for nearby attractions.

## Features

- Retrieve the user's location with a single click.
- Display an interactive map powered by Leaflet and React‑Leaflet.
- Toggle between **Distance** and **Time** search modes.
  - **Distance** shows generated street intersections at a chosen radius.
  - **Time** lists sample recommended places filtered by maximum travel time.
- Adjustable radius (1–50 km) or maximum travel time (15–180 min).
- Results grid that adapts from mobile up to desktop screens.
- Styles written in SCSS modules with a responsive layout.

## Getting Started

1. Install dependencies (pnpm is recommended):

   ```bash
   pnpm install
   ```

2. Start the development server:

   ```bash
   pnpm dev
   ```

   Open <http://localhost:3000> in your browser.

3. Build for production:

   ```bash
   pnpm build
   pnpm start
   ```

## Project Structure

```
src/
  app/          Next.js pages and layout
  components/   React components including TravelRadiusExplorer
  styles/       Global reset and component SCSS
public/         Static assets used by the app
```

The main logic lives in `src/components/TravelRadiusExplorer.js`. It handles user location retrieval, radius/time sliders, map rendering, and result generation. The component is loaded dynamically from `src/app/page.js` to ensure it only runs in the browser.

## Development Notes

- The application relies on the browser's Geolocation API, so it requires HTTPS or `localhost` to access location data.
- Map tiles are served from CartoDB's Voyager tileset.
- Sample recommendations in time mode are mock data generated on the client.
- SCSS styles are compiled through Next.js using the `sass` package.

## License

This project is provided as-is for demonstration purposes.
