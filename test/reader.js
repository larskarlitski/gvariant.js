
var gvariant = require('../gvariant');
var assert = require('assert');

describe('gvariant.parse()', function () {

    it('should throw an error when passed invalid type strings', function () {
        assert.throws(function () { gvariant.parse('bb'); }, TypeError);
        assert.throws(function () { gvariant.parse(''); }, TypeError);
        assert.throws(function () { gvariant.parse('ä'); }, TypeError);
        assert.throws(function () { gvariant.parse('(a'); }, TypeError);
    });

    it('should map gvariant booleans to javascript booleans', function () {
        assert.strictEqual(gvariant.parse('b', [ 0x0 ]), false);
        assert.strictEqual(gvariant.parse('b', [ 0x1 ]), true);
    });

    it('should map gvariant integer types to javascript numbers', function () {
        assert.strictEqual(gvariant.parse('y', [ 0x2a ]), 42);

        assert.strictEqual(gvariant.parse('n', [ 0xd6, 0xff ]), -42);
        assert.strictEqual(gvariant.parse('q', [ 0x2a, 0x0 ]), 42);

        assert.strictEqual(gvariant.parse('i', [ 0xd6, 0xff, 0xff, 0xff ]), -42);
        assert.strictEqual(gvariant.parse('u', [ 0x2a, 0x0, 0x0, 0x0 ]), 42);

        assert.strictEqual(gvariant.parse('x', [ 0xd6, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff ]), -42);
        assert.strictEqual(gvariant.parse('t', [ 0x2a, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0 ]), 42);
    });

    it('should be able to read large integers', function () {
        ['x', 't'].forEach(function (type) {
            assert.strictEqual(gvariant.parse(type, [ 0x60, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0 ]), 96);
            assert.strictEqual(gvariant.parse(type, [ 0x0, 0xc, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0 ]), 3072);
            assert.strictEqual(gvariant.parse(type, [ 0x0, 0x80, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0 ]), 98304);
            assert.strictEqual(gvariant.parse(type, [ 0x0, 0x0, 0x30, 0x0, 0x0, 0x0, 0x0, 0x0 ]), 3145728);
            assert.strictEqual(gvariant.parse(type, [ 0x0, 0x0, 0x0, 0x6, 0x0, 0x0, 0x0, 0x0 ]), 100663296);
            assert.strictEqual(gvariant.parse(type, [ 0x0, 0x0, 0x0, 0xc0, 0x0, 0x0, 0x0, 0x0 ]), 3221225472);
            assert.strictEqual(gvariant.parse(type, [ 0x0, 0x0, 0x0, 0x0, 0x18, 0x0, 0x0, 0x0 ]), 103079215104);
            assert.strictEqual(gvariant.parse(type, [ 0x0, 0x0, 0x0, 0x0, 0x0, 0x3, 0x0, 0x0 ]), 3298534883328);
            assert.strictEqual(gvariant.parse(type, [ 0x0, 0x0, 0x0, 0x0, 0x0, 0x60, 0x0, 0x0 ]), 105553116266496);
            assert.strictEqual(gvariant.parse(type, [ 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xc, 0x0 ]), 3377699720527872);
        });

        assert.strictEqual(gvariant.parse('x', [ 0xa0, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff ]), -96);
        assert.strictEqual(gvariant.parse('x', [ 0x0, 0xf4, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff ]), -3072);
        assert.strictEqual(gvariant.parse('x', [ 0x0, 0x80, 0xfe, 0xff, 0xff, 0xff, 0xff, 0xff ]), -98304);
        assert.strictEqual(gvariant.parse('x', [ 0x0, 0x0, 0xd0, 0xff, 0xff, 0xff, 0xff, 0xff ]), -3145728);
        assert.strictEqual(gvariant.parse('x', [ 0x0, 0x0, 0x0, 0xfa, 0xff, 0xff, 0xff, 0xff ]), -100663296);
        assert.strictEqual(gvariant.parse('x', [ 0x0, 0x0, 0x0, 0x40, 0xff, 0xff, 0xff, 0xff ]), -3221225472);
        assert.strictEqual(gvariant.parse('x', [ 0x0, 0x0, 0x0, 0x0, 0xe8, 0xff, 0xff, 0xff ]), -103079215104);
        assert.strictEqual(gvariant.parse('x', [ 0x0, 0x0, 0x0, 0x0, 0x0, 0xfd, 0xff, 0xff ]), -3298534883328);
        assert.strictEqual(gvariant.parse('x', [ 0x0, 0x0, 0x0, 0x0, 0x0, 0xa0, 0xff, 0xff ]), -105553116266496);
        assert.strictEqual(gvariant.parse('x', [ 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff ]), -3377699720527872);
    });

    it('should map gvariant doubles to javascript numbers', function () {
        assert.strictEqual(gvariant.parse('d', [ 0x0, 0x0, 0x0, 0x0, 0x0, 0x40, 0x45, 0x40 ]), 42.5);
    });

    it('should map gvariant strings to javascript strings', function () {
        assert.strictEqual(gvariant.parse('s', [ 0x0 ]), '');
        assert.strictEqual(gvariant.parse('s', [ 0x61, 0x62, 0x63, 0x0 ]), 'abc');
    });

    it('should map variants to an object with the variant\'s type and value', function () {
        assert.deepStrictEqual(gvariant.parse('v', [ 0x2a, 0x0, 0x0, 0x0, 0x0, 0x69 ]), { type: 'i', value: 42 });
        assert.deepStrictEqual(gvariant.parse('v', [ 0x2a, 0x0, 0x61, 0x79 ]), { type: 'ay', value: [ 42 ] });
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
                                                         0x0, 0x69, 0x4, 0xf, 0x1f ]),
                               { abc: { type: 'i', value: 42 }, def: { type: 'i', value: 43 } });
    });

    describe('should handle non-normal serialized data:', function () {

        it('wrong size for fixed size value', function () {
            assert.strictEqual(gvariant.parse('b', [ 0x1, 0x1, 0x1 ]), false);
            assert.strictEqual(gvariant.parse('y', []), 0);
            assert.strictEqual(gvariant.parse('u', [ 0x0, 0x1 ]), 0);
            assert.strictEqual(gvariant.parse('x', [ 0x0, 0x1, 0x2, 0x3 ]), 0);
        });

        it('boolean out of range', function () {
            assert.strictEqual(gvariant.parse('b', [ 0x2a ]), true);
        });

        it('possibly unterminated string', function () {
            assert.strictEqual(gvariant.parse('s', [ 0x61 ]), '');
        });

        it('string with embedded nul', function () {
            assert.strictEqual(gvariant.parse('s', [ 0x61, 0x0, 0x61, 0x0  ]), 'a');
        });

        it('wrong size for fixed size maybe', function () {
            assert.strictEqual(gvariant.parse('my', [ ]), null);
            assert.strictEqual(gvariant.parse('mu', [ 0x1, 0x2, 0x3, 0x4, 0x5]), null);
        });

        it('wrong size for fixed width array', function () {
            assert.deepStrictEqual(gvariant.parse('aq', [ 0x1 ]), []);
        });
    });
});
