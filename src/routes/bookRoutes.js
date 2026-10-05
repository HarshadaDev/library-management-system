const express = require("express");
const db = require("../config/db");

const router = express.Router();

// Add Book
router.post("/", (req, res) => {

    const {
        title,
        author_id,
        category,
        quantity
    } = req.body;

    if (!title || !author_id || !category || !quantity) {
        return res.status(400).json({
            message: "All book details are required"
        });
    }

    const sql = `
        INSERT INTO books
        (title, author_id, category, quantity, available_quantity)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [title, author_id, category, quantity, quantity],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Error adding book",
                    error: err.message
                });
            }

            res.status(201).json({
                message: "Book added successfully",
                book_id: result.insertId
            });
        }
    );
});


// Get All Books with Search, Filter and Pagination
router.get("/", (req, res) => {

    const search = req.query.search || "";
    const category = req.query.category || "";

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    let sql = `
        SELECT
            books.book_id,
            books.title,
            authors.name AS author,
            books.category,
            books.quantity,
            books.available_quantity
        FROM books
        JOIN authors
        ON books.author_id = authors.author_id
        WHERE 1=1
    `;

    const params = [];

    // Search by title or author
    if (search) {

        sql += `
            AND (
                books.title LIKE ?
                OR authors.name LIKE ?
            )
        `;

        params.push(`%${search}%`);
        params.push(`%${search}%`);
    }

    // Filter by category
    if (category) {

        sql += ` AND books.category = ?`;

        params.push(category);
    }

    // Pagination
    sql += ` LIMIT ? OFFSET ?`;

    params.push(limit);
    params.push(offset);

    db.query(sql, params, (err, results) => {

        if (err) {

            return res.status(500).json({
                message: "Error fetching books",
                error: err.message
            });
        }

        res.json({
            page: page,
            limit: limit,
            results: results
        });
    });
});


module.exports = router;