
var glibGVariant = require('bindings')('glib-gvariant');
var gvariant = require('./gvariant');
var assert = require('assert');

var ok = true;

[
    // type, gvariant text format, expected javascript value

    [ 'y', '42', 42 ],
    [ 'n', '-42', -42 ],
    [ 'q', '42', 42 ],
    [ 'i', '-42', -42 ],
    [ 'u', '42', 42 ],
    [ 'x', '-42', -42 ],
    [ 'x', '-1', -1 ],
    [ 'x', '42', 42 ],
    [ 'x', '5000000000', 5000000000 ],
    [ 'x', '-5000000000', -5000000000 ],
    [ 't', '42', 42 ],
    [ 't', '5000000000', 5000000000 ],
    [ 'd', '42.5', 42.5 ],
    [ 'b', 'true', true ],

    [ 's', '"foo"', 'foo' ],
    [ 's', '""', '' ],

    [ 'v', '<-1>', -1 ],
    [ '(buv)', '(false, 100, <"foo">)', [false, 100, 'foo'] ],

    [ '(u)', '(42,)', [42] ],
    [ '(u)', '(42,)', [42] ],
    [ '(bii)', '(true, 2, -4)', [true, 2, -4] ],

    [ 'ai', '[1, 2, -4]', [1, 2, -4] ],

    [ 'a{sv}', '{}', {} ],
    [ 'a{sv}', '{ "foo": <"bar">, "baz": <1> }', { 'foo': 'bar', 'baz': 1 } ],


    [ 'mu', '42', 42 ],
    [ 'mu', 'nothing', null ],

    [ 'amu', '[nothing, 1, nothing, 2, nothing]', [null, 1, null, 2, null] ],

].forEach(function (args, index) {
    var type = args[0];
    var text = args[1];
    var expected = args[2];

    var v;
    var o = null;

    try {
        v = glibGVariant.parse(type, text);
        o = gvariant.parse(type, v);
        assert.deepStrictEqual(o, expected);
    }
    catch (err) {
        console.error('Failed test for type "%s":', type);
        console.error('  Expected:', expected);
        console.error('  Got:     ', o);
        console.error();
        err.stack.split('\n').forEach(function (line) {
            console.error(' ', line);
        });

        ok = false;
    }
});

if (ok)
    console.log('All tests passed');

process.exit(ok ? 0 : 1);
