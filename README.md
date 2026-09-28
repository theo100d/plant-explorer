# 🌱 Trefle Botanical Explorer

A server-side Node.js & Express web application that connects to the [Trefle.io API](https://trefle.io) to explore global plant species, taxonomy, and images.

## Features

- **API Integration:** Queries Trefle's REST API (`/plants` and `/plants/search`) on the backend to secure API keys.
- **Search Capability:** Users can search for plant species by common or scientific names.
- **Dynamic Templating:** Uses EJS to dynamically iterate and present data cleanly in card grids.
- **Error Handling:** Handles missing images, missing common names, and API connection failures gracefully.

## Tech Stack

- **Backend:** Node.js, Express.js, Axios, Dotenv
- **Frontend:** EJS Templating, CSS3 (Grid & Flexbox)

## Getting Started

1. **Clone or Download project files**
2. **Install dependencies:**
   ```bash
   npm install
   ```
