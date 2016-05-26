
function align(n, size) {
    var r = n % size;
    return r === 0 ? n : n + size - r;
}

function offsetInfo(buf, start, end) {
    if (end - start <= 0xff)
        return { size: 1, read: function (i) { return start + buf.readUInt8(end + i); } };
    else if (end - start <= 0xffff)
        return { size: 2, read: function (i) { return start + buf.readUInt16LE(end + 2 * i); } };
    else if (end - start <= 0xffffffff)
        return { size: 4, read: function (i) { return start + buf.readUInt32LE(end + 4 * i); } };
    else
        throw RangeError();
}

function nextType(signature, index) {
    switch (signature[index]) {
        case 'y':
            return {
                id: 'y',
                fixedSize: 1,
                alignment: 1,
                defaultValue: 0,
                read: function (buf, start, end) {
                    if (end - start !== 1)
                        return this.defaultValue;
                    return buf.readUInt8(start);
                }
            };

        case 'n':
            return {
                id: 'n',
                fixedSize: 2,
                alignment: 2,
                defaultValue: 0,
                read: function (buf, start, end) {
                    if (end - start !== 2)
                        return this.defaultValue;
                    return buf.readInt16LE(start);
                }
            };

        case 'q':
            return {
                id: 'q',
                fixedSize: 2,
                alignment: 2,
                defaultValue: 0,
                read: function (buf, start, end) {
                    if (end - start !== 2)
                        return this.defaultValue;
                    return buf.readUInt16LE(start);
                }
            };

        case 'i':
            return {
                id: 'i',
                fixedSize: 4,
                alignment: 4,
                defaultValue: 0,
                read: function (buf, start, end) {
                    if (end - start !== 4)
                        return this.defaultValue;
                    return buf.readInt32LE(start);
                }
            };

        case 'u':
            return {
                id: 'u',
                fixedSize: 4,
                alignment: 4,
                defaultValue: 0,
                read: function (buf, start, end) {
                    if (end - start !== 4)
                        return this.defaultValue;
                    return buf.readUInt32LE(start);
                }
            };

        case 'x':
            return {
                id: 'x',
                fixedSize: 8,
                alignment: 8,
                defaultValue: 0,
                read: function (buf, start, end) {
                    if (end - start !== 8)
                        return this.defaultValue;
                    var lo = buf.readUInt32LE(start);
                    var hi = buf.readUInt32LE(start + 4);
                    if (hi > 0x7fffffff)
                        return - ((~hi * 0x100000000) + ~lo + 1);
                    return (hi * 0x100000000) + lo;
                }
            };

        case 't':
            return {
                id: 't',
                fixedSize: 8,
                alignment: 8,
                defaultValue: 0,
                read: function (buf, start, end) {
                    if (end - start !== 8)
                        return this.defaultValue;
                    var lo = buf.readUInt32LE(start);
                    var hi = buf.readUInt32LE(start + 4);
                    return (hi * 0x100000000) + lo;
                }
            };

        case 'd':
            return {
                id: 'd',
                fixedSize: 8,
                alignment: 8,
                defaultValue: 0.0,
                read: function (buf, start, end) {
                    if (end - start !== 8)
                        return this.defaultValue;
                    return buf.readDoubleLE(start);
                }
            };

        case 'b':
            return {
                id: 'b',
                fixedSize: 1,
                alignment: 1,
                defaultValue: false,
                read: function (buf, start, end) {
                    if (end - start !== 1)
                        return this.defaultValue;
                    return !!buf.readUInt8(start);
                }
            };

        case 's':
        case 'o':
        case 'g':
            return {
                id: signature[index],
                alignment: 1,
                defaultValue: '',

                read: function (buf, start, end) {
                    if (start === end || buf.readUInt8(end - 1) !== 0)
                        return this.defaultValue;

                    var str = buf.toString('utf-8', start, end - 1); // skip \0
                    var nul = str.indexOf('\0');
                    if (nul >= 0)
                        return str.substring(0, nul);
                    return str;
                }
            };

        case 'v':
            return {
                id: 'v',
                alignment: 8,
                defaultValue: { type: '()', value: [] },

                read: function (buf, start, end) {
                    var sep = end - 1;

                    while (sep >= start) {
                        if (buf.readUInt8(sep) === 0)
                            break;
                        sep -= 1;
                    }

                    var type = buf.toString('ascii', sep + 1, end);
                    var data = buf.slice(start, sep);

                    return {
                        type: type,
                        value: parse(type, data)
                    };
                }
            };

        case 'm':
            var maybeElement = nextType(signature, index + 1);

            return {
                id: signature.substr(index, maybeElement.id.length + 1),
                alignment: maybeElement.alignment,
                element: maybeElement,
                defaultValue: null,

                read: function (buf, start, end) {

                    // Nothing
                    if (start === end)
                        return null;

                    // Just
                    if (this.element.fixedSize) {
                        if (end - start !== this.element.fixedSize)
                            return null;

                        return this.element.read(buf, start, end);
                    }
                    else {
                        return this.element.read(buf, start, end - 1);
                    }
                }
            };

        case '(':
            var end = index + 1;
            var elements = [];
            var size = 0;
            var alignment = 1;
            while (signature[end] !== ')') {
                var el = nextType(signature, end);
                elements.push(el);
                size = align(size, el.alignment) + el.fixedSize;
                alignment = Math.max(alignment, el.alignment);
                end += el.id.length;
            }
            if (size === 0)
                size = 1;
            return {
                id: signature.slice(index, end + 1),
                elements: elements,
                fixedSize: size,
                alignment: alignment,
                defaultValue: elements.map(function (el) { return el.defaultValue; }),

                read: function (buf, start, end) {
                    if (this.fixedSize && end - start !== this.fixedSize)
                        return this.defaultValue;

                    var offsets = offsetInfo(buf, start, end);
                    var values = [];
                    var cur = start;
                    var curOffset = 0;
                    for (var i = 0; i < this.elements.length; i++) {
                        var el = this.elements[i];
                        cur = align(cur, el.alignment);
                        var next;
                        if (el.fixedSize)
                            next = cur + el.fixedSize;
                        else if (i < this.elements.length - 1)
                            next = offsets.read(--curOffset);
                        else
                            next = end - offsets.size * -curOffset;
                        values.push(el.read(buf, cur, next));
                        cur = next;
                    }
                    return values;
                }
            };

        case '{':
            var key = nextType(signature, index + 1);
            var value = nextType(signature, index + 1 + key.id.length);

            return {
                id: signature.substr(index, key.id.length + value.id.length + 2),
                key: key,
                value: value,
                fixedSize: align(key.fixedSize, value.alignment) + value.fixedSize,
                alignment: Math.max(key.alignment, value.alignment),
                defaultValue: [ key.defaultValue, value.defaultValue ],

                read: function (buf, start, end) {
                    if (this.fixedSize && end - start !== this.fixedSize)
                        return this.defaultValue;

                    var offsets = offsetInfo(buf, start, end);
                    var keyEnd, valueEnd;

                    if (this.key.fixedSize) {
                        keyEnd = start + this.key.fixedSize;
                        valueEnd = end;
                    }
                    else {
                        keyEnd = offsets.read(-1);
                        valueEnd = end - offsets.size;
                    }
                    return [
                        this.key.read(buf, start, keyEnd),
                        this.value.read(buf, align(keyEnd, this.value.alignment), valueEnd)
                    ];
                }
            };

        case 'a':
            var element = nextType(signature, index + 1);

            return {
                id: signature.substr(index, element.id.length + 1),
                alignment: element.alignment,
                element: element,
                defaultValue: [],

                read: function (buf, start, end) {
                    if (start == end)
                        return this.element.id[0] === '{' ? {} : [];

                    var values = [];
                    var size = end - start;
                    var i, n, cur, offsets;

                    if (this.element.fixedSize) {
                        if (size % this.element.fixedSize !== 0)
                            return [];

                        n = size / this.element.fixedSize;
                        cur = start;
                        for (i = 0; i < n; i++) {
                            values.push(this.element.read(buf, cur, cur + this.element.fixedSize));
                            cur += this.element.fixedSize;
                        }
                    }
                    else {
                        offsets = offsetInfo(buf, start, end);
                        n = (end - offsets.read(-1)) / offsets.size;
                        cur = start;
                        for (i = 0; i < n; i++) {
                            var next = offsets.read(-n + i);
                            values.push(this.element.read(buf, cur, next));
                            cur = align(next, this.element.alignment);
                        }
                    }

                    if (this.element.id[0] === '{')
                        values = values.reduce(function (o, v) { o[v[0]] = v[1]; return o; }, {});

                    return values;
                }
            };
    }
}

function parse(typestr, data) {
    if (Array.isArray(data))
        data = new Buffer(data);

    var type = nextType(typestr, 0);
    if (!type || type.id.length !== typestr.length)
        throw new TypeError('invalid type string: ' + typestr);

    return type.read(data, 0, data.length);
}

exports.parse = parse;
