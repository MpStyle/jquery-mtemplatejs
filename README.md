# jQuery - MTemplateJS
A template plugin for jQuery. Allows templating without dirtying the JavaScript code with HTML markup. Fast and simple.
A lot of attributes supported in only 2,3 KB.

## Include
```html
<script type="text/javascript" src="dist/jquery-mtemplatejs.min.js"></script>
```

## Template:
```html
<script id="..." type="text/html">
    ...
</script>
```

## Template attributes:
* data-mt-text
* data-mt-class
* data-mt-href
* data-mt-src
* data-mt-alt
* data-mt-data
* data-mt-title
* data-mt-func

## Container
```html
<div data-mt-use="..."></div>
```

## Fully example
```html

<div id="content" data-mt-use="template"></div>

<script id="template" type="text/html">
    <div>
        <span data-mt-text="name"></span>
        <span data-mt-class="css_class"></span>
        <a data-mt-href="home_page" data-mt-title="link_title">Link</a>
        <img data-mt-src="logo" src="" data-mt-alt="logo_alternative_text"/>
        <span data-mt-func="hello"></span>
    </div>
</script>

```
You can also use more than one template attribute in the same tag.
```javascript
$("#content").mtemplatejs(data, config);
```

Where _data_ could be:
```json
[
    {
        "name": "Mark Zucca",
        "css_class": "hidden",
        "home_page": "http://www.google.it",
        "logo": "http://www.google.it/logo.gif",
        "logo_alternative_text": "The logo of the company",
        "link_title": "Click to follow the link"
    },
    {
        "name": "Bill Gabbie",
        "css_class": "visible",
        "home_page": "http://www.yahoo.it",
        "logo": "http://www.yahoo.it/logo.gif",
        "logo_alternative_text": "The logo of the company",
        "link_title": "Click to follow the link"
    },
    ...
]
```

and _config_ could be:
```js
{
    directives: {
        'hello': function ($item, record) {
            $item.text("Hello world!");
        }
    },
    effect: 'fade',
    effectDuration: 1000
}
```

## Effects
The only effect supported when it is appending an item is fade.

## Sub-template
The support for the sub-template is guaranteed by the tag _data-mt-data_.

## Hook
There are some hooks which could be customized:
- **beforeExecution**: run before the execution of the library
- **afterExecution**: run after the execution of the library
- **beforeAppendItem**: run before append a new item 
- **afterAppendItem**: run after append a new item 

See the *hook* test

## Development
- Clone the repository
- Install NPM
- Install dev dependencies
```
npm install typings --global
```
- In the root of the project run:
```
npm install
```
And
```
typings install --ambient
```
To build run:
```
grunt
```

## History

### 0.0.17
- Add the possibility to navigate in the data, see the *navigatedata* test
- Add the hooks, see the *hook* test
- Improved performance

### 0.0.16
- The mt attributes will mantained when the plugin ends the execution.