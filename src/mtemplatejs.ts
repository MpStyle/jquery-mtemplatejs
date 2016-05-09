/// <reference path="mtemplatejs.d.ts" />

(function ($) {

    class MTemplateJS {
        private static MT_LOAD:string = 'data-mt-load';
        private static MT_USE:string = 'data-mt-use';
        private static MT_TEXT:string = 'data-mt-text';
        private static MT_DATA:string = 'data-mt-data';
        private static MT_CLASS:string = 'data-mt-class';
        private static ATTRIBUTES:string[] = ['href', 'src', 'title', 'alt'];
        private static MT_FUNC:string = 'data-mt-func';
        private static UUID_TEMPLATE = 'axx-xxx-xxx';
        private currentElement:Element;
        private $currentElement:JQuery;
        private $template:JQuery;
        private data:Object[];
        private directives:{ [key:string]:($item:JQuery, record:any)=>void };

        constructor(element:Element, data:Object[], directives?:{ [key:string]:($item:JQuery, record:any)=>void }) {
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
            let me = this,
                templateName:string = this.$currentElement.attr(MTemplateJS.MT_USE);

            // Load the template from the URL defined in data-mt-load attribute.
            if (MTemplateJS.isUndefined(templateName) || templateName == "") {
                let templateUrl:string = this.$currentElement.attr(MTemplateJS.MT_LOAD);

                if (MTemplateJS.isUndefined(templateUrl) === false && templateUrl !== "") {
                    $.get(templateUrl, function (data:any) {
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
        }

        /**
         * For each record in data manages the record.
         */
        private manageData() {
            let me = this;

            $(this.data).each(function (index, elem) {
                me.manage(elem);
            });
        }

        /**
         * Manages a record in data:
         * <ul>
         *     <li>Clone the template</li>
         *     <li>Wrap the template in a div tag</li>
         *     <li>Set an id attribute to the div wrapper</li>
         *     <li>Execute the directives</li>
         *     <li>Manage the mtemplate attributes defined in the template</li>
         * </ul>
         *
         * @param record
         */
        private manage(record:any) {
            let $clonedTemplate:JQuery = this.$template.clone(),
                uuid:string = MTemplateJS.generateUUID();
            $clonedTemplate = $('<div>').attr('id', uuid).append($clonedTemplate);

            this.manageDirectives(record, $clonedTemplate);
            this.manageRecord(record, $clonedTemplate);

            this.$currentElement.append($clonedTemplate.html());
        }

        /**
         * Execute the directive in the cloned template.
         *
         * @param record
         * @param $clonedTemplate
         */
        private manageDirectives(record:any, $clonedTemplate:JQuery) {
            let me:MTemplateJS = this;
            for (let key in this.directives) {
                this.apply(
                    $clonedTemplate,
                    "*[" + MTemplateJS.MT_FUNC + "=" + key + "]",
                    function ($elem:JQuery) {
                        let directive:($item:JQuery, record:any)=>void = me.directives[key];
                        if (MTemplateJS.isUndefined(directive) === false) {
                            directive($elem, record);
                        }
                    }
                );
            }
        }

        /**
         * Bind the data to the template.
         *
         * @param record A record of the data to bind in the template
         * @param $clonedTemplate The cloned template.
         */
        private manageRecord(record:any, $clonedTemplate:JQuery) {
            let me = this;
            for (let k in record) {
                let key:string = k;

                if (Array.isArray(record[key])) {
                    $clonedTemplate.find("*[" + MTemplateJS.MT_DATA + "=" + key + "]").each(function () {
                        (new MTemplateJS(this, record[key])).run();
                    });
                }
                else {
                    this.apply(
                        $clonedTemplate,
                        "*[" + MTemplateJS.MT_TEXT + "=" + key + "]",
                        function ($elem:JQuery) {
                            $elem.html(record[key]);
                        }
                    );

                    this.apply(
                        $clonedTemplate,
                        "*[" + MTemplateJS.MT_CLASS + "=" + key + "]",
                        function ($elem:JQuery) {
                            $elem.addClass(record[key]);
                        }
                    );

                    MTemplateJS.ATTRIBUTES.forEach(function (attribute:string) {
                        me.manageAttribute($clonedTemplate, key, record, attribute);
                    });
                }
            }
        }

        /**
         * Generic method to create an attribute in the element with the associated mtemplate attributes:
         * <ul>
         *     <li>
         *         data-mt-title will create the attribute title in the selected element and the value will be the value
         *         of the key in the data.
         *     </li>
         * </ul>
         *
         * @param $clonedTemplate
         * @param key
         * @param record
         * @param attribute
         */
        private manageAttribute($clonedTemplate:JQuery, key:any, record:any, attribute:string) {
            this.apply(
                $clonedTemplate,
                "*[" + attribute + "=" + key + "]",
                function ($elem:JQuery) {
                    $elem.attr("data-mt-" + attribute, record[key]);
                }
            );
        }

        /**
         * Applies the <i>func</i> for the elements selected quering $clonedTemplate.
         *
         * @param $clonedTemplate
         * @param query
         * @param func
         */
        private apply($clonedTemplate:JQuery, query:string, func:($elem:JQuery)=>void) {
            let $elements:JQuery = $clonedTemplate.find(query);
            $elements.each(function (index:number, elem:Element) {
                func($(elem));
            })
        }

        /**
         * Generic method. It generates a UUIS.
         *
         * @returns {string}
         */
        private static generateUUID():string {
            let d = new Date().getTime();
            return MTemplateJS.UUID_TEMPLATE.replace(/[xy]/g, function (c) {
                let r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        }

        /**
         * Check if <i>v</i> is defined.
         *
         * @param v
         * @returns {boolean}
         */
        private static isUndefined(v:any):boolean {
            return (typeof v === 'undefined');
        }
    }

    $.fn.mtemplatejs = function (data:any, directives?:{ [key:string]:($item:JQuery, record:any)=>void }) {
        let d = data;
        if (Array.isArray(d) === false) {
            d = [d];
        }

        //noinspection TypeScriptUnresolvedFunction
        return this.each(function (index:number, elem:Element) {
            (new MTemplateJS(elem, d, directives)).run();
        });
    };

})(jQuery);
