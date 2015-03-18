define(function() {

    var config = {
        paths: {
            FAOSTAT_UI_DOWNLOAD_SELECTORS_MANAGER: 'faostat-ui-download-selectors-manager',
            faostat_ui_download_selectors_manager: '../'
        },
        shim: {
            bootstrap: {
                deps: ['jquery']
            }
        }
    };

    return config;

});