# jQuery - MTemplateJS

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
* data-mt-func

## Container
```html
<div data-mt-use="..."></div>
```

## Fully example
```html

<div id="content" data-mt-use="template"></div>

<script id="template" type="text/html">
    <span data-mt-text="aaa"></span>
    <span data-mt-class="bbb"></span>
    <span data-mt-href="ccc"></span>
    <span data-mt-func="ddd"></span>
</script>

```

```javascript
$("#content").mtemplatejs(data, config);
```

Where _data_ could be:
```json
[
    {
        "aaa": "Text 01",
        "bbb": "hidden",
        "ccc": "http://www.google.it"
    },
    {
        "aaa": "Text 02",
        "bbb": "visible",
        "ccc": "http://www.yahoo.it"
    },
    ...
]
```

and _config_ could be:
```js
{
    'ddd': function(record){
        return record.aaa.toUpperCase();
    }
}
```

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