let send = require('../helper/response');
const express = require('express')
const router = express.Router()

// const formidable = require('express-formidable')
// const formidableMiddleware = formidable()

//dashboard
const dashboard = require('../app/controllers/dashboard');

router.post('/overview', async (req, res) => { dashboard.overview(req, res) });
router.post('/overview/percentage-distribution', async (req, res) => { dashboard.percentageDistribution(req, res) });
router.post('/overview/user-reviews', async (req, res) => { dashboard.userReviews(req, res) });

module.exports = router;