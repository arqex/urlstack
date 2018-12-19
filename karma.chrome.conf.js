var configData = require('./karma.conf').configData;

configData.browsers = ['Chrome'];

module.exports = function( config ){
	config.set( configData );
}


