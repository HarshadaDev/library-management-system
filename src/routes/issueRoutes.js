const express = require("express");
const db = require("../config/db");

const router = express.Router();

// Issue Book
router.post("/", (req, res) => {

    const {
        book_id,
        member_id,
        issue_date,
        due_date
    } = req.body;

    if (!book_id || !member_id || !issue_date || !due_date) {
        return res.status(400).json({
            message: "All issue details are required"
        });
    }

    // Check book availability
    const checkBookSql = `
        SELECT available_quantity
        FROM books
        WHERE book_id = ?
    `;

    db.query(checkBookSql, [book_id], (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Error checking book",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        if (results[0].available_quantity <= 0) {
            return res.status(400).json({
                message: "Book is not available"
            });
        }

        // Issue book
        const issueSql = `
            INSERT INTO issued_books
            (book_id, member_id, issue_date, due_date)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            issueSql,
            [book_id, member_id, issue_date, due_date],
            (err, result) => {

                if (err) {
                    return res.status(500).json({
                        message: "Error issuing book",
                        error: err.message
                    });
                }

                // Reduce available quantity
                const updateBookSql = `
                    UPDATE books
                    SET available_quantity = available_quantity - 1
                    WHERE book_id = ?
                `;

                db.query(updateBookSql, [book_id], (err) => {

                    if (err) {
                        return res.status(500).json({
                            message: "Book issued but quantity update failed",
                            error: err.message
                        });
                    }

                    res.status(201).json({
                        message: "Book issued successfully",
                        issue_id: result.insertId
                    });

                });
            }
        );
    });
});
// Return Book
router.put("/return/:issue_id", (req, res) => {

    const { issue_id } = req.params;

    const return_date = new Date().toISOString().split("T")[0];

    // Get issue details
    const getIssueSql = `
        SELECT book_id, due_date, return_date
        FROM issued_books
        WHERE issue_id = ?
    `;

    db.query(getIssueSql, [issue_id], (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Error fetching issue details",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Issue record not found"
            });
        }

        const issue = results[0];

        if (issue.return_date !== null) {
            return res.status(400).json({
                message: "Book already returned"
            });
        }

        // Calculate late fee
        const dueDate = new Date(issue.due_date);
        const returnDate = new Date(return_date);

        let lateDays = 0;
        let lateFee = 0;

        if (returnDate > dueDate) {
            const difference =
                returnDate.getTime() - dueDate.getTime();

            lateDays = Math.ceil(
                difference / (1000 * 60 * 60 * 24)
            );

            lateFee = lateDays * 10;
        }

        // Update issued book
        const updateIssueSql = `
            UPDATE issued_books
            SET return_date = ?, late_fee = ?
            WHERE issue_id = ?
        `;

        db.query(
            updateIssueSql,
            [return_date, lateFee, issue_id],
            (err) => {

                if (err) {
                    return res.status(500).json({
                        message: "Error returning book",
                        error: err.message
                    });
                }

                // Increase available quantity
                const updateBookSql = `
                    UPDATE books
                    SET available_quantity = available_quantity + 1
                    WHERE book_id = ?
                `;

                db.query(
                    updateBookSql,
                    [issue.book_id],
                    (err) => {

                        if (err) {
                            return res.status(500).json({
                                message: "Return recorded but book quantity update failed",
                                error: err.message
                            });
                        }

                        res.json({
                            message: "Book returned successfully",
                            return_date: return_date,
                            late_days: lateDays,
                            late_fee: lateFee
                        });

                    }
                );
            }
        );
    });
});

module.exports = router;