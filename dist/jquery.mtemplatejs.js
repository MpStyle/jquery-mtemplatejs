(function ($) {
    var MTemplateJSOption = (function () {
        function MTemplateJSOption() {
            this.directives = {};
            this.beforeExecution = function () {
            };
            this.afterExecution = function () {
            };
            this.beforeAppendItem = function ($element) {
            };
            this.afterAppendItem = function ($element) {
            };
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
            this.manageSubTemplate();
        };
        MTemplateJS.prototype.append = function ($clonedTemplate) {
            var clonedTemplateHtml = $clonedTemplate.html(), $element = $(clonedTemplateHtml);
            if (this.option.beforeAppendItem)
                this.option.beforeAppendItem($element);
            switch (this.option.effect) {
                case 'fade':
                    $element.hide().appendTo(this.$currentElement).fadeIn(this.option.effectDuration);
                    break;
                default:
                    this.$currentElement.append($clonedTemplate.html());
                    break;
            }
            if (this.option.afterAppendItem)
                this.option.afterAppendItem($element);
        };
        MTemplateJS.prototype.manageSubTemplate = function () {
            var me = this;
            $.each(me.subTemplates, function (key, value) {
                var query = MTemplateJS.queryGenerator(MTemplateJS.MT_SUBTEMPLATE);
                $(query).each(function (index, el) {
                    (new MTemplateJS(el, MTemplateJS.arrayGenerator(value), me.option)).run();
                });
            });
        };
        MTemplateJS.prototype.manageDirectives = function (record, $clonedTemplate) {
            var me = this;
            this.apply($clonedTemplate, MTemplateJS.MT_FUNC, function (directiveName, $elem) {
                var directive = me.option.directives[directiveName];
                if (directive) {
                    directive($elem, record);
                }
            });
        };
        MTemplateJS.prototype.manageRecord = function (record, $clonedTemplate) {
            var me = this;
            this.apply($clonedTemplate, MTemplateJS.MT_TEXT, function (key, $elem) {
                $elem.html(me.returnValue(record, key));
            });
            this.apply($clonedTemplate, MTemplateJS.MT_CLASS, function (key, $elem) {
                $elem.addClass(me.returnValue(record, key));
            });
            this.apply($clonedTemplate, MTemplateJS.MT_DATA, function (key, $elem) {
                var subTemplateKey = MTemplateJS.UUIDGenerator();
                $elem.attr(MTemplateJS.MT_SUBTEMPLATE, subTemplateKey);
                me.subTemplates[subTemplateKey] = me.returnValue(record, key);
            });
            MTemplateJS.ATTRIBUTES.forEach(function (attribute) {
                me.manageAttribute($clonedTemplate, record, attribute);
            });
        };
        MTemplateJS.prototype.manageAttribute = function ($clonedTemplate, record, attribute) {
            var me = this;
            this.apply($clonedTemplate, "data-mt-" + attribute, function (key, $elem) {
                $elem.attr(attribute, me.returnValue(record, key));
            });
        };
        MTemplateJS.prototype.apply = function ($clonedTemplate, attributeName, func) {
            var query = MTemplateJS.queryGenerator(attributeName), $elements = $clonedTemplate.find(query);
            $elements.each(function (index, elem) {
                func($(elem).attr(attributeName), $(elem));
            });
        };
        MTemplateJS.prototype.returnValue = function (record, key) {
            var keys = key.split("."), currentValue = record;
            for (var i = 0; i < keys.length; i++) {
                currentValue = currentValue[keys[i]];
            }
            return currentValue;
        };
        MTemplateJS.queryGenerator = function (attributeName, attributeValue) {
            if (attributeName) {
                return "*[" + attributeName + "=" + attributeValue + "]";
            }
            return "[" + attributeName + "]";
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
        if (option.beforeExecution)
            option.beforeExecution();
        var result = this.each(function (index, elem) {
            (new MTemplateJS(elem, MTemplateJS.arrayGenerator(data), option)).run();
        });
        if (option.afterExecution)
            option.afterExecution();
        return result;
    };
})(jQuery);
