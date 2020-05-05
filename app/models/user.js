"use strict"
let ObjectID = require("bson-objectid");

function getFilteredUser(db, query, projection) {      
	return new Promise( resolve => {
	    db.collection('User').find(query,projection)
		.toArray(function(err, results) {
	  		if (err) 
	  			throw err;
	  		let required_user_ids = [];
	  		if (results.length) {
	  			required_user_ids = results.map(value => value._id);
	  		} 
	  		resolve(required_user_ids); 
	  	});
	});
}

module.exports = {
    getFilteredUser: getFilteredUser
}