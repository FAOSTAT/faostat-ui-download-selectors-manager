/*global define*/
/*jslint nomen: true*/
define([
    'jquery',
    'loglevel',
    'config/Config',
    'globals/Common',
    'text!fs-s-m/html/template.hbs',
    'faostatapiclient',
    'fs-s/start',
    'handlebars',
    'underscore',
    // Add selector
    'amplify'
], function ($, log, C, Common, template, FAOSTATAPIClient, Selector, Handlebars, _) {

    'use strict';

    var s = {

            SELECTORS_GRID: '[data-role="selectors_grid"]'

        },
        defaultOptions = {

            validateEmptySelection: true

        };

    function SelectorsManager() {

        return this;

    }

    SelectorsManager.prototype.init = function (config) {

        this.o = $.extend(true, {}, defaultOptions, config);
        this.api = new FAOSTATAPIClient();

        log.info('SelectorsManager.init;', this.o);

        this.initVariables();
        this.initComponents();
        this.bindEventListeners();

    };

    SelectorsManager.prototype.initVariables = function () {

        this.$CONTAINER = $(this.o.container);

        var html = $(template).filter('#selector_manager_container').html(),
        t = Handlebars.compile(html);

        // init structure
        this.$CONTAINER.html(t({}));

        // init grid
        this.$SELECTORS_GRID = this.$CONTAINER.find(s.SELECTORS_GRID);

    };

    SelectorsManager.prototype.initComponents = function () {

        var code = this.o.code,
            report_code = this.o.report_code || null,
            self = this;

        // initialize selectors
        this.selectors = [];


        // retrieve all dimensions
        this.api.dimensions({
            datasource: C.DATASOURCE,
            lang: Common.getLocale(),
            domain_code: code,
            report_code: report_code
        }).then(function(dimensions) {

            self.o.dimensions = dimensions;

            _.each(dimensions.data, function (d, index) {
                self.selectors.push(self.createSelector(d, index));
            });

        });

    };

    // create a single selector
    SelectorsManager.prototype.createSelector = function (dimension, index) {

      // init selector div
      var selector = new Selector(),
          code = this.o.code,
          html = $(template).filter('#single_selector').html(),
          t = Handlebars.compile(html),
          id = 'selector_' + Math.random().toString().replace('.', ''),
          multipleSelection = this.o.multiple;

        this.$SELECTORS_GRID.append(t({
            id: id,
            addClearFix: (index % 2)? true: false
        }));

        log.info(multipleSelection)

        // add selector container
        selector.init($.extend(true, {},
            dimension,
            {
                container: this.$SELECTORS_GRID.find('#' + id),
                code: code,
                dimension: dimension,
                multiple: multipleSelection
            }));

        return selector;
    };

    SelectorsManager.prototype.getSelections = function () {

        var selections = [];

        _.each(this.selectors, function(s) {
            selections.push(s.getSelections());
        });

        log.info('SelectorsManager.getSelections; ' + selections);

        // validate if one selection is empty
        if ( this.o.validateEmptySelection ) {
            if ( this.isEmpty(selections) ) {
                throw new Error("The user didn't select at least one item");
            }
        }

        return selections;

    };

    SelectorsManager.prototype.isEmpty = function (selections) {

        for(var i=0; i < selections.length; i++) {
            if (selections[i] === undefined || selections[i].codes.length <= 0) {
                log.error('SelectorsManager.isEmpty; Selector (', i, ') is Empty' );
                return true;
            }
        }

        return false;

    };

    SelectorsManager.prototype.bindEventListeners = function () {

    };

    SelectorsManager.prototype.unbindEventListeners = function () {

    };

    SelectorsManager.prototype.destroy = function () {

        log.info('SelectorsManager.destroy;');

        // for each Selector call it's destroy
        _.each(this.selectors, function(s) {
            if(s && s.destroy) {
                s.destroy();
            }
        });

    };

    return SelectorsManager;

});