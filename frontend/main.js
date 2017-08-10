/*********************************************************
 * 开发人员：姚龙
 * 创建时间：2016-05-03
 * 描述说明：JS加载依赖
 * *******************************************************/
require.config({
    baseUrl: './',
    waitSeconds: 0,
    paths: {
        'angular': 'bowerLibs/angular/angular.min',
        'angular-ui-router': 'bowerLibs/angular-ui-router/release/angular-ui-router.min',
        'angular-animate': 'bowerLibs/angular-animate/angular-animate.min',
        'angularAMD': 'bowerLibs/angularAMD/angularAMD.min',
        'ngload': 'bowerLibs/angularAMD/ngload.min',
        'jQuery': 'bowerLibs/jquery/jquery.min',
        'bootstrap': 'bowerLibs/bootstrap/dist/js/bootstrap.min',
        'ui.bootstrap': 'bowerLibs/angular-bootstrap/ui-bootstrap-tpls',
        'FileApiConfig': 'libs/FileApiConfig',
        'FileAPI': 'bowerLibs/ng-file-upload-shim/FileAPI.min',
        'ngFileUploadShim': 'bowerLibs/ng-file-upload-shim/ng-file-upload-shim.min',
        'ngFileUpload': 'bowerLibs/ng-file-upload-shim/ng-file-upload.min',
        'angular-ui-tree': 'bowerLibs/angular-tree-control/angular-tree-control',
        'ng-Dialog': "bowerLibs/ngDialog/js/ngDialog",
        'angular-storage': 'bowerLibs/a0-angular-storage/dist/angular-storage.min',
        'datetimepicker': 'bowerLibs/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker',
        'moment': 'bowerLibs/moment/min/moment-with-locales.min',
        'numeric': 'bowerLibs/angular-numeric-directive/src/numeric-directive',
        'table2excel': 'libs/jquery.table2excel',
        'appAdmin': 'libs/app.min',
        'angular-translate': 'bowerLibs/angular-translate/angular-translate.min',
        'angular-translate-files': 'bowerLibs/angular-translate-loader-static-files/angular-translate-loader-static-files.min',
        'ui-notification': 'bowerLibs/angular-ui-notification/dist/angular-ui-notification',
        'angular-confirm': 'bowerLibs/angular-confirm/angular-confirm',
        'vfs_fonts': 'bowerLibs/pdfmake/build/vfs_fonts',
        'pdfmake': 'bowerLibs/pdfmake/build/pdfmake.min',
        'csv': 'bowerLibs/csv/lib/csv.min',
        'ui-grid': "bowerLibs/angular-ui-grid/ui-grid",
        'ng-tree-dnd': "bowerLibs/angular-tree-dnd/dist/ng-tree-dnd.min",
        'fileinput': "bowerLibs/bootstrap-fileinput/js/fileinput.min",
        'fileinput-zh': 'bowerLibs/bootstrap-fileinput/js/locales/zh',
        'kendo-angular': 'bowerLibs/kendo-ui/js/kendo.ui.core.min',
        'kendo-cultures': "bowerLibs/kendo-ui/js/cultures/kendo.culture." + (window.localStorage.lang || 'zh-CN') + ".min",
        'kendo-messages': "bowerLibs/kendo-ui/js/messages/kendo.messages." + (window.localStorage.lang || 'zh-CN') + ".min",
        'kendoMultiSelectBox': 'bowerLibs/common/kendoMultiSelectBox',
        'angular-popups':'bowerLibs/angular-popups/dist/angular-popups',
        'xlsx-full':'bowerLibs/js-xlsx/xlsx.full.min',
        'angular-js-xlsx':'bowerLibs/js-xlsx/angular-js-xlsx',
        'select2-lang':'bowerLibs/select2/js/select_locale_'+ (window.localStorage.lang || 'zh-CN'),      
        'select2':'bowerLibs/select2/js/select2',
        'select2-directive':'app/common/directives/select2-directive',
       'kindeditor' :'bowerLibs/kindeditor/kindeditor'
    },
    map: {
        '*': {
            'css': 'bowerLibs/require-css/css.min'
        }
    },
    shim: {
        'ngFileUploadShim': {
            deps: ['angular', 'FileAPI']
        },
        'ngFileUpload': {
            deps: ['ngFileUploadShim']
        },
        'angular-animate': {
            deps: ['angular']
        },
        'appAdmin': {
            deps: ['jQuery']
        },
        'angularAMD': {
            deps: ['angular']
        },
        'ngload': {
            deps: ['angularAMD']
        },
        'angular-ui-router': {
            deps: ['angular']
        },
        'angular-ui-tree': {
            deps: ['angular']
        },
        'bootstrap': {
            deps: ['jQuery']
        },
        'kindeditor':{
            deps: ['jQuery']
        },
        'ui.bootstrap': {
            deps: ['angular', 'bootstrap']
        },
        'angular': {
            deps: ['jQuery']
        },
        'ng-Dialog': {
            deps: ['angular']
        },
        'datetimepicker': {
            deps: ['moment']
        },
        'angular-translate': {
            deps: ['angular']
        },
        'angular-translate-files': {
            deps: ['angular', 'angular-translate']
        },
        'vfs_fonts': {
            deps: ['pdfmake', 'csv']
        },
        'ui-grid': {
            deps: ['angular']
        },
        'fileinput-zh': {
            deps: ['jQuery', 'fileinput']
        },
        'kendo-angular': {
            deps: ['jQuery', 'angular']
        },
        'kendo-cultures': {
            deps: ['kendo-angular']
        },
        'kendo-messages': {
            deps: ['kendo-angular']
        },
        'kendoMultiSelectBox': {
            deps: ['kendo-angular']
        },
        'angular-js-xlsx': {
            deps: ['xlsx-full']
        },
        'select2': {
            deps: ['select2-lang']
        }
        
    },
    urlArgs: "ver="+_version_,//+new Date().getTime()
    deps: ['app/app']
});
