"use strict"
let ObjectID = require("bson-objectid");


function getMeanOfResponses(db, user_ids) {      
	return new Promise( resolve => {
	    db.collection('Questions').aggregate([
	    	{ '$match': { 'userId': {'$in':user_ids.map(exid => ObjectID(exid))}} },
	    	{ '$sort': {'rating': 1}},
	    	{ '$group': { '_id': '$userId', 'ratingArray': { '$push': '$rating' }, 'size': {'$sum': 1}, 'mean':{'$avg':'$rating'} } },
	    	{ '$project': { '_id': 0, 'userId': '$_id', 'mean': { '$round': ['$mean', 2] } } },
	    ],
    	function(err, cursor) {
    		if (err) 
	  			throw err;
	  		cursor.toArray(function(err, documents) {
	          resolve(documents);
	        });
	    });
	});
}

function getMedianOfResponses(db, user_ids) {      
	return new Promise( resolve => {
	    db.collection('Questions').aggregate([
	    	{ '$match': { 'userId': {'$in':user_ids.map(exid => ObjectID(exid))}} },
	    	{ '$sort': {'rating': 1}},
	    	{ '$group': { '_id': '$userId', 'ratingArray': { '$push': '$rating' }, 'size': {'$sum': 1} } },
	    	{ '$project': { '_id': 0, 'userId': '$_id', 'ratingArray': 1, 'size': 1 } },
	    	{ '$project': {'userId': 1, 'ratingArray': 1, 'isEvenLength': { '$eq': [{ '$mod': ['$size', 2] }, 0 ] }, 'middlePoint': { '$trunc': { '$divide': ['$size', 2] } } } },
	    	{ '$project': {'userId': 1, 'ratingArray': 1, 'isEvenLength': 1, 'middlePoint': 1, 'beginMiddle': { '$subtract': [ '$middlePoint', 1] }, 'endMiddle': '$middlePoint' } },
	    	{ '$project': {'userId': 1, 'ratingArray': 1, 'isEvenLength': 1, 'middlePoint': 1, 'beginMiddle': 1, 'endMiddle': '$middlePoint', 'beginValue': { '$arrayElemAt': ['$ratingArray', '$beginMiddle'] }, 'endValue': { '$arrayElemAt': ['$ratingArray', '$endMiddle'] } } },
	    	{ '$project': {'userId': 1, 'ratingArray': 1, 'isEvenLength': 1, 'middlePoint': 1, 'beginMiddle': 1, 'endMiddle': '$middlePoint', 'beginValue': 1, 'endValue': 1,  'middleSum': { '$add': ['$beginValue', '$endValue'] } } },
	    	{ '$project': {'userId': 1, 'median': { '$cond': { 'if': '$isEvenLength', 'then': { '$divide': ['$middleSum', 2] }, 'else':  { '$arrayElemAt': ['$ratingArray', '$middlePoint'] } } } } }
	    ],
    	function(err, cursor) {
    		if (err) 
	  			throw err;
	  		cursor.toArray(function(err, documents) {
	          resolve(documents);
	        });
	    });
	});
}

function getVarianceOfResponses(db, user_ids) {      
	return new Promise( resolve => {
	    db.collection('Questions').aggregate([
	    	{ '$match': { 'userId': {'$in':user_ids.map(exid => ObjectID(exid))}} },
	    	{ '$sort': {'rating': 1}},
	    	{ '$group': { '_id': '$userId', 'rating': { '$push': '$rating' }, 'size': {'$sum': 1}, 'mean':{'$avg':'$rating'} } },
	    	{ '$unwind' : '$rating' },
	    	{ '$project': {'_id': 0, 'userId': '$_id', 'delta': { '$pow' : [ { '$abs' : { '$subtract': [ '$rating', '$mean' ] } }, 2] } } },
	    	{ '$group': { '_id': '$userId', 'delta': { '$push': '$delta' }, 'size': {'$sum': 1}, 'variance':{'$avg':'$delta'} } },
	    	{ '$project': {'_id': 0, 'userId': '$_id', 'variance': { '$round': ['$variance', 2] } } }
	    ],
    	function(err, cursor) {
    		if (err) 
	  			throw err;
	  		cursor.toArray(function(err, documents) {
	          resolve(documents);
	        });
	    });
	});
}

