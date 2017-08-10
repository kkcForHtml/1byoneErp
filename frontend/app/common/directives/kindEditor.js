/**
 * Created by long on 2017/8/8.
 */
define(['angularAMD','kindeditor'],function(angularAMD) {
    angularAMD.directive('oneKindEditor', function ($q) {
        return {
            restrict: 'A',
            link: function ($scope, element, attrs, ngModel) {
                if (!ngModel) {
                    alert("请为oneKindEditor绑定ngModel");
                    return;
                }
                if (!element[0].id)
                {
                    alert("请为oneKindEditor设定ID");
                    return;
                }
                var editor = null;
                //KindEditor.ready(function (K) {
                var K = window.KindEditor;
                editor = K.create('#' + element[0].id,
                    {
                        uploadJson: 'DynImage/KindEditorUpload',
                        allowFileManager: false,
                        afterChange: function () {
                            if (editor) {
                                editor.sync();
                                ngModel.$setViewValue(element.val());
                            }
                        },
                        htmlBasePath: angular.element("base").attr("href"),
                        formatUploadUrl: false,
                        items: [
                            'source', '|', 'undo', 'redo', '|', 'preview', 'print', 'template', 'code', 'cut', 'copy', 'paste',
                            'plainpaste', 'wordpaste', '|', 'justifyleft', 'justifycenter', 'justifyright',
                            'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
                            'superscript', 'clearhtml', 'quickformat', 'selectall', '|', 'fullscreen', '/',
                            'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold',
                            'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat', '|', 'image',
                            'flash', 'media', 'insertfile', 'table', 'hr', 'emoticons', 'baidumap', 'pagebreak',
                            'anchor', 'link', 'unlink', '|', 'about'
                        ],
                    });
                //绑定控件渲染事件
                ngModel.$render = function () {
                    editor.html(ngModel.$viewValue);
                }
                //});

            },
            require: "?ngModel",
        };
    });
})
