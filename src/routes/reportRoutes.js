const express = require("express");
const db = require("../config/db");

const router = express.Router();

// Library Reports
router.get("/", (req, res) => {

    const sql = `
        SELECT
            (SELECT COUNT(*) FROM books) AS total_books,
            (SELECT COUNT(*) FROM members) AS total_members,
            (SELECT COUNT(*) FROM issued_books WHERE return_date IS NULL) AS issued_books,
            (SELECT COUNT(*) FROM issued_books WHERE return_date IS NOT NULL) AS returned_books,
            (SELECT COUNT(*)
             FROM issued_books
             WHERE return_date IS NULL
             AND due_date < CURDATE()) AS overdue_books,
            (SELECT COALESCE(SUM(late_fee), 0)
             FROM issued_books) AS total_late_fees
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Error generating report",
                error: err.message
            });
        }

        res.json({
            message: "Library report generated successfully",
            report: results[0]
        });
    });
});

module.exports = router;