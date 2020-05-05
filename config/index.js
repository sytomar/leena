/**
 * Module dependencies.
 */

const path = require('path');
const development = require('./env/development');
const defaults = {
  root: path.normalize(__dirname + '/..')
};

/**
 * Expose
 */

module.exports = {
  development: Object.assign({}, development, defaults)
}[process.env.NODE_ENV || 'development'];
