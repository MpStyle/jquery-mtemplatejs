/// <reference path="mtemplatejs.d.ts" />

(function ($) {

    class MTemplateJS {
        private static MT_LOAD:string = 'data-mt-load';
        private static MT_USE:string = 'data-mt-use';
        private static MT_TEXT:string = 'data-mt-text';
        private static MT_DATA:string = 'data-mt-data';
        private static MT_CLASS:string = 'data-mt-class';
        private static MT_SUBTEMPLATE:string = 'data-mt-subtemplate';
        private static ATTRIBUTES:string[] = ['href', 'src', 'title', 'alt'];
        private static MT_FUNC:string = 'data-mt-func';
        private static UUID_TEMPLATE = 'axx-xxx-xxx';
        private currentElement:Element;
        private $currentElement:JQuery;
        private $template:JQuery;
        private data:Object[];
        private directives:{ [key:string]:($item:JQuery, record:any)=>void };
        private subTemplates:{[key:string]:Object} = {};

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
                templateName:string = this.$currentElement.attr(MTemplateJS.MT_USE),
                templateUrl:string = this.$currentElement.attr(MTemplateJS.MT_LOAD);

            if (templateUrl) {
                $.get(templateUrl, function (data:any) {
                    me.$template = $(data);
                    me.manageData();
                    console.log(me.$currentElement);
                }, "html");
            }
            if (templateName) {
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
                uuid:string = MTemplateJS.UUIDGenerator();
            $clonedTemplate = $('<div>').attr('id', uuid).append($clonedTemplate);

            this.manageDirectives(record, $clonedTemplate);
            this.manageRecord(record, $clonedTemplate);

            this.$currentElement.append($clonedTemplate.html());
            this.$currentElement.removeAttr(MTemplateJS.MT_LOAD);
            this.$currentElement.removeAttr(MTemplateJS.MT_USE);
            this.manageSubTemplate();
        }

        private manageSubTemplate() {
            let me:MTemplateJS = this;

            $.each(me.subTemplates, function (key:string, value:Object) {
                var query:string = MTemplateJS.queryGenerator(MTemplateJS.MT_SUBTEMPLATE, key);
                $(query).each(function (index, el:Element) {
                    (new MTemplateJS(el, MTemplateJS.arrayGenerator(value), me.directives)).run();
                    el.removeAttribute(MTemplateJS.MT_SUBTEMPLATE);
                });
            });
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
                    MTemplateJS.MT_FUNC,
                    key,
                    function ($elem:JQuery) {
                        let directive:($item:JQuery, record:any)=>void = me.directives[key];
                        if (directive) {
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

                this.apply(
                    $clonedTemplate,
                    MTemplateJS.MT_TEXT,
                    key,
                    function ($elem:JQuery) {
                        $elem.html(record[key]);
                    }
                );

                this.apply(
                    $clonedTemplate,
                    MTemplateJS.MT_CLASS,
                    key,
                    function ($elem:JQuery) {
                        $elem.addClass(record[key]);
                    }
                );

                this.apply(
                    $clonedTemplate,
                    MTemplateJS.MT_DATA,
                    key,
                    function ($elem:JQuery) {
                        let subTemplateKey = MTemplateJS.UUIDGenerator();
                        $elem.attr(MTemplateJS.MT_SUBTEMPLATE, subTemplateKey);
                        me.subTemplates[subTemplateKey] = record[key];
                    }
                );

                MTemplateJS.ATTRIBUTES.forEach(function (attribute:string) {
                    me.manageAttribute($clonedTemplate, key, record, attribute);
                });

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
                "data-mt-" + attribute,
                key,
                function ($elem:JQuery) {
                    $elem.attr(attribute, record[key]);
                }
            );
        }

        /**
         * Applies the <i>func</i> for the elements selected quering $clonedTemplate.
         *
         * @param $clonedTemplate
         * @param attributeName
         * @param attributeValue
         * @param func
         */
        private apply($clonedTemplate:JQuery, attributeName:string, attributeValue:string, func:($elem:JQuery)=>void) {
            let query:string = MTemplateJS.queryGenerator(attributeName, attributeValue),
                $elements:JQuery = $clonedTemplate.find(query);

            $elements.each(function (index:number, elem:Element) {
                func($(elem));
                $(elem).removeAttr(attributeName);
            })
        }

        private static queryGenerator(attributeName:string, attributeValue:string):string {
            return "*[" + attributeName + "=" + attributeValue + "]";
        }

        public static arrayGenerator(value:Object[]|Object):Object[] {
            let d:any = value;
            if (Array.isArray(d) === false) {
                d = [d];
            }

            return d;
        }

        /**
         * Generic method. It generates a UUIS.
         *
         * @returns {string}
         */
        private static UUIDGenerator():string {
            let d = new Date().getTime();
            return MTemplateJS.UUID_TEMPLATE.replace(/[xy]/g, function (c) {
                let r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        }
    }

    $.fn.mtemplatejs = function (data:any, directives?:{ [key:string]:($item:JQuery, record:any)=>void }) {
        //noinspection TypeScriptUnresolvedFunction
        return this.each(function (index:number, elem:Element) {
            (new MTemplateJS(elem, MTemplateJS.arrayGenerator(data), directives)).run();
        });
    };

})(jQuery);
