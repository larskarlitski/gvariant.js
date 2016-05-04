
var gvariant = require('../gvariant');
var assert = require('assert');

describe('gvariant.parse()', function () {

    it('should map gvariant booleans to javascript booleans', function () {
        assert.strictEqual(gvariant.parse('b', [ 0x0 ]), false);
        assert.strictEqual(gvariant.parse('b', [ 0x1 ]), true);
    });

    it('should map gvariant integer types to javascript numbers', function () {
        assert.strictEqual(gvariant.parse('y', [ 0x2a ]), 42);

        assert.strictEqual(gvariant.parse('n', [ 0xffffffd6, 0xffffffff ]), -42);
        assert.strictEqual(gvariant.parse('q', [ 0x2a, 0x0 ]), 42);

        assert.strictEqual(gvariant.parse('i', [ 0xffffffd6, 0xffffffff, 0xffffffff, 0xffffffff ]), -42);
        assert.strictEqual(gvariant.parse('u', [ 0x2a, 0x0, 0x0, 0x0 ]), 42);

        assert.strictEqual(gvariant.parse('x', [ 0xffffffd6, 0xffffffff, 0xffffffff, 0xffffffff,
                                                 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff ]), -42);
        assert.strictEqual(gvariant.parse('t', [ 0x2a, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0 ]), 42);
    });

    it('should be able to read integers larger than 32 bits', function () {
        assert.strictEqual(gvariant.parse('x', [ 0x0, 0xe, 0xfffffffa, 0xffffffd5,
                                                 0xfffffffe, 0xffffffff, 0xffffffff, 0xffffffff ]), -5000000000);
        assert.strictEqual(gvariant.parse('x', [ 0x0, 0xfffffff2, 0x5, 0x2a, 0x1, 0x0, 0x0, 0x0 ]), 5000000000);
    });

    it('should map gvariant doubles to javascript numbers', function () {
        assert.strictEqual(gvariant.parse('d', [ 0x0, 0x0, 0x0, 0x0, 0x0, 0x40, 0x45, 0x40 ]), 42.5);
    });

    it('should map gvariant strings to javascript strings', function () {
        assert.strictEqual(gvariant.parse('s', [ 0x0 ]), '');
        assert.strictEqual(gvariant.parse('s', [ 0x61, 0x62, 0x63, 0x0 ]), 'abc');
    });

    it('should map variants to their contents', function () {
        assert.strictEqual(gvariant.parse('v', [ 0x2a, 0x0, 0x0, 0x0, 0x0, 0x69 ]), 42);
    });

    it('should map maybes to null or their contents', function () {
        assert.strictEqual(gvariant.parse('my', []), null);
        assert.strictEqual(gvariant.parse('my', [ 0x2a ]), 42);
        assert.strictEqual(gvariant.parse('ms', []), null);
        assert.strictEqual(gvariant.parse('ms', [ 0x61, 0x62, 0x63, 0x0, 0x0 ]), 'abc');
    });

    it('should map arrays to javascript arrays', function () {
        assert.deepStrictEqual(gvariant.parse('ay', []), []);
        assert.deepStrictEqual(gvariant.parse('ay', [ 0x1, 0x2, 0x3 ]), [1, 2, 3]);
        assert.deepStrictEqual(gvariant.parse('as', []), []);
        assert.deepStrictEqual(gvariant.parse('as', [ 0x61, 0x62, 0x63, 0x0,
                                                      0x78, 0x0,
                                                      0x79, 0x7a, 0x0,
                                                      0x4, 0x6, 0x9 ]), [ 'abc', 'x', 'yz' ]);
    });

    it('should map tuples to javascript arrays', function () {
        assert.deepStrictEqual(gvariant.parse('()', []), []);
        assert.deepStrictEqual(gvariant.parse('(bus)', [ 0x1, 0x0, 0x0, 0x0,
                                                         0x2a, 0x0, 0x0, 0x0,
                                                         0x61, 0x62, 0x63, 0x0 ]), [ true, 42, 'abc' ]);
        assert.deepStrictEqual(gvariant.parse('(bsy)', [ 0x1, 0x61, 0x62, 0x63, 0x0, 0x2a, 0x5 ]),
                               [ true, 'abc', 42 ]);
    });

    it('should map dictionaries to javascript objects', function () {
        assert.deepStrictEqual(gvariant.parse('a{sv}', []), {});
        assert.deepStrictEqual(gvariant.parse('a{sv}', [ 0x61, 0x62, 0x63, 0x0,
                                                         0x0, 0x0, 0x0, 0x0,
                                                         0x2a, 0x0, 0x0, 0x0,
                                                         0x0, 0x69, 0x4, 0x0,
                                                         0x64, 0x65, 0x66, 0x0,
                                                         0x0, 0x0, 0x0, 0x0,
                                                         0x2b, 0x0, 0x0, 0x0,
                                                         0x0, 0x69, 0x4, 0xf, 0x1f ]), { abc: 42, def: 43 });
    });
});
