require.config({
    baseUrl: '/',
    paths: {
        'daterangepicker': '../',
        'jquery': 'test/lib/jquery-1.7.1',
        'underscore': 'test/lib/underscore',
        'moment': 'test/lib/moment'
    }
});
mocha.setup({
    ui: 'bdd',
    globals: ['jQuery']
});
require(['jquery', 'daterangepicker.tests.js'], function(){
    'use strict';
    mocha.run();
});