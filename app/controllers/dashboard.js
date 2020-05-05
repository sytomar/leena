"use strict"

let send = require('../../helper/response');
let ApplicationError = require("../../helper/applicationError");
let user = require("../models/user");
let question = require("../models/question");
let getDb = require("../../helper/connection").getDb;
let ObjectID = require("bson-objectid");

async function overview(req, res) {
	let methods = req.query.method;
	let method_requested = {
		'mean' : false,
		'median' : false,
		'variance': false,
		'standard_deviation': false
	}

	const valid_method = ["mean", "median", "variance", "standard_deviation"];
	if (methods === undefined) {
		let errorObj = new ApplicationError(
	        ERROR_400,
	        400,
	        1,
	        "Please provide at least one GET params analytic 'method' such 'mean', 'median', 'variance'."
	    );
	    send.response(res, null, errorObj);
	} else if (typeof methods === 'string') {
		if (!valid_method.includes(methods)) {
			let errorObj = new ApplicationError(
		        ERROR_400,
		        400,
		        1,
		        "'methods'"+" is not a valid method. Please provide at least one GET params analytic 'method' such 'mean', 'median', 'variance'."
		    );
		    send.response(res, null, errorObj);
		}
	} else if (typeof methods === 'object') {
		methods.forEach(element => { 
		  	if (!valid_method.includes(element)) {
			  	let errorObj = new ApplicationError(
			        ERROR_400,
			        400,
			        1,
			        "'element'"+" is not a valid method. Please provide at least one GET params analytic 'method' such 'mean', 'median', 'variance'."
			    );
			    send.response(res, null, errorObj);
		  	}
		  	method_requested[element] = true
		});
	}

	const db = getDb();
	const valid_filter = ["Designation", "Company", "Location", "Country", "Gender"];
	
	let queryCondition = [];	
	const post_params = req.body;
	for (const key in post_params) {
	  	if (!valid_filter.includes(key)) {
		  	let errorObj = new ApplicationError(
		        ERROR_400,
		        400,
		        1,
		        key+" is not a valid filter."
		    );
		    send.response(res, null, errorObj);
	  	}
	  	let temp = {
	  		'key': key,
	  		'value': post_params[key]
	  	}
	  	queryCondition.push(temp);
	}

	let query = {}
	if (queryCondition.length) {
		query = {
			'profile' : {
			    $all : queryCondition
			}
		};
	}

	let projection = {
		'profile':0
	};

	let required_user_ids = await user.getFilteredUser(db, query, projection);
	
	if (typeof methods === 'string') {
		if (methods === "mean") {
			let mean = await question.getMeanOfResponses(db, required_user_ids);
			send.response(res, mean, null);
		} else if (methods === "median") {
			let median = await question.getMedianOfResponses(db, required_user_ids);
			send.response(res, median, null);
		} else if (methods === "variance") {
			let variance = await question.getVarianceOfResponses(db, required_user_ids);
			send.response(res, variance, null);
		} else if (methods === "standard_deviation") {
			let standard_deviation = await question.getStandardDeviationOfResponses(db, required_user_ids);
			send.response(res, standard_deviation, null);
		} 
	} else if (typeof methods === 'object') {
		let mean_median_variance = await question.getMeanMedianVarianceOfResponses(db, required_user_ids, method_requested['mean'], method_requested['median'], method_requested['variance'], method_requested['standard_deviation']);
		send.response(res, mean_median_variance, null);
	}
}

async function percentageDistribution(req, res) {
	const db = getDb();
	const valid_filter = ["Designation", "Company", "Location", "Country", "Gender"];
	
	let queryCondition = [];	
	const post_params = req.body;
	for (const key in post_params) {
	  	if (!valid_filter.includes(key)) {
		  	let errorObj = new ApplicationError(
		        ERROR_400,
		        400,
		        1,
		        key+" is not a valid filter."
		    );
		    send.response(res, null, errorObj);
	  	}
	  	let temp = {
	  		'key': key,
	  		'value': post_params[key]
	  	}
	  	queryCondition.push(temp);
	}

	let query = {}
	if (queryCondition.length) {
		query = {
			'profile' : {
			    $all : queryCondition
			}
		};
	}

	let projection = {
		'profile':0
	};

	let required_user_ids = await user.getFilteredUser(db, query, projection);
	let percentage_distribution = await question.getPercentageDistributionResponses(db, required_user_ids);
	send.response(res, percentage_distribution, null);
}

async function userReviews(req, res) {
	const db = getDb();
	const valid_filter = ["Designation", "Company", "Location", "Country", "Gender"];
	
	let queryCondition = [];	
	const post_params = req.body;
	for (const key in post_params) {
	  	if (!valid_filter.includes(key)) {
		  	let errorObj = new ApplicationError(
		        ERROR_400,
		        400,
		        1,
		        key+" is not a valid filter."
		    );
		    send.response(res, null, errorObj);
	  	}
	  	let temp = {
	  		'key': key,
	  		'value': post_params[key]
	  	}
	  	queryCondition.push(temp);
	}

	let query = {}
	if (queryCondition.length) {
		query = {
			'profile' : {
			    $all : queryCondition
			}
		};
	}

	let projection = {
		'profile':0
	};

	let required_user_ids = await user.getFilteredUser(db, query, projection);
	let user_reviews = await question.getUserReviews(db, required_user_ids);
	send.response(res, user_reviews, null);
}

module.exports = {
    overview: overview,
    percentageDistribution: percentageDistribution,
    userReviews: userReviews
}
