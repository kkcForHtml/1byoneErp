/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
﻿define([
    'angular'
], function(ng) {
    function uuid36() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0;
                i < 36;
                i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    }

    function uuid32() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0;
                i < 36;
                i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "";

        var uuid = s.join("");
        return uuid;
    }
    angular.extend(angular, {'uuid36': function() {
            return uuid36();
        }, 'uuid32': function() {
            return uuid32();
        }});
});


