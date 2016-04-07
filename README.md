# mTemplatejs

## Include
```html
<script type="text/javascript" src="dist/jquery-mtemplatejs.min.js"></script>
```

## Template:
```html
<script mt="..." type="text/html">
    ...
</script>
```

## Template attributes:
* mt-text
* mt-class
* mt-href
* mt-func

## Container
```html
<div mt-use="..."></div>
```

## Fully example
```html

<div id="content" mt-use="template"></div>

<script mt="template" type="text/html">
    <span mt-text="aaa"></span>
    <span mt-class="bbb"></span>
    <span mt-href="ccc"></span>
    <span mt-func="ddd"></span>
</script>

```

```javascript
$("#content").mtemplatejs(data, config);
```

Where _data_ could be:
```json
[
    {
        aaa: 'Text 01',
        bbb: 'hidden',
        ccc: 'http://www.google.it'
    },
    {
        aaa: 'Text 02',
        bbb: 'visible',
        ccc: 'http://www.yahoo.it'
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