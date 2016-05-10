(function ($) {
    var MTemplateJSOption = (function () {
        function MTemplateJSOption() {
            this.directives = {};
        }
        return MTemplateJSOption;
    }());
    var MTemplateJS = (function () {
        function MTemplateJS(element, data, option) {
            this.option = new MTemplateJSOption();
            this.subTemplates = {};
            this.currentElement = element;
            this.$currentElement = $(this.currentElement);
            this.data = data;
            this.option = option ? option : new MTemplateJSOption();
        }
        MTemplateJS.prototype.run = function () {
            var me = this, templateName = this.$currentElement.attr(MTemplateJS.MT_USE), templateUrl = this.$currentElement.attr(MTemplateJS.MT_LOAD);
            if (templateUrl) {
                $.get(templateUrl, function (data) {
                    me.$template = $(data);
                    me.manageData();
                    console.log(me.$currentElement);
                }, "html");
            }
            if (templateName) {
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
            var $clonedTemplate = this.$template.clone(), uuid = MTemplateJS.UUIDGenerator();
            $clonedTemplate = $('<div>').attr('id', uuid).append($clonedTemplate);
            this.manageDirectives(record, $clonedTemplate);
            this.manageRecord(record, $clonedTemplate);
            this.append($clonedTemplate);
            this.$currentElement.removeAttr(MTemplateJS.MT_LOAD);
            this.$currentElement.removeAttr(MTemplateJS.MT_USE);
            this.manageSubTemplate();
        };
        MTemplateJS.prototype.append = function ($clonedTemplate) {
            switch (this.option.effect) {
                case 'fade':
                    $clonedTemplate.hide().appendTo(this.$currentElement).fadeIn(this.option.effectDuration);
                    break;
                default:
                    this.$currentElement.append($clonedTemplate.html());
                    break;
            }
        };
        MTemplateJS.prototype.manageSubTemplate = function () {
            var me = this;
            $.each(me.subTemplates, function (key, value) {
                var query = MTemplateJS.queryGenerator(MTemplateJS.MT_SUBTEMPLATE, key);
                $(query).each(function (index, el) {
                    (new MTemplateJS(el, MTemplateJS.arrayGenerator(value), me.option)).run();
                    el.removeAttribute(MTemplateJS.MT_SUBTEMPLATE);
                });
            });
        };
        MTemplateJS.prototype.manageDirectives = function (record, $clonedTemplate) {
            var me = this;
            var _loop_1 = function(key) {
                this_1.apply($clonedTemplate, MTemplateJS.MT_FUNC, key, function ($elem) {
                    var directive = me.option.directives[key];
                    if (directive) {
                        directive($elem, record);
                    }
                });
            };
            var this_1 = this;
            for (var key in this.option.directives) {
                _loop_1(key);
            }
        };
        MTemplateJS.prototype.manageRecord = function (record, $clonedTemplate) {
            var me = this;
            var _loop_2 = function(key) {
                this_2.apply($clonedTemplate, MTemplateJS.MT_TEXT, key, function ($elem) {
                    $elem.html(record[key]);
                });
                this_2.apply($clonedTemplate, MTemplateJS.MT_CLASS, key, function ($elem) {
                    $elem.addClass(record[key]);
                });
                this_2.apply($clonedTemplate, MTemplateJS.MT_DATA, key, function ($elem) {
                    var subTemplateKey = MTemplateJS.UUIDGenerator();
                    $elem.attr(MTemplateJS.MT_SUBTEMPLATE, subTemplateKey);
                    me.subTemplates[subTemplateKey] = record[key];
                });
                MTemplateJS.ATTRIBUTES.forEach(function (attribute) {
                    me.manageAttribute($clonedTemplate, key, record, attribute);
                });
            };
            var this_2 = this;
            for (var key in record) {
                _loop_2(key);
            }
        };
        MTemplateJS.prototype.manageAttribute = function ($clonedTemplate, key, record, attribute) {
            this.apply($clonedTemplate, "data-mt-" + attribute, key, function ($elem) {
                $elem.attr(attribute, record[key]);
            });
        };
        MTemplateJS.prototype.apply = function ($clonedTemplate, attributeName, attributeValue, func) {
            var query = MTemplateJS.queryGenerator(attributeName, attributeValue), $elements = $clonedTemplate.find(query);
            $elements.each(function (index, elem) {
                func($(elem));
                $(elem).removeAttr(attributeName);
            });
        };
        MTemplateJS.queryGenerator = function (attributeName, attributeValue) {
            return "*[" + attributeName + "=" + attributeValue + "]";
        };
        MTemplateJS.arrayGenerator = function (value) {
            var d = value;
            if (Array.isArray(d) === false) {
                d = [d];
            }
            return d;
        };
        MTemplateJS.UUIDGenerator = function () {
            return 'a' + (((1 + Math.random()) * 0x1000000) | 0).toString(16).substring(1);
        };
        MTemplateJS.MT_LOAD = 'data-mt-load';
        MTemplateJS.MT_USE = 'data-mt-use';
        MTemplateJS.MT_TEXT = 'data-mt-text';
        MTemplateJS.MT_DATA = 'data-mt-data';
        MTemplateJS.MT_CLASS = 'data-mt-class';
        MTemplateJS.MT_SUBTEMPLATE = 'data-mt-subtemplate';
        MTemplateJS.ATTRIBUTES = ['href', 'src', 'title', 'alt'];
        MTemplateJS.MT_FUNC = 'data-mt-func';
        return MTemplateJS;
    }());
    $.fn.mtemplatejs = function (data, option) {
        return this.each(function (index, elem) {
            (new MTemplateJS(elem, MTemplateJS.arrayGenerator(data), option)).run();
        });
    };
})(jQuery);
