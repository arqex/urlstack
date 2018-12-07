module.exports = function (config) {
    config.set({
        basePath: 'tests',
        frameworks: ['jasmine'],

        files: [
          '../dist/urlstack.js',
          'test-navigation.js',
        ],

        plugins: [
            require('karma-jasmine'),
            require('karma-phantomjs-launcher')
        ],

        port: 9876,
        browsers: ['PhantomJS'],
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
