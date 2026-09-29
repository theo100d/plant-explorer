// index.js

// 1. Import necessary packages and ES modules
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 2. Load environment variables from .env file (reads process.env.TOKEN)
dotenv.config();

// 3. Configure __dirname for ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 4. Initialize Express application and define server port
const app = express();
const port = 3000;

// 5. Middleware Configuration
// Serve static assets (CSS, images) from the 'public' folder
app.use(express.static("public"));
// Parse form request payloads
app.use(express.urlencoded({ extended: true }));
// Explicitly set the views folder path and EJS view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 6. Define Trefle API Constants
const API_BASE_URL = "https://trefle.io/api/v1";
const API_TOKEN = process.env.TOKEN;

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// ROUTE 1: Home Page (Default Plant Directory with Pagination)
app.get("/", async (req, res) => {
    // Read page query parameter from URL (e.g., /?page=2), default to 1 if not provided
    const page = parseInt(req.query.page) || 1;

    try {
        // Send Axios GET request to Trefle's /plants endpoint
        const response = await axios.get(`${API_BASE_URL}/plants`, {
            params: {
                token: API_TOKEN,
                page: page
            }
        });

        // Calculate total pages using response metadata (Trefle returns 20 items per page)
        const totalItems = response.data.meta ? response.data.meta.total : 0;
        const totalPages = Math.ceil(totalItems / 20) || 1;

        // Render index.ejs template with fetched plant array and page stats
        res.render("index", { 
            plants: response.data.data, 
            searchQuery: null,
            currentPage: page,
            totalPages: totalPages,
            error: null 
        });
    } catch (error) {
        console.error("Error fetching default plant list:", error.message);
        res.render("index", { 
            plants: [], 
            searchQuery: null,
            currentPage: 1,
            totalPages: 1,
            error: "Unable to load plant directory. Please check your API token or connection." 
        });
    }
});

// ROUTE 2: Search Endpoint (Handles search inputs + Pagination)
app.get("/search", async (req, res) => {
    // Extract search query string and page parameter from the request URL
    const searchItem = req.query.plantName || "";
    const page = parseInt(req.query.page) || 1;

    // Redirect to home if user submits an empty search input
    if (!searchItem.trim()) {
        return res.redirect("/");
    }

    try {
        // Send Axios GET request to Trefle's /plants/search endpoint
        const response = await axios.get(`${API_BASE_URL}/plants/search`, {
            params: {
                token: API_TOKEN,
                q: searchItem,
                page: page
            }
        });

        // Calculate total pages for the matching search results
        const totalItems = response.data.meta ? response.data.meta.total : 0;
        const totalPages = Math.ceil(totalItems / 20) || 1;

        // Render index.ejs with filtered plants and query details
        res.render("index", { 
            plants: response.data.data, 
            searchQuery: searchItem,
            currentPage: page,
            totalPages: totalPages,
            error: null 
        });
    } catch (error) {
        console.error("Error performing search query:", error.message);
        res.render("index", { 
            plants: [], 
            searchQuery: searchItem,
            currentPage: 1,
            totalPages: 1,
            error: `Could not load results for "${searchItem}". Please try again.` 
        });
    }
});

// ROUTE 3: Individual Plant Details Endpoint
app.get("/plant/:id", async (req, res) => {
    // Get the dynamic plant ID from the route parameter
    const plantId = req.params.id;

    try {
        // Axios GET request to fetch full details for a specific plant ID
        const response = await axios.get(`${API_BASE_URL}/plants/${plantId}`, {
            params: {
                token: API_TOKEN
            }
        });

        // Render detail.ejs template passing deep botanical data
        res.render("detail", {
            plant: response.data.data,
            error: null
        });
    } catch (error) {
        console.error(`Error loading plant details for ID ${plantId}:`, error.message);
        res.render("detail", {
            plant: null,
            error: "Failed to retrieve detailed information for this plant."
        });
    }
});

// 7. Start Express Server
app.listen(port, () => {
    console.log(`🌿 Plant Explorer running at http://localhost:${port}`);
});