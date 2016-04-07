// Type definitions for jQuery MTemplateJS
// Project: https://github.com/MpStyle/jquery-mtemplatejs

/// <reference path="libs/jquery.d.ts"/>

interface JQuery {
    mtemplatejs(data:JQuery, directives?:{ [key:string]:($item:JQuery, record:any)=>void }): JQuery;
}