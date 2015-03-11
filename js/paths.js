define(function() {

    var config = {
        paths: {
            FAOSTAT_DOWNLOAD_SELECTORS_MANAGER: 'faostat-download-selectors-manager',
            faostat_download_selectors_manager: '../'
        },
        shim: {
            bootstrap: {
                deps: ['jquery']
            }
        }
    };

    return config;

});