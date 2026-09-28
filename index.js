// index.js

import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const API_BASE_URL = "https://trefle.io/api/v1";
const API_TOKEN = process.env.TOKEN;

// 1. GET Endpoint: Home Page (Supports page query parameter)
app.get("/", async (req, res) => {
    // Get page from URL query parameter, default to page 1
    const page = parseInt(req.query.page) || 1;

    try {
        const response = await axios.get(`${API_BASE_URL}/plants`, {
            params: {
                token: API_TOKEN,
                page: page
            }
        });
        
        res.render("index", { 
            plants: response.data.data, 
            searchQuery: null,
            currentPage: page,
            error: null 
        });
    } catch (error) {
        console.error("Error fetching plant data:", error.message);
        res.render("index", { 
            plants: [], 
            searchQuery: null,
            currentPage: page,
            error: "Unable to load plant data. Please check your API token." 
        });
    }
});

// 2. GET Endpoint: Search Plants (Supports search query + page parameter)
app.get("/search", async (req, res) => {
    const searchItem = req.query.plantName || "";
    const page = parseInt(req.query.page) || 1;

    // If search term is empty, redirect back to homepage
    if (!searchItem.trim()) {
        return res.redirect("/");
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/plants/search`, {
            params: {
                token: API_TOKEN,
                q: searchItem,
                page: page
            }
        });

        res.render("index", { 
            plants: response.data.data, 
            searchQuery: searchItem,
            currentPage: page,
            error: null 
        });
    } catch (error) {
        console.error("Error searching plants:", error.message);
        res.render("index", { 
            plants: [], 
            searchQuery: searchItem,
            currentPage: page,
            error: `Failed to retrieve results for "${searchItem}".` 
        });
    }
});

// 3. GET Endpoint: Individual Plant Details
app.get("/plant/:id", async (req, res) => {
    const plantId = req.params.id;

    try {
        // Axios GET request to Trefle's specific plant endpoint: /plants/:id
        const response = await axios.get(`${API_BASE_URL}/plants/${plantId}`, {
            params: {
                token: API_TOKEN
            }
        });

        // Trefle returns detailed plant data in response.data.data
        res.render("detail", {
            plant: response.data.data,
            error: null
        });
    } catch (error) {
        console.error(`Error fetching details for plant ID ${plantId}:`, error.message);
        res.render("detail", {
            plant: null,
            error: "Could not load detailed information for this plant."
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});