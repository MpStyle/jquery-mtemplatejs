/// <reference path="libs/jquery.d.ts" />

interface JQuery {
    mtemplatejs(data:JQuery, directives?:{ [key:string]:($item:JQuery, record:any)=>void }): JQuery;
}

(function ($) {
    class MTemplateJS {
        private static MT_USE:string = "mt-use";
        private static MT_TEXT:string = "mt-text";
        private static MT_CLASS:string = "mt-class";
        private static MT_HREF:string = "mt-href";
        private static MT_FUNC:string = "mt-func";
        private currentElement:Element;
        private $currentElement:JQuery;
        private templateName:string;
        private $template:JQuery;
        private data:any;
        private directives:{ [key:string]:($item:JQuery, record:any)=>void };

        constructor(element:Element, data:any, directives?:{ [key:string]:($item:JQuery, record:any)=>void }) {
            this.currentElement = element;
            this.$currentElement = $(this.currentElement);
            this.templateName = this.$currentElement.attr(MTemplateJS.MT_USE);
            this.$template = $($("[mt=" + this.templateName + "]").html());
            this.data = data;
            this.directives = directives;
        }

        public run() {
            var me = this;

            if (Array.isArray(this.data)) {
                $(this.data).each(function (index, elem) {
                    me.manage(elem);
                });
            }
            else {
                me.manage(this.data);
            }
        }

        private manage(record:any) {
            var $clonedTemplate:JQuery = this.$template.clone();
            var uuid:string = MTemplateJS.generateUUID();
            $clonedTemplate = $('<div>').attr('id', uuid).append($clonedTemplate);

            this.manageDirectives(record, $clonedTemplate);
            this.manageRecord(record, $clonedTemplate);

            this.$currentElement.append($clonedTemplate.html());
        }

        private manageDirectives(record:any, $clonedTemplate:JQuery) {
            var me:MTemplateJS = this;
            for (var key in this.directives) {
                this.apply(
                    $clonedTemplate,
                    "*[" + MTemplateJS.MT_FUNC + "=" + key + "]",
                    function ($elem:JQuery) {

                        var directive:($item:JQuery, record:any)=>void = me.directives[key];
                        if (typeof directive !== 'undefined') {
                            directive($elem, record);
                        }
                    }
                );
            }
        }

        private manageRecord(record:any, $clonedTemplate:JQuery) {
            for (var key in record) {
                console.log(key);

                this.apply(
                    $clonedTemplate,
                    "*[" + MTemplateJS.MT_TEXT + "=" + key + "]",
                    function ($elem:JQuery) {
                        console.log(record[key]);
                        $elem.html(record[key]);
                    }
                );

                this.apply(
                    $clonedTemplate,
                    "*[" + MTemplateJS.MT_CLASS + "=" + key + "]",
                    function ($elem:JQuery) {
                        console.log(record[key]);
                        $elem.addClass(record[key]);
                    }
                );

                this.apply(
                    $clonedTemplate,
                    "*[" + MTemplateJS.MT_HREF + "=" + key + "]",
                    function ($elem:JQuery) {
                        console.log(record[key]);
                        $elem.attr("href", record[key]);
                    }
                );
            }
        }

        private apply($clonedTemplate:JQuery, query:string, func:($elem:JQuery)=>void) {
            console.log(query);
            var $elements:JQuery = $clonedTemplate.find(query);
            $elements.each(function (index:number, elem:Element) {
                func($(elem));
            })
        }

        private static generateUUID():string {
            var d = new Date().getTime();
            var uuid = 'axx-xxx-xxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        }
    }

    $.fn.mtemplatejs = function (data:any, directives?:{ [key:string]:($item:JQuery, record:any)=>void }) {
        //noinspection TypeScriptUnresolvedFunction
        return this.each(function (index:number, elem:Element) {
            (new MTemplateJS(elem, data, directives)).run();
        });
    };

})(jQuery);
