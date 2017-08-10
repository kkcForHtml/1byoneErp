/**
 * Numeric directive.
 * Version: 0.9.8
 * 
 * Numeric only input. Limits input to:
 * - max value: maximum input value. Default undefined (no max).
 * - min value: minimum input value. Default undefined (no min).
 * - decimals: number of decimals. Default 2.
 * - formatting: apply thousand separator formatting. Default true.
 */

define(['angularAMD'],function(angularAMD) {
    angularAMD.directive('amNumeric', function ($locale) {

        // Usage:
        //     <input type="text" decimals="3" min="-20" max="40" formatting="false" ></input>
        // Creates:
        // 
        return {
            link: function link(scope, el, attrs, ngModel) {
                var decimalSeparator = $locale.NUMBER_FORMATS.DECIMAL_SEP;
                var groupSeparator = $locale.NUMBER_FORMATS.GROUP_SEP;

                // Create new regular expression with current decimal separator.
                var NUMBER_REGEXP = "^\\s*(\\-|\\+)?(\\d+|(\\d*(\\.\\d*)))\\s*$";
                var regex = new RegExp(NUMBER_REGEXP);

                var formatting = true;
                var maxInputLength = 16;            // Maximum input length. Default max ECMA script.
                var max;                            // Maximum value. Default undefined.
                var min;                            // Minimum value. Default undefined.
                var decimals = 2;                   // Number of decimals. Default 2.
                var lastValidValue;                 // Last valid value.

                // Create parsers and formatters.
                //ngModel.$parsers.push(parseViewValue);
                //ngModel.$parsers.push(minValidator);
                //ngModel.$parsers.push(maxValidator);
                //ngModel.$formatters.push(formatViewValue);

                if (attrs.min) {
                    min = attr.min;
                }

                if (attrs.max) {
                    min = attr.min;
                }

                if (attr.decimals) {
                    decimals = attr.decimals
                }

                maxInputLength = calculateMaxLength(max);

                el.bind('blur', onBlur);        // Event handler for the leave event.
                el.bind('focus', onFocus);      // Event handler for the focus event.

                // Put a watch on the min, max and decimal value changes in the attribute.
                scope.$watch(attrs.min, onMinChanged);
                scope.$watch(attrs.max, onMaxChanged);
                scope.$watch(attrs.decimals, onDecimalsChanged);
                scope.$watch(attrs.formatting, onFormattingChanged);

                // Setup decimal formatting.
                //if (decimals > -1) {
                //    ngModel.$parsers.push(function (value) {
                //        return (value) ? round(value) : value;
                //    });
                //    ngModel.$formatters.push(function (value) {
                //        return (value) ? formatPrecision(value) : value;
                //    });
                //}

                //设置数值

                ngModel.$render = function () {
                    var value = minValidator(ngModel.$modelValue);
                    lastValidValue = maxValidator(value);

                    if (decimals > -1 && lastValidValue) {
                        lastValidValue = round(lastValidValue);
                    }


                    var validViewValue = formatPrecision(lastValidValue);

                    if (formatPrecision(ngModel.$modelValue) != validViewValue) {
                        ngModel.$modelValue = lastValidValue;
                    }
                    ngModel.$viewValue = validViewValue;
                }

                function onMinChanged(value) {
                    if (!angular.isUndefined(value)) {
                        min = parseFloat(value);
                        lastValidValue = minValidator(ngModel.$modelValue);
                        ngModel.$setViewValue(formatPrecision(lastValidValue));
                        //ngModel.$render();
                    }
                }

                function onMaxChanged(value) {
                    if (!angular.isUndefined(value)) {
                        max = parseFloat(value);
                        maxInputLength = calculateMaxLength(max);
                        lastValidValue = maxValidator(ngModel.$modelValue);
                        ngModel.$setViewValue(formatPrecision(lastValidValue));
                        //ngModel.$render();
                    }
                }

                function onDecimalsChanged(value) {
                    if (!angular.isUndefined(value)) {
                        decimals = parseFloat(value);
                        maxInputLength = calculateMaxLength(max);
                        if (lastValidValue !== undefined) {
                            ngModel.$setViewValue(formatPrecision(lastValidValue));
                            //ngModel.$render();
                        }
                    }
                }

                function onFormattingChanged(value) {
                    if (!angular.isUndefined(value)) {
                        formatting = (value !== false);
                        ngModel.$setViewValue(formatPrecision(lastValidValue));
                        //ngModel.$render();
                    }
                }

                /**
                 * Round the value to the closest decimal.
                 */
                function round(value) {
                    var d = Math.pow(10, decimals);
                    return Math.round(value * d) / d;
                }

                /**
                 * Format a number with the thousand group separator.
                 */
                function numberWithCommas(value) {
                    if (formatting) {
                        var parts = value.toString().split(decimalSeparator);
                        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
                        return parts.join(decimalSeparator);
                    }
                    else {
                        // No formatting applies.
                        return value;
                    }
                }

                /**
                 * Format a value with thousand group separator and correct decimal char.
                 */
                function formatPrecision(value) {
                    if (!(value || value === 0)) {
                        return '';
                    }
                    var formattedValue = parseFloat(value).toFixed(decimals);
                    formattedValue = formattedValue.replace('.', decimalSeparator);
                    return numberWithCommas(formattedValue);
                }

                function formatViewValue(value) {
                    return ngModel.$isEmpty(value) ? '' : '' + value;
                }

                /**
                 * Parse the view value.
                 */
                function parseViewValue(value) {
                    if (angular.isUndefined(value)) {
                        value = '';
                    }
                    value = value.toString().replace(decimalSeparator, '.');

                    // Handle leading decimal point, like ".5"
                    if (value.indexOf('.') === 0) {
                        value = '0' + value;
                    }

                    // Allow "-" inputs only when min < 0
                    if (value.indexOf('-') === 0) {
                        if (min >= 0) {
                            value = null;
                            ngModel.$setViewValue(formatViewValue(lastValidValue));
                            ngModel.$render();
                        }
                        else if (value === '-') {
                            value = '';
                        }
                    }

                    var empty = ngModel.$isEmpty(value);
                    if (empty) {
                        lastValidValue = '';
                        //ngModel.$modelValue = undefined;
                    }
                    else {
                        if (regex.test(value) && (value.length <= maxInputLength)) {
                            if (value > max) {
                                lastValidValue = max;
                            }
                            else if (value < min) {
                                lastValidValue = min;
                            }
                            else {
                                lastValidValue = (value === '') ? null : parseFloat(value);
                            }
                        }
                        else {
                            // Render the last valid input in the field
                            ngModel.$setViewValue(formatViewValue(lastValidValue));
                            //ngModel.$render();
                        }
                    }

                    return lastValidValue;
                }

                /**
                 * Calculate the maximum input length in characters.
                 * If no maximum the input will be limited to 16; the maximum ECMA script int.
                 */
                function calculateMaxLength(value) {
                    var length = 16;
                    if (!angular.isUndefined(value)) {
                        length = Math.floor(value).toString().length;
                    }
                    if (decimals > 0) {
                        // Add extra length for the decimals plus one for the decimal separator.
                        length += decimals + 1;
                    }
                    if (min < 0) {
                        // Add extra length for the - sign.
                        length++;
                    }
                    return length;
                }

                /**
                 * Minimum value validator.
                 */
                function minValidator(value) {
                    if (!angular.isUndefined(min)) {
                        if (!ngModel.$isEmpty(value) && (value < min)) {
                            return min;
                        } else {
                            return value;
                        }
                    }
                    else {
                        return value;
                    }
                }

                /**
                 * Maximum value validator.
                 */
                function maxValidator(value) {
                    if (!angular.isUndefined(max)) {
                        if (!ngModel.$isEmpty(value) && (value > max)) {
                            return max;
                        } else {
                            return value;
                        }
                    }
                    else {
                        return value;
                    }
                }


                /**
                 * Function for handeling the blur (leave) event on the control.
                 */
                function onBlur() {
                    var value = ngModel.$modelValue;
                    if (!angular.isUndefined(value)) {
                        // Format the model value.
                        //ngModel.$viewValue = formatPrecision(value);
                        //ngModel.$render();
                        ngModel.$setViewValue(value);
                    }
                }


                /**
                 * Function for handeling the focus (enter) event on the control.
                 * On focus show the value without the group separators.
                 */
                function onFocus() {
                    var value = ngModel.$modelValue;
                    if (!angular.isUndefined(value)) {
                        //ngModel.$viewValue = value.toString().replace(".", decimalSeparator);
                        //ngModel.$render();
                        ngModel.$viewValue = value;
                    }
                }
            },
            require: '?ngModel',
            restrict: 'A'
        };

    });
})