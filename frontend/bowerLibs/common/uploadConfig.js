﻿define([
    'angular'
], function (ng) {
    function init(ele, data) {
        return ele.fileinput({
            showUpload: false,
            language: "zh",
            uploadAsync: true,
            overwriteInitial: false,
            msgFilesTooMany: "最多只能上传10个文件！",
            msgSizeTooLarge: '最多只能上传2M的文件',
            showPreview: true,
            showRemove: false,
            showCaption: false,
            showClose: false,
//            initialPreviewAsData: true,
            validateInitialCount: true,
            maxFileCount: 10,
            maxFileSize: 2000,
            initialCaption: false,
            previewFileType: 'any',
            fileActionSettings: {
                showUpload: false,
                showRemove: true
            },
            previewZoomButtonTitles: {
                prev: '上一个',
                next: '下一个',
                close: '关闭'
            },
            showBrowse: false,
            browseOnZoneClick: true,
            dropZoneTitle: '拖拽文件到这里',
            dropZoneClickTitle: '或点击这里上传',
            previewFileIconSettings: {
                'doc': '<i class="fa fa-file-word-o text-primary"></i>',
                'xls': '<i class="fa fa-file-excel-o text-success"></i>',
                'ppt': '<i class="fa fa-file-powerpoint-o text-danger"></i>',
                'jpg': '<i class="fa fa-file-photo-o text-warning"></i>',
                'pdf': '<i class="fa fa-file-pdf-o text-danger"></i>',
                'zip': '<i class="fa fa-file-archive-o text-muted"></i>',
            },
            previewFileExtSettings: {
                'doc': function (ext) {
                    return ext.match(/(doc|docx)$/i);
                },
                'xls': function (ext) {
                    return ext.match(/(xls|xlsx)$/i);
                },
                'ppt': function (ext) {
                    return ext.match(/(ppt|pptx)$/i);
                }
            },
            layoutTemplates: {
                modal: '<div class="modal-dialog modal-lg" role="document">\n' +
                        '  <div class="modal-content">\n' +
                        '    <div class="modal-header">\n' +
                        '      <div class="kv-zoom-actions pull-right">{close}</div>\n' +
                        '      <h3 class="modal-title">{heading} <small><span class="kv-zoom-title"></span></small></h3>\n' +
                        '    </div>\n' +
                        '    <div class="modal-body">\n' +
                        '      <div class="floating-buttons"></div>\n' +
                        '      <div class="kv-zoom-body file-zoom-content"></div>\n' + '{prev} {next}\n' +
                        '    </div>\n' +
                        '  </div>\n' +
                        '</div>\n',
            }
        }).fileinput('refresh', data);

    }

    function refresh(ele, data) {
        return ele.fileinput('refresh', data);
    }

    function reset(ele) {
        return ele.fileinput('clear').fileinput('reset');
    }
    angular.extend(angular, {
        'init': function (ele, data) {
            return init(ele, data);
        },
        'refresh': function (ele, data) {
            return refresh(ele, data);
        }, 'reset': function (ele) {
            return reset(ele);
        }});
});


