(function ($) {
    var MTemplateJS = (function () {
        function MTemplateJS(element, data, directives) {
            this.currentElement = element;
            this.$currentElement = $(this.currentElement);
            this.data = data;
            this.directives = directives;
        }
        MTemplateJS.prototype.run = function () {
            var me = this, templateName = this.$currentElement.attr(MTemplateJS.MT_USE);
            if (MTemplateJS.isUndefined(templateName) || templateName == "") {
                var templateUrl = this.$currentElement.attr(MTemplateJS.MT_LOAD);
                if (MTemplateJS.isUndefined(templateUrl) === false && templateUrl !== "") {
                    $.get(templateUrl, function (data) {
                        me.$template = $(data);
                        me.manageData();
                        console.log(me.$currentElement);
                    }, "html");
                }
            }
            else {
                this.$template = $($("#" + templateName).html());
                this.manageData();
            }
        };
        MTemplateJS.prototype.manageData = function () {
            var me = this;
            $(this.data).each(function (index, elem) {
                me.manage(elem);
            });
        };
        MTemplateJS.prototype.manage = function (record) {
            var $clonedTemplate = this.$template.clone(), uuid = MTemplateJS.generateUUID();
            $clonedTemplate = $('<div>').attr('id', uuid).append($clonedTemplate);
            this.manageDirectives(record, $clonedTemplate);
            this.manageRecord(record, $clonedTemplate);
            this.$currentElement.append($clonedTemplate.html());
        };
        MTemplateJS.prototype.manageDirectives = function (record, $clonedTemplate) {
            var me = this;
            var _loop_1 = function(key) {
                this_1.apply($clonedTemplate, "*[" + MTemplateJS.MT_FUNC + "=" + key + "]", function ($elem) {
                    var directive = me.directives[key];
                    if (MTemplateJS.isUndefined(directive) === false) {
                        directive($elem, record);
                    }
                });
            };
            var this_1 = this;
            for (var key in this.directives) {
                _loop_1(key);
            }
        };
        MTemplateJS.prototype.manageRecord = function (record, $clonedTemplate) {
            var me = this;
            var _loop_2 = function(k) {
                var key = k;
                if (Array.isArray(record[key])) {
                    $clonedTemplate.find("*[" + MTemplateJS.MT_DATA + "=" + key + "]").each(function () {
                        (new MTemplateJS(this, record[key])).run();
                    });
                }
                else {
                    this_2.apply($clonedTemplate, "*[" + MTemplateJS.MT_TEXT + "=" + key + "]", function ($elem) {
                        $elem.html(record[key]);
                    });
                    this_2.apply($clonedTemplate, "*[" + MTemplateJS.MT_CLASS + "=" + key + "]", function ($elem) {
                        $elem.addClass(record[key]);
                    });
                    MTemplateJS.ATTRIBUTES.forEach(function (attribute) {
                        me.manageAttribute($clonedTemplate, key, record, attribute);
                    });
                }
            };
            var this_2 = this;
            for (var k in record) {
                _loop_2(k);
            }
        };
        MTemplateJS.prototype.manageAttribute = function ($clonedTemplate, key, record, attribute) {
            this.apply($clonedTemplate, "*[" + attribute + "=" + key + "]", function ($elem) {
                $elem.attr("data-mt-" + attribute, record[key]);
            });
        };
        MTemplateJS.prototype.apply = function ($clonedTemplate, query, func) {
            var $elements = $clonedTemplate.find(query);
            $elements.each(function (index, elem) {
                func($(elem));
            });
        };
        MTemplateJS.generateUUID = function () {
            var d = new Date().getTime();
            return MTemplateJS.UUID_TEMPLATE.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        };
        MTemplateJS.isUndefined = function (v) {
            return (typeof v === 'undefined');
        };
        MTemplateJS.MT_LOAD = 'data-mt-load';
        MTemplateJS.MT_USE = 'data-mt-use';
        MTemplateJS.MT_TEXT = 'data-mt-text';
        MTemplateJS.MT_DATA = 'data-mt-data';
        MTemplateJS.MT_CLASS = 'data-mt-class';
        MTemplateJS.ATTRIBUTES = ['href', 'src', 'title', 'alt'];
        MTemplateJS.MT_FUNC = 'data-mt-func';
        MTemplateJS.UUID_TEMPLATE = 'axx-xxx-xxx';
        return MTemplateJS;
    }());
    $.fn.mtemplatejs = function (data, directives) {
        var d = data;
        if (Array.isArray(d) === false) {
            d = [d];
        }
        return this.each(function (index, elem) {
            (new MTemplateJS(elem, d, directives)).run();
        });
    };
})(jQuery);
