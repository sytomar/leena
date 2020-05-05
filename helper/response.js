"use strict"

module.exports = {
    response(res, data = null, error = null, response = 200){
        res.json({
            data: data,
            error: error,
            response: response
        });
    }
}
