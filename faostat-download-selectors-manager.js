var root = '../modules/';
var repository = '//fenixapps.fao.org/repository/js/';

require.config({

    baseUrl: 'js/libs',

    paths: {

        jquery : repository + 'jquery/1.10.2/jquery-1.10.2.min',
        bootstrap: repository + 'bootstrap/3.2/js/bootstrap.min',
        amplify: repository + 'amplify/1.1.2/amplify.min',

        FAOSTAT_DOWNLOAD_SELECTOR: root + 'faostat-download-selector/faostat-download-selector',
        faostat_download_selector: root + 'faostat-download-selector'

    },

    shim: {

        'bootstrap': {
            deps :['jquery']
        },

        'faostat_bulk_downloads': {
            deps :['jquery']
        }

    }

});

define(['jquery',
        'handlebars',
        'text!faostat_download_selectors_manager/html/templates.html',
        'i18n!faostat_download_selectors_manager/nls/translate',
        'bootstrap',
        'sweet-alert',
        'amplify'], function ($, Handlebars, templates, translate) {

    'use strict';

    function MGR() {

        this.CONFIG = {
            lang: 'E',
            placeholder_id: 'placeholder',
            prefix: 'fenix_'
        };

    }

    MGR.prototype.init = function(config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        this.CONFIG.lang = this.CONFIG.lang != null ? this.CONFIG.lang : 'E';

    };

    return MGR;

});