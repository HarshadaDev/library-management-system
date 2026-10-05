const express = require("express");
const db = require("../config/db");

const router = express.Router();

// Add Member
router.post("/", (req, res) => {
    const { name, email, phone, address } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            message: "Name and email are required"
        });
    }

    const sql = `
        INSERT INTO members
        (name, email, phone, address)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, email, phone, address],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error adding member",
                    error: err.message
                });
            }

            res.status(201).json({
                message: "Member added successfully",
                member_id: result.insertId
            });
        }
    );
});

// Get All Members
router.get("/", (req, res) => {

    const sql = "SELECT * FROM members";

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Error fetching members",
                error: err.message
            });
        }

        res.json(results);
    });
});

module.exports = router;