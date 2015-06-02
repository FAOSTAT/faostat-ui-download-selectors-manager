define(['jquery',
        'handlebars',
        'faostat_commons',
        'text!faostat_ui_download_selectors_manager/html/templates.html',
        'i18n!faostat_ui_download_selectors_manager/nls/translate',
        'FAOSTAT_UI_DOWNLOAD_SELECTOR',
        'bootstrap',
        'sweetAlert',
        'amplify'], function ($, Handlebars, FAOSTATCommons, templates, translate, SELECTOR) {

    'use strict';

    function MGR() {

        this.CONFIG = {
            lang: 'E',
            lang_faostat: 'E',
            domain: 'GT',
            selectors: [],
            prefix: 'fenix_',
            datasource: 'faostatdb',
            placeholder_id: 'placeholder',
            url_codelists: 'http://faostat3.fao.org/wds/',
            url_listboxes: 'http://faostat3.fao.org/wds/rest/procedures/listboxes'
        };

    }

    MGR.prototype.init = function(config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        this.CONFIG.lang = this.CONFIG.lang != null ? this.CONFIG.lang : 'E';

        /* Store FAOSTAT language. */
        this.CONFIG.lang_faostat = FAOSTATCommons.iso2faostat(this.CONFIG.lang);

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

            url: this.CONFIG.url_listboxes + '/' + this.CONFIG.datasource + '/' + this.CONFIG.domain + '/' + this.CONFIG.lang_faostat,
            type: 'GET',
            dataType: 'json',

            success: function (response) {

                /* Cast the result, if required. */
                var json = response;
                if (typeof json == 'string')
                    json = $.parseJSON(response);

                /* Create selectors. */
                _this.create_selectors(json);

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

    MGR.prototype.create_selectors = function(rest_response) {

        /* Initiate variables. */
        var current = '1';
        var tab_box = [];

        /* Group response items per tab box. */
        for (var i = 0 ; i < rest_response.length ; i++) {
            if (rest_response[i][0] != current) {
                this.create_single_selector(tab_box, current);
                current = rest_response[i][0];
                tab_box = [];
            }
            tab_box.push(rest_response[i]);
        }
        this.create_single_selector(tab_box, current);
    };

    MGR.prototype.create_single_selector = function(tab_box_definition, selector_id) {

        /* This... */
        var _this = this;

        /* Add template to the main page. */
        var source = $(templates).filter('#single_selector').html();
        var template = Handlebars.compile(source);
        var dynamic_data = {
            prefix: this.CONFIG.prefix,
            selector_id: selector_id
        };
        var html = template(dynamic_data);
        $('#' + this.CONFIG.prefix + 'selectors_grid').append(html);

        /* Create JSON configuration for the selector. */
        var tab_json_definitions = [];
        for (var i = 0 ; i < tab_box_definition.length ; i++)
            tab_json_definitions.push(this.create_tab_json(tab_box_definition[i]));

        /* Create selector. */
        var selector = new SELECTOR();
        selector.init({
            lang: _this.CONFIG.lang,
            placeholder_id: _this.CONFIG.prefix + selector_id,
            suffix: '_' + selector_id,
            tabs: tab_json_definitions
        });

        /* Store selector object for future reference. */
        _this.CONFIG.selectors.push(selector);

    };

    MGR.prototype.create_tab_json =  function(tab_definition) {
        var obj = {};
        obj.label = tab_definition[1];
        obj.rest = this.create_listbox_url(tab_definition);
        return obj;
    };

    MGR.prototype.create_listbox_url = function(tab_definition) {
        var s = this.CONFIG.url_codelists;
        s += 'rest/procedures/usp_GetListBox/';
        s += this.CONFIG.datasource + '/';
        s += this.CONFIG.domain + '/';
        s += tab_definition[0] + '/';
        s += tab_definition[2] + '/';
        s += this.CONFIG.lang_faostat;
        return s;
    };

    MGR.prototype.get_user_selection = function() {
        var out = {};
        /* FAOSTAT procedures require exactly 7 filtering arrays. */
        for (var i = 0 ; i < 7 ; i++) {
            try {
                out['list' + (1 + i) + 'Codes'] = this.CONFIG.selectors[i].get_user_selection();
            } catch (e) {
                out['list' + (1 + i) + 'Codes'] = [];
            }
        }
        return out;
    };

    return MGR;

});