function getStandardDeviationOfResponses(db, user_ids) {      
	return new Promise( resolve => {
	    db.collection('Questions').aggregate([
	    	{ '$match': { 'userId': {'$in':user_ids.map(exid => ObjectID(exid))}} },
	    	{ '$sort': {'rating': 1}},
	    	{ '$group': { '_id': '$userId', 'rating': { '$push': '$rating' }, 'size': {'$sum': 1}, 'mean':{'$avg':'$rating'} } },
	    	{ '$unwind' : '$rating' },
	    	{ '$project': {'_id': 0, 'userId': '$_id', 'delta': { '$pow' : [ { '$abs' : { '$subtract': [ '$rating', '$mean' ] } }, 2] } } },
	    	{ '$group': { '_id': '$userId', 'delta': { '$push': '$delta' }, 'size': {'$sum': 1}, 'variance':{'$avg':'$delta'} } },
	    	{ '$project': {'_id': 0, 'userId': '$_id', 'variance': { '$round': ['$variance', 2] } } },
	    	{ '$project': {'userId': 1, 'standard_deviation': {'$sqrt': '$variance' } } },
	    ],
    	function(err, cursor) {
    		if (err) 
	  			throw err;
	  		cursor.toArray(function(err, documents) {
	          resolve(documents);
	        });
	    });
	});
}

function getPercentageDistributionResponses(db, user_ids) {      
	return new Promise( resolve => {
	    db.collection('Questions').aggregate([
	    	{ '$match': { 'userId': {'$in':user_ids.map(exid => ObjectID(exid))}} },
	    	{ '$sort': {'rating': 1}},
	    	{ '$group': { '_id': '$userId', 'rating': { '$push': '$rating' }, 'size': {'$sum': 1} } },
	    	{ '$unwind' : '$rating' },
	    	{ '$group': { '_id': {'userId': '$_id', 'rating': '$rating', 'size':'$size'}, 'rating': { '$push': '$rating' }, 'size': {'$sum': 1} } },
	    	{ '$project': { '_id': 0, 'userId': '$_id.userId', 'rating': '$_id.rating', 'percentage': { '$concat': [ { '$substr': [ { '$multiply': [ { '$divide': [ '$size', '$_id.size'] }, 100 ] }, 0,5 ] }, '', '%' ] } } },
	    	{ '$group': { '_id': '$userId', 'rating_info': { '$push': {'rating': '$rating', 'percentage': '$percentage'} } } },
	    	{ '$project': {'_id': 0, 'userId': '$_id', 'rating_info': 1 } }
	    ],
    	function(err, cursor) {
    		if (err) 
	  			throw err;
	  		cursor.toArray(function(err, documents) {
	          resolve(documents);
	        });
	    });
	});
}

function getUserReviews(db, user_ids) {      
	return new Promise( resolve => {
	    db.collection('Questions').aggregate([
	    	{ '$match': { 'userId': {'$in':user_ids.map(exid => ObjectID(exid))}} },
	    	{ '$group': { '_id': '$userId', 'question': { '$push': {'questionId': '$_id', 'rating': '$rating'} }, 'total_question': {'$sum': 1} } },
	    	{ '$project': { '_id': 0, 'userId': '$_id', 'question': 1, 'total_question': 1 } },
	    ],
    	function(err, cursor) {
    		if (err) 
	  			throw err;
	  		cursor.toArray(function(err, documents) {
	          resolve(documents);
	        });
	    });
	});
}

