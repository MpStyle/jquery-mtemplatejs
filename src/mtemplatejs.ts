/// <reference path="mtemplatejs.d.ts" />

(function ($) {
    class MTemplateJSOption {
        public directives:{ [key:string]:($item:JQuery, record:any)=>void } = {};
        public effect:string;
        public effectDuration:number;
        public beforeExecution:()=>void = function ():void {
        };
        public afterExecution:()=>void = function ():void {
        };
        public beforeAppendItem:($element:JQuery)=>void = function ($element:JQuery):void {
        };
        public afterAppendItem:($element:JQuery)=>void = function ($element:JQuery):void {
        };
    }

    class MTemplateJS {
        private static MT_LOAD:string = 'data-mt-load';
        private static MT_USE:string = 'data-mt-use';
        private static MT_TEXT:string = 'data-mt-text';
        private static MT_DATA:string = 'data-mt-data';
        private static MT_CLASS:string = 'data-mt-class';
        private static MT_SUBTEMPLATE:string = 'data-mt-subtemplate';
        private static ATTRIBUTES:string[] = ['href', 'src', 'title', 'alt'];
        private static MT_FUNC:string = 'data-mt-func';
        private currentElement:Element;
        private $currentElement:JQuery;
        private $template:JQuery;
        private data:Object[];
        private option:MTemplateJSOption = new MTemplateJSOption();
        private subTemplates:{[key:string]:Object} = {};

        constructor(element:Element, data:Object[], option?:MTemplateJSOption) {
            this.currentElement = element;
            this.$currentElement = $(this.currentElement);
            this.data = data;
            this.option = option ? option : new MTemplateJSOption();
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

            this.append($clonedTemplate);

            this.manageSubTemplate();
        }

        private append($clonedTemplate) {
            let clonedTemplateHtml = $clonedTemplate.html(),
                $element = $(clonedTemplateHtml);

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
        }

        private manageSubTemplate() {
            let me:MTemplateJS = this;

            $.each(me.subTemplates, function (key:string, value:Object) {
                var query:string = MTemplateJS.queryGenerator(MTemplateJS.MT_SUBTEMPLATE);
                $(query).each(function (index, el:Element) {
                    (new MTemplateJS(el, MTemplateJS.arrayGenerator(value), me.option)).run();
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
            for (let key in this.option.directives) {
                this.apply(
                    $clonedTemplate,
                    MTemplateJS.MT_FUNC,
                    // key,
                    function (key:string, $elem:JQuery) {
                        let directive:($item:JQuery, record:any)=>void = me.option.directives[key];
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

            this.apply(
                $clonedTemplate,
                MTemplateJS.MT_TEXT,
                function (key:string, $elem:JQuery) {
                    $elem.html(me.returnValue(record, key));
                }
            );

            this.apply(
                $clonedTemplate,
                MTemplateJS.MT_CLASS,
                function (key:string, $elem:JQuery) {
                    $elem.addClass(me.returnValue(record, key));
                }
            );

            this.apply(
                $clonedTemplate,
                MTemplateJS.MT_DATA,
                function (key:string, $elem:JQuery) {
                    let subTemplateKey = MTemplateJS.UUIDGenerator();
                    $elem.attr(MTemplateJS.MT_SUBTEMPLATE, subTemplateKey);
                    me.subTemplates[subTemplateKey] = me.returnValue(record, key);
                }
            );

            MTemplateJS.ATTRIBUTES.forEach(function (attribute:string) {
                me.manageAttribute($clonedTemplate, record, attribute);
            });
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
        private manageAttribute($clonedTemplate:JQuery, record:any, attribute:string) {
            let me = this;
            this.apply(
                $clonedTemplate,
                "data-mt-" + attribute,
                function (key:string, $elem:JQuery) {
                    $elem.attr(attribute, me.returnValue(record, key));
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
        private apply($clonedTemplate:JQuery, attributeName:string, func:(attributeValue:string, $elem:JQuery)=>void) {
            let query:string = MTemplateJS.queryGenerator(attributeName),
                $elements:JQuery = $clonedTemplate.find(query);

            $elements.each(function (index:number, elem:Element) {
                func($(elem).attr(attributeName), $(elem));
            })
        }

        private returnValue(record:any, key:string):any {
            let keys:string[] = key.split("."),
                currentValue:any = record;
            for (var i:number = 0; i < keys.length; i++) {
                currentValue = currentValue[keys[i]];
            }
            return currentValue;
        }

        private static queryGenerator(attributeName:string):string {
            return "[" + attributeName + "]";
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
            return 'a' + (((1 + Math.random()) * 0x1000000) | 0).toString(16).substring(1);
        }
    }

    $.fn.mtemplatejs = function (data:any, option?:MTemplateJSOption) {
        if (option.beforeExecution)
            option.beforeExecution();

        //noinspection TypeScriptUnresolvedFunction
        let result = this.each(function (index:number, elem:Element) {
            (new MTemplateJS(elem, MTemplateJS.arrayGenerator(data), option)).run();
        });

        if (option.afterExecution)
            option.afterExecution();

        return result;
    };

})(jQuery);
