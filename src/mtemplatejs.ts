/// <reference path="mtemplatejs.d.ts" />

(function ($) {

    class MTemplateJS {
        private static MT:string = 'mt';
        private static MT_LOAD:string = 'mt-load';
        private static MT_USE:string = 'mt-use';
        private static MT_TEXT:string = 'mt-text';
        private static MT_CLASS:string = 'mt-class';
        private static MT_HREF:string = 'mt-href';
        private static MT_FUNC:string = 'mt-func';
        private static UUID_TEMPLATE = 'axx-xxx-xxx';
        private currentElement:Element;
        private $currentElement:JQuery;
        private $template:JQuery;
        private data:any;
        private directives:{ [key:string]:($item:JQuery, record:any)=>void };

        constructor(element:Element, data:any, directives?:{ [key:string]:($item:JQuery, record:any)=>void }) {
            this.currentElement = element;
            this.$currentElement = $(this.currentElement);
            this.data = data;
            this.directives = directives;
        }

        /**
         * Inits the template.
         * The template could be inline (in the same html file) or in another file.
         */
        public run() {
            var me = this;
            var templateName:string = this.$currentElement.attr(MTemplateJS.MT_USE);

            if (MTemplateJS.isUndefined(templateName) || templateName == "") {
                var templateUrl:string = this.$currentElement.attr(MTemplateJS.MT_LOAD);

                if (MTemplateJS.isUndefined(templateUrl) === false && templateUrl !== "") {
                    $.get(templateUrl, function (data:any) {
                        me.$template = $(data);
                        me.manageData();
                    }, "html");
                }
            }
            else {
                this.$template = $($("[" + MTemplateJS.MT + "=" + templateName + "]").html());
                this.manageData();
            }
        }

        /**
         * For each record in data manages the record.
         */
        private manageData() {
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

        /**
         * Manages a record in data.
         *
         * @param record
         */
        private manage(record:any) {
            var $clonedTemplate:JQuery = this.$template.clone();
            var uuid:string = MTemplateJS.generateUUID();
            $clonedTemplate = $('<div>').attr('id', uuid).append($clonedTemplate);

            this.manageDirectives(record, $clonedTemplate);
            this.manageRecord(record, $clonedTemplate);

            this.$currentElement.append($clonedTemplate.html());
        }

        /**
         * Manages the directives.
         *
         * @param record
         * @param $clonedTemplate
         */
        private manageDirectives(record:any, $clonedTemplate:JQuery) {
            var me:MTemplateJS = this;
            for (var key in this.directives) {
                this.apply(
                    $clonedTemplate,
                    "*[" + MTemplateJS.MT_FUNC + "=" + key + "]",
                    function ($elem:JQuery) {

                        var directive:($item:JQuery, record:any)=>void = me.directives[key];
                        if (MTemplateJS.isUndefined(directive) === false) {
                            directive($elem, record);
                        }
                    }
                );
            }
        }

        /**
         *
         * @param record
         * @param $clonedTemplate
         */
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

        /**
         * Applies the func for the elements selected quering $clonedTemplate.
         *
         * @param $clonedTemplate
         * @param query
         * @param func
         */
        private apply($clonedTemplate:JQuery, query:string, func:($elem:JQuery)=>void) {
            console.log(query);
            var $elements:JQuery = $clonedTemplate.find(query);
            $elements.each(function (index:number, elem:Element) {
                func($(elem));
            })
        }

        private static generateUUID():string {
            var d = new Date().getTime();
            return MTemplateJS.UUID_TEMPLATE.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        }

        private static isUndefined(v:any) {
            return (typeof v === 'undefined');
        }
    }

    $.fn.mtemplatejs = function (data:any, directives?:{ [key:string]:($item:JQuery, record:any)=>void }) {
        //noinspection TypeScriptUnresolvedFunction
        return this.each(function (index:number, elem:Element) {
            (new MTemplateJS(elem, data, directives)).run();
        });
    };

})(jQuery);
