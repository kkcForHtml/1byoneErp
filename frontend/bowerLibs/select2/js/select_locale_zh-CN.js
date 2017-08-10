define(function () {
  // Chinese
  return lang={
    inputTooLong: function (args) {
      var overChars = args.input.length - args.maximum;

      var message = '请删除' + overChars + '个字符';

      return message;
    },
    inputTooShort: function (args) {
      var remainingChars = args.minimum - args.input.length;

      var message = '请再输入' + remainingChars + '个字符';

      return message;
    },
    loadingMore: function () {
      return '加载中…';
    },
    maximumSelected: function (args) {
      var message = '你最多只能选择' + args.maximum + '项';

      return message;
    },
    noResults: function () {
      return '没有找到相关的项目';
    },
    searching: function () {
      return '搜索中…';
    }
  },lang;
});
