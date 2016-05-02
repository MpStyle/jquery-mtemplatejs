// Type definitions for jQuery MTemplateJS
// Project: https://github.com/MpStyle/jquery-mtemplatejs

interface JQuery {
    mtemplatejs(data:any, directives?:{ [key:string]:($item:JQuery, record:any)=>void }): JQuery;
}