module.exports = function (config) {
    config.set({
        basePath: 'tests',
        frameworks: ['jasmine'],

        files: [
          '../dist/urlstack.js',
          'routedata.js',
          'test-navigation.js',
          'test-location.js'
        ],

        plugins: [
            require('karma-jasmine'),
            require('karma-phantomjs-launcher'),
            // require('karma-chrome-launcher')
        ],

        port: 9876,
        browsers: ['PhantomJS'],
        //browsers: ['Chrome'],
        singleRun: false,
        // Allow remote debugging when using PhantomJS
        customLaunchers: {
            'PhantomJS_custom': {
                base: 'PhantomJS',
                debug: true,
            },
        },
    });
};
