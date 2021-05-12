// Add required packages
const express = require("express");
const app = express();
const dblib = require("./dblib.js");
const multer = require("multer");
const upload = multer();
require('dotenv').config()
// Add middleware to parse default urlencoded form
app.use(express.urlencoded({ extended: false }));
// Set up EJS
app.set("view engine", "ejs");
// Enable CORS (see https://enable-cors.org/server_expressjs.html)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
// Serve static content directly
app.use(express.static("css"));
// Application folders
app.use(express.static("public"));
app.use(express.static("views"));
// Add database package and connection string (can remove ssl)
const { Pool } = require('pg');
const { get } = require("http");
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
// Start listener
app.listen(process.env.PORT || 3000, () => {
    console.log("Server started (http://localhost:3000/) !");
});
// Setup routes
app.get("/", (req, res) => {
    //res.send ("Hello world...");
    res.render("index");
});
app.get("/sums", (req, res) => {
    //res.send ("Hello world...");
    res.render("sums");
});
// app.post('/sums', (req, res) => {
//     res.send("POST Request Called");
//   })

app.post("/sums", (req, res) => {
    res.redirect("/sums");
});

app.get("/import", (req, res) => {
    res.render("import");
});

dblib.getTotalRecords()
    .then(result => {
        if (result.msg.substring(0, 5) === "Error") {
            console.log(`Error Encountered.  ${result.msg}`);
        } else {
            console.log(`Total number of database records: ${result.totRecords}`);
        };
    })
    .catch(err => {
        console.log(`Error: ${err.message}`);
    });
  app.get("/import", (req, res) => {
    res.render("import");
 });
 
app.post("/import", upload.single('filename'), (req, res) => {
    if (!req.file || Object.keys(req.file).length === 0) {
        message = "Error: Import file not uploaded";
        return res.send(message);
    };

    //Read file line by line, inserting records
    const buffer = req.file.buffer;
    const lines = buffer.toString().split(/\r?\n/);
    var numFailed = 0;
    var numInserted = 0;
    var errorMessage = "";
    // console.log(lines);
    lines.forEach(line => {
        //console.log(line);
       book = line.split(",");

        console.log(book);

        const sql = `INSERT INTO book (book_id, title, total_pages, rating,isbn,published_date )
             VALUES ($1, $2, $3, $4, $5, $6)`;
        pool.query(sql,book, (err, result) => {


            if (err) {
                console.log(`Customer ID: - Error message: ${err.message}`);
            } else {
                console.log(`Inserted successfully`);
            }
        });
    });
    message = `Total number of records in the database: ${lines.length} \n
        Select a file withbooks for Database Insert`;
    res.send(message);
});

