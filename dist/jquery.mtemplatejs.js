(function ($) {
    var MTemplateJS = (function () {
        function MTemplateJS(element, data, directives) {
            this.currentElement = element;
            this.$currentElement = $(this.currentElement);
            this.data = data;
            this.directives = directives;
        }
        MTemplateJS.prototype.run = function () {
            var me = this;
            var templateName = this.$currentElement.attr(MTemplateJS.MT_USE);
            if (MTemplateJS.isUndefined(templateName) || templateName == "") {
                var templateUrl = this.$currentElement.attr(MTemplateJS.MT_LOAD);
                if (MTemplateJS.isUndefined(templateUrl) === false && templateUrl !== "") {
                    $.get(templateUrl, function (data) {
                        me.$template = $(data);
                        me.manageData();
                    }, "html");
                }
            }
            else {
                this.$template = $($("[" + MTemplateJS.MT + "=" + templateName + "]").html());
                this.manageData();
            }
        };
        MTemplateJS.prototype.manageData = function () {
            var me = this;
            if (Array.isArray(this.data)) {
                $(this.data).each(function (index, elem) {
                    me.manage(elem);
                });
            }
            else {
                me.manage(this.data);
            }
        };
        MTemplateJS.prototype.manage = function (record) {
            var $clonedTemplate = this.$template.clone();
            var uuid = MTemplateJS.generateUUID();
            $clonedTemplate = $('<div>').attr('id', uuid).append($clonedTemplate);
            this.manageDirectives(record, $clonedTemplate);
            this.manageRecord(record, $clonedTemplate);
            this.$currentElement.append($clonedTemplate.html());
        };
        MTemplateJS.prototype.manageDirectives = function (record, $clonedTemplate) {
            var me = this;
            for (var key in this.directives) {
                this.apply($clonedTemplate, "*[" + MTemplateJS.MT_FUNC + "=" + key + "]", function ($elem) {
                    var directive = me.directives[key];
                    if (MTemplateJS.isUndefined(directive) === false) {
                        directive($elem, record);
                    }
                });
            }
        };
        MTemplateJS.prototype.manageRecord = function (record, $clonedTemplate) {
            for (var key in record) {
                this.apply($clonedTemplate, "*[" + MTemplateJS.MT_TEXT + "=" + key + "]", function ($elem) {
                    $elem.html(record[key]);
                });
                this.apply($clonedTemplate, "*[" + MTemplateJS.MT_CLASS + "=" + key + "]", function ($elem) {
                    $elem.addClass(record[key]);
                });
                this.apply($clonedTemplate, "*[" + MTemplateJS.MT_HREF + "=" + key + "]", function ($elem) {
                    $elem.attr("href", record[key]);
                });
            }
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
        MTemplateJS.MT = 'mt';
        MTemplateJS.MT_LOAD = 'mt-load';
        MTemplateJS.MT_USE = 'mt-use';
        MTemplateJS.MT_TEXT = 'mt-text';
        MTemplateJS.MT_CLASS = 'mt-class';
        MTemplateJS.MT_HREF = 'mt-href';
        MTemplateJS.MT_FUNC = 'mt-func';
        MTemplateJS.UUID_TEMPLATE = 'axx-xxx-xxx';
        return MTemplateJS;
    }());
    $.fn.mtemplatejs = function (data, directives) {
        if (typeof data != 'Object') {
            console.log("data is not an Object");
            return;
        }
        return this.each(function (index, elem) {
            (new MTemplateJS(elem, data, directives)).run();
        });
    };
})(jQuery);
