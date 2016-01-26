/*global define*/
/*jslint nomen: true*/
define(['jquery',
    'loglevel',
    'handlebars',
    'globals/Common',
    'text!faostat_ui_download_selectors_manager/html/templates.hbs',
    'i18n!faostat_ui_download_selectors_manager/nls/translate',
    'FAOSTAT_UI_DOWNLOAD_SELECTOR',
    'faostatapiclient',
    'sweetAlert',
    'bootstrap',
    'amplify'], function ($, log, Handlebars, Common, templates, translate, SELECTOR, FAOSTATAPIClient) {

    'use strict';

    function MGR() {

        this.CONFIG = {
            domain: 'GT',
            selectors: [],
            prefix: 'fenix_',
            placeholder_id: 'placeholder',
            rendered: false,
            multiple: true,
            rendered_boxes: [],
            callback: {
                onSelectionChange: null
            }
        };

    }

    MGR.prototype.init = function (config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        log.info('selector_manager config', this.CONFIG, config)

        /* Initiate FAOSTAT API's client. */
        this.CONFIG.api = new FAOSTATAPIClient();

        /* Variables. */
        var that = this,
            source,
            template,
            dynamic_data,
            html;

        /* Load selectors grid template. */
        source = $(templates).filter('#selectors_grid').html();
        template = Handlebars.compile(source);
        dynamic_data = {
            prefix: this.CONFIG.prefix
        };
        html = template(dynamic_data);
        $('#' + this.CONFIG.placeholder_id).html(html);

        // TODO: add switch with the report dimensions?

        /* Fetch domain structure. */
        this.CONFIG.api.dimensions({
            domain_code: this.CONFIG.domain,
            report_code: this.CONFIG.report_code || "download",
            lang: Common.getLocale()
        }).then(function (json) {

            /* Prepare the output. */
            var out = [], i;

            that.dimensions = json;

            /* Remove extra objects. This is a buf of the API. */
            for (i = 0; i < json.data.length; i += 1) {
                if (json.data[i].id !== undefined) {
                    out.push(json.data[i]);
                }
            }

            /* Create selectors or show a courtesy message if nothing is retrieved. */
            if (out.length > 0) {
                for (i = 0; i < out.length; i += 1) {
                    that.create_single_selector(out[i], i, json);
                }
            } else {
                $('#' + that.CONFIG.placeholder_id).html('<h1 class="text-center">' + translate.courtesy + '</h1>');
            }

        });

    };

    MGR.prototype.create_single_selector = function (tab_box_definition, selector_id) {

        log.info(tab_box_definition)

        /* Variables. */
        var that = this,
            source,
            template,
            dynamic_data,
            html,
            tab_json_definitions,
            i,
            selector;

        /* Add template to the main page. */
        source = $(templates).filter('#single_selector').html();
        template = Handlebars.compile(source);
        dynamic_data = {
            prefix: this.CONFIG.prefix,
            selector_id: selector_id,
            addClearfix: ((selector_id % 2) === 1)
        };

        html = template(dynamic_data);

        // TODO: change row hack
        $('#' + this.CONFIG.prefix + 'selectors_grid').append(html);

        /* Create JSON configuration for the selector. */
        tab_json_definitions = [];
        for (i = 0; i < tab_box_definition.subdimensions.length; i += 1) {
            tab_json_definitions.push(this.create_tab_json(tab_box_definition.id, tab_box_definition.subdimensions[i]));
        }

        /* Create selector. */
        selector = new SELECTOR();
        selector.init({
            lang: Common.getLocale(),
            placeholder_id: this.CONFIG.prefix + selector_id,
            suffix: '_' + selector_id,

            // TODO: show list and multiple should be connected togheter?
            multiple: this.CONFIG.multiple,
            show_lists: this.CONFIG.multiple,

            tabs: tab_json_definitions,
            callback: {
                onSelectionChange: that.CONFIG.callback.onSelectionChange
            },

            // are the selector metadata
            // used for the 'parameter',
            options: tab_box_definition
        });

        /* Store selector object for future reference. */
        that.CONFIG.selectors.push(selector);

        /* Keep track of the rendered selector. */
        this.CONFIG.rendered_boxes.push(selector_id);

    };

    MGR.prototype.create_tab_json =  function (group_id, tab_definition) {
        var obj = {};
        obj.label = tab_definition.label;
        obj.id = tab_definition.id;
        obj.group_id = group_id;
        obj.domain_code = this.CONFIG.domain;
        obj.coding_systems = tab_definition.coding_systems;
        return obj;
    };

    MGR.prototype.get_user_selection = function () {
        var out = {},
            i;


        // TODO: this should be rethought. 'parameter' should be used in the request.

        /* FAOSTAT procedures require exactly 7 filtering arrays. */
        for (i = 0; i < 7; i += 1) {

            log.info(this.CONFIG.selectors[i])


            // TODO: this doesn't work with less parameters or with a different list
            try {

                out['list' + (1 + i) + 'Codes'] = this.CONFIG.selectors[i].get_user_selection();
            } catch (e) {
                out['list' + (1 + i) + 'Codes'] = [];
            }

        }
        return out;
    };

    MGR.prototype.isRendered = function () {
        var tmp,
            i;
        for (i = 0; i < this.CONFIG.selectors.length; i += 1) {
            if (tmp === undefined) {
                tmp = this.CONFIG.selectors[i].isRendered();
            } else {
                tmp = tmp && this.CONFIG.selectors[i].isRendered();
            }
        }
        this.CONFIG.rendered = tmp !== undefined ? tmp : false;
        return this.CONFIG.rendered;
    };

    MGR.prototype.isNotRendered = function () {
        return !this.isRendered();
    };

    MGR.prototype.get_selected_coding_system = function (selector_idx) {
        if (this.CONFIG.selectors[selector_idx] === undefined) {
            return null;
        }
        log.info("MGR.get_selected_coding_system; index", selector_idx, this.CONFIG.selectors[selector_idx].get_selected_coding_system());
        return this.CONFIG.selectors[selector_idx].get_selected_coding_system();
    };

    MGR.prototype.dispose = function () {
        var i;
        for (i = 0; i < this.CONFIG.selectors.length; i += 1) {
            this.CONFIG.selectors[i].dispose();
        }
        $('#' + this.CONFIG.placeholder_id).empty();
    };

    return MGR;

});