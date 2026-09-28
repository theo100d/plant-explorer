// index.js

// 1. Import required ES modules
import express from "express";
import axios from "axios";
import dotenv from "dotenv";

// 2. Load environment variables from .env file
dotenv.config();

// 3. Initialize Express app
const app = express();
const port = 3000;

// 4. Set up Express Middleware
// Serve static assets (CSS, images) from the public directory
app.use(express.static("public"));
// Parse URL-encoded body data sent by form POST requests
app.use(express.urlencoded({ extended: true }));
// Set EJS as the templating engine
app.set("view engine", "ejs");

// 5. Define Trefle API Base URL and Secret Token from .env
const API_BASE_URL = "https://trefle.io/api/v1";
const API_TOKEN = process.env.TOKEN;

// 6. Routes

// GET Endpoint: Home Page (Displays a default list of plants)
app.get("/", async (req, res) => {
    try {
        // Send Axios GET request to retrieve the first page of plants from Trefle
        const response = await axios.get(`${API_BASE_URL}/plants`, {
            params: {
                token: API_TOKEN
            }
        });
        
        // Render index.ejs passing the array of plants retrieved from Trefle
        res.render("index", { 
            plants: response.data.data, 
            searchQuery: null,
            error: null 
        });
    } catch (error) {
        // Console error logging for developer debugging
        console.error("Error fetching default plant data:", error.message);
        
        // Render template with user-friendly error message
        res.render("index", { 
            plants: [], 
            searchQuery: null,
            error: "Unable to load plant data at this time. Please check your API token or try again later." 
        });
    }
});

// POST Endpoint: Handles Plant Search
app.post("/search", async (req, res) => {
    // Extract the plant name entered in the HTML form field (name="plantName")
    const searchItem = req.body.plantName;

    try {
        // Axios GET request to Trefle's search endpoint: /plants/search?token=...&q=...
        const response = await axios.get(`${API_BASE_URL}/plants/search`, {
            params: {
                token: API_TOKEN,
                q: searchItem
            }
        });

        // Render index.ejs with matching search results
        res.render("index", { 
            plants: response.data.data, 
            searchQuery: searchItem,
            error: null 
        });
    } catch (error) {
        console.error("Error searching plants:", error.message);
        res.render("index", { 
            plants: [], 
            searchQuery: searchItem,
            error: `Failed to retrieve results for "${searchItem}". Please try again.` 
        });
    }
});

// 7. Start the server on port 3000
app.listen(port, () => {
    console.log(`Server is running successfully at http://localhost:${port}`);
});