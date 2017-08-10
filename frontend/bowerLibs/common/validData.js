/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
﻿define([
    'angular'
], function (ng) {
    function valid(dataModel, validModel) {
        var result = true;
        for (var key in dataModel)
        {
            for (var valid in validModel)
            {
                if (key === valid)
                {
                    switch (validModel[valid].type)
                    {
                        case 'required':
                            var pattern = /\S+/i;
                            break;
                        case 'email':
                            pattern = /^\w+([-+.]\w+)*@\w+([-.]\w+)+$/i;
                            break;
                        case 'qq':
                            pattern = /^[1-9][0-9]{4,}$/i;
                            break;
                        case 'id':
                            pattern = /^\d{15}(\d{2}[0-9x])?$/i;
                            break;
                        case 'ip':
                            pattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/i;
                            break;
                        case 'zip':
                            pattern = /^\d{6}$/i;
                            break;
                        case 'mobi':
                            pattern = /^1[3|4|5|7|8][0-9]\d{8}$/;
                            break;
                        case 'phone':
                            pattern = /^((\d{3,4})|\d{3,4}-)?\d{3,8}(-\d+)*$/i;
                            break;
                        case 'url':
                            pattern = /^[a-zA-z]+:\/\/(\w+(-\w+)*)(\.(\w+(-\w+)*))+(\/?\S*)?$/i;
                            break;
                        case 'date':
                            pattern = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/i;
                            break;
                        case 'datetime':
                            pattern = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29) (?:(?:[0-1][0-9])|(?:2[0-3])):(?:[0-5][0-9]):(?:[0-5][0-9])$/i;
                            break;
                        case 'int':
                            pattern = /^\d+$/i;
                            break;
                        case 'float':
                            pattern = /^\d+\.?\d*$/i;
                            break;
                    }
                    if (dataModel[key] === undefined && validModel[valid].type === 'required') {
                        validModel[valid].error = true;
                        result = false;
                    }
                    else if (dataModel[key].toString().search(pattern) === -1)
                    {
                        validModel[valid].error = true;
                        result = false;
                    } else {
                        validModel[valid].error = false;
                    }
                }
            }
        }
        return {'result': result, 'data': validModel};
    }

    function getPattern()
    {
        return {
            'required': /\S+/i,
            'email': /^\w+([-+.]\w+)*@\w+([-.]\w+)+$/i,
            'qq': /^[1-9][0-9]{4,}$/i,
            'id': /^\d{15}(\d{2}[0-9x])?$/i,
            'ip': /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/i,
            'zip': /^\d{6}$/i,
            'mobi': /^1[3|4|5|7|8][0-9]\d{8}$/,
            'phone': /^((\d{3,4})|\d{3,4}-)?\d{3,8}(-\d+)*$/i,
            'url': /^[a-zA-z]+:\/\/(\w+(-\w+)*)(\.(\w+(-\w+)*))+(\/?\S*)?$/i,
            'date': /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/i,
            'datetime': /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29) (?:(?:[0-1][0-9])|(?:2[0-3])):(?:[0-5][0-9]):(?:[0-5][0-9])$/i,
            'int': /^\d+$/i,
            'float': /^\d+\.?\d*$/i,
        };
    }
    angular.extend(angular, {'valid': function (dataModel, validModel) {
            return valid(dataModel, validModel);
        }, 'pattern': function () {
            return getPattern();
        }});
});


