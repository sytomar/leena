'use strict';

/**
 * Module dependencies
 */

require('dotenv').config();

const fs = require('fs');
const join = require('path').join;
const express = require('express');
const config = require('./config');
const bodyParser = require('body-parser');
const routes = require('./route/routes');

const initDb = require("./helper/connection").initDb;
const getDb = require("./helper/connection").getDb;

const models = join(__dirname, 'app/models');
const port = process.env.PORT || 3000;

const app = express();
// const connection = connect();

global.ERROR_503 = "Something went wrong. Please try again.";
global.ERROR_400 = "Bad request";
global.ERROR_401 = "Unauthorized";
global.ERROR_403 = "You don't have permissions to access this platform. Please contact admin.";
global.ERROR_426 = "Upgrade required.";
global.SUCCESS_200 = "Success";

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

/**
 * Expose
 */

module.exports = {
  app
};

// Bootstrap routes
app.use('/dashboard', routes);

initDb(function (err) {
    app.listen(port, function (err) {
        if (err) {
            throw err; //
        }
        console.log("API Up and running on port " + port);
    });
});
