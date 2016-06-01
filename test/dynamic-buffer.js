
var DynamicBuffer = require('../dynamic-buffer');
var assert = require('assert');

function assertContents(buf, data) {
    assert.deepStrictEqual(buf.toBuffer(), new Buffer(data));
}

describe('DynamicBuffer', function () {
    it('should write strings', function () {
        var buf = new DynamicBuffer();
        buf.append('foo');
        assertContents(buf, [0x66, 0x6f, 0x6f]);
    });

    it('should handle utf-8', function () {
        var buf = new DynamicBuffer();
        buf.append('ä');
        assertContents(buf, [0xc3, 0xa4]);
    });

    it('should grow automatically', function () {
        var buf = new DynamicBuffer();
        buf.appendUInt8(1);
        buf.appendUInt32(2);
        buf.appendUInt8(3);
        buf.append('foo');
        buf.appendUInt8(4);
        assertContents(buf, [ 0x1, 0x2, 0x0, 0x0, 0x0, 0x3, 0x66, 0x6f, 0x6f, 0x4 ]);
    });

    it('should write doubles', function () {
        var buf = new DynamicBuffer();
        buf.appendDouble(3.14);
        assertContents(buf, [ 0x1f, 0x85, 0xeb, 0x51, 0xb8, 0x1e, 0x9, 0x40 ]);
    });

    it('should add padding bytes when aligning', function () {
        var buf = new DynamicBuffer();
        buf.align(4);
        assertContents(buf, []);

        buf.appendUInt8(1);
        buf.align(4);
        buf.appendUInt32(1);
        assertContents(buf, [ 0x1, 0x0, 0x0, 0x0, 0x1, 0x0, 0x0, 0x0 ]);
    });
});
