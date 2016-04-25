
GVariant.js
===========

A JavaScript implementation of the GVariant serialization specification. It
maps serialized GVariants to native JavaScript values.

Only a reader is implemented at the moment. It can only handle little-endian
data in normal form.

```javascript
var gvariant = require('gvariant');

var data = new Buffer([0x2a, 0x0, 0x0, 0x0]);
var value = gvariant.parse('u', data);

console.log(value);
```

Type Mapping
------------

Booleans (`b`) map to JavaScript booleans.

Bytes (`y`) and all GVariant number types (`n`, `q`, `i`, `u`, `x`, `t`, and
`d`) map to JavaScript numbers. Note that precision can be lost for the 64 bit
integer types, because JavaScript represents numbers as IEEE 754 double
floating point values.

Strings (`s`) map to JavaScript strings. Object paths (`o`) and signatures
(`g`) are aliases for `s`.

Arrays (`a<type>`) map to the `Array` type, unless `<type>` is a dictionary
entry (`{}`), in which case they map to `Object`. Tuples (`()`) also map to
`Array`.


Variants (`v`) map to the JavaScript representation of their content. So do
maybe types (`m<type>`) in the `Just` case. In the `Nothing` case, maybes map
to `null`.


Testing
-------

The reader is tested with a node module that uses glib's GVariant
implementation to generate seralized variants. This test is not run by default,
so that people using gvariant.js don't have to have glib installed. Run them
with

    npm run test:glib
