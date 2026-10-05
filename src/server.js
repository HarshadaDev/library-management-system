const express = require("express");
const cors = require("cors");

const db = require("./config/db");
const authorRoutes = require("./routes/authorRoutes");
const bookRoutes = require("./routes/bookRoutes");
const memberRoutes = require("./routes/memberRoutes");
const issueRoutes = require("./routes/issueRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/authors", authorRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Library Management System API is running"
    });
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
