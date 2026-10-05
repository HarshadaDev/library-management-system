const express = require("express");
const db = require("../config/db");

const router = express.Router();

// Add Author
router.post("/", (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            message: "Author name is required"
        });
    }

    const sql = "INSERT INTO authors (name) VALUES (?)";

    db.query(sql, [name], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error adding author",
                error: err.message
            });
        }

        res.status(201).json({
            message: "Author added successfully",
            author_id: result.insertId,
            name: name
        });
    });
});

// Get All Authors
router.get("/", (req, res) => {
    const sql = "SELECT * FROM authors";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching authors",
                error: err.message
            });
        }

        res.json(results);
    });
});

module.exports = router;