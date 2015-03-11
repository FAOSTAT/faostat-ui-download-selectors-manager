define(['jquery',
        'handlebars',
        'text!faostat_download_selectors_manager/html/templates.html',
        'i18n!faostat_download_selectors_manager/nls/translate',
        'bootstrap',
        'sweetAlert',
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

        require(['FAOSTAT_DOWNLOAD_SELECTOR'], function(TEST) {
            var t = new TEST();
            t.init({});
        });

    };

    return MGR;

});