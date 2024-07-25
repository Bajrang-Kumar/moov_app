require('dotenv').config()

const express = require('express')
const ejs = require('ejs')
const path = require('path')
const cors = require('cors')
const messages = require('./api/language/en')
const pages = require('./api/modules/v1/Pages/route')
const apidoc = require("./api/modules/v1/Api_Document/index")
const route_manager = require("./api/modules/v1/route_manager");

const app = express()

// Express Functionality
const public = path.join(__dirname, 'api/public/images');
app.use(express.static(public));
app.use(express.text())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

app.set('views', path.join(__dirname, 'api/views'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

// Route Management
app.use('/moov_app/home/', pages);    // STATIC PAGES ROUTE
app.use('/v1/api_document/', apidoc);  // API DOCUMENT
app.use('', route_manager);             // MAIN ROUTES

// Server Connection
try {
    app.listen(process.env.PORT, (err) => {
        if (!err) {
            console.log(messages.server_started, "On Port :", process.env.PORT)
        }
        else {
            console.log("Server Connection Error ! ", err)
        }
    })
} catch (error) {
    console.log("Server Connection Failed : ", error)
}