function getMeanMedianVarianceOfResponses(db, user_ids, mean, median, variance, standard_deviation) {      
	let projection = {
		'userId': 1
	}
	if (mean) {
		projection['mean'] = 1;
	}
	if (median) {
		projection['median'] = 1;
	}
	if (variance) {
		projection['variance'] = 1;
	}
	if (standard_deviation) {
		projection['standard_deviation'] = 1;
	}

	return new Promise( resolve => {
	    db.collection('Questions').aggregate([
	    	{ '$match': { 'userId': {'$in':user_ids.map(exid => ObjectID(exid))}} },
	    	{ '$sort': {'rating': 1}},
	    	{ '$group': { '_id': '$userId', 'ratingArray': { '$push': '$rating' }, 'size': {'$sum': 1}, 'mean':{'$avg':'$rating'} } },
	    	{ '$project': { '_id': 0, 'userId': '$_id', 'ratingArray': 1, 'mean': 1, 'size': 1 } },
	    	{ '$project': {'userId': 1, 'ratingArray': 1, 'mean': 1, 'isEvenLength': { '$eq': [{ '$mod': ['$size', 2] }, 0 ] }, 'middlePoint': { '$trunc': { '$divide': ['$size', 2] } } } },
	    	{ '$project': {'userId': 1, 'ratingArray': 1, 'mean': 1, 'isEvenLength': 1, 'middlePoint': 1, 'beginMiddle': { '$subtract': [ '$middlePoint', 1] }, 'endMiddle': '$middlePoint' } },
	    	{ '$project': {'userId': 1, 'ratingArray': 1, 'mean': 1, 'isEvenLength': 1, 'middlePoint': 1, 'beginMiddle': 1, 'endMiddle': '$middlePoint', 'beginValue': { '$arrayElemAt': ['$ratingArray', '$beginMiddle'] }, 'endValue': { '$arrayElemAt': ['$ratingArray', '$endMiddle'] } } },
	    	{ '$project': {'userId': 1, 'ratingArray': 1, 'mean': 1, 'isEvenLength': 1, 'middlePoint': 1, 'beginMiddle': 1, 'endMiddle': '$middlePoint', 'beginValue': 1, 'endValue': 1,  'middleSum': { '$add': ['$beginValue', '$endValue'] } } },
	    	{ '$project': {'userId': 1, 'rating': '$ratingArray', 'mean': 1, 'median': { '$cond': { 'if': '$isEvenLength', 'then': { '$divide': ['$middleSum', 2] }, 'else':  { '$arrayElemAt': ['$ratingArray', '$middlePoint'] } } } } },
	    	{ '$unwind' : '$rating' },
	    	{ '$project': {'userId': 1, 'mean': 1, 'median': 1, 'delta': { '$pow' : [ { '$abs' : { '$subtract': [ '$rating', '$mean' ] } }, 2] } } },
	    	{ '$group': { '_id': {'userId': '$userId', 'mean': '$mean', 'median': '$median' }, 'delta': { '$push': '$delta' }, 'size': {'$sum': 1}, 'variance':{'$avg':'$delta'} } },
	    	{ '$project': {'_id': 0, 'userId': '$_id.userId', 'mean': { '$round': ['$_id.mean', 2] }, 'median': '$_id.median', 'variance': { '$round': ['$variance', 2] } } },
	    	{ '$project': {'userId': 1, 'mean': 1, 'median': 1, 'variance': 1, 'standard_deviation': {'$sqrt': '$variance' } } },
	    	{ '$project': projection }
	    ],
    	function(err, cursor) {
    		if (err) {
	  			reject(Error('I was never going to resolve.'))
    		}
	  		cursor.toArray(function(err, documents) {
	          resolve(documents);
	        });
	    });
	});
}

module.exports = {
    getMeanOfResponses: getMeanOfResponses,
    getMedianOfResponses: getMedianOfResponses,
    getVarianceOfResponses: getVarianceOfResponses,
    getStandardDeviationOfResponses: getStandardDeviationOfResponses,
    getPercentageDistributionResponses: getPercentageDistributionResponses,
    getUserReviews: getUserReviews,
    getMeanMedianVarianceOfResponses: getMeanMedianVarianceOfResponses
}