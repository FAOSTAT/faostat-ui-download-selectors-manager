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
            domain: 'GT',
            prefix: 'fenix_',
            datasource: 'faostatdb',
            placeholder_id: 'placeholder',
            url_listboxes: 'http://faostat3.fao.org/wds/rest/procedures/listboxes'
        };

    }

    MGR.prototype.init = function(config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        this.CONFIG.lang = this.CONFIG.lang != null ? this.CONFIG.lang : 'E';

        /* This... */
        var _this = this;

        /* Load selectors grid template. */
        var source = $(templates).filter('#selectors_grid').html();
        var template = Handlebars.compile(source);
        var dynamic_data = {
            prefix: this.CONFIG.prefix
        };
        var html = template(dynamic_data);
        $('#' + this.CONFIG.placeholder_id).html(html);

        /* Query DB for the domain structure. */
        $.ajax({

            url: this.CONFIG.url_listboxes + '/' + this.CONFIG.datasource + '/' + this.CONFIG.domain + '/' + this.CONFIG.lang,
            type: 'GET',
            dataType: 'json',

            success: function (response) {

                /* Cast the result, if required. */
                var json = response;
                if (typeof json == 'string')
                    json = $.parseJSON(response);

                /* Initiate variables. */
                var current = '1';
                var tab_box = [];

                /* Group response items per tab box. */
                for (var i = 0 ; i < json.length ; i++) {
                    if (json[i][0] != current) {
                        _this.create_single_selector(tab_box, current);
                        current = json[i][0];
                        tab_box = [];
                    }
                    tab_box.push(json[i]);
                }
                _this.create_single_selector(tab_box, current);

            },

            error: function (a) {
                swal({
                    title: translate.error,
                    type: 'error',
                    text: a.responseText
                });
            }

        });

    };

    MGR.prototype.create_single_selector = function(tab_box_definition, selector_id) {

        console.log(selector_id);
        console.log(tab_box_definition);

        /* Add template to the main page. */
        var source = $(templates).filter('#single_selector').html();
        var template = Handlebars.compile(source);
        var dynamic_data = {
            prefix: this.CONFIG.prefix,
            selector_id: selector_id
        };
        var html = template(dynamic_data);
        $('#' + this.CONFIG.prefix + 'selectors_grid').append(html);

        //require(['FAOSTAT_DOWNLOAD_SELECTOR'], function(TEST) {
        //    var t = new TEST();
        //    t.init({});
        //});
    };

    return MGR;

});