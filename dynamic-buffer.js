
function DynamicBuffer() {
    this.buffer = new Buffer(32);
    this.length = 0;
}

DynamicBuffer.prototype.ensureFree = function (bytes) {
    var needed = this.length + bytes;

    if (needed <= this.buffer.length)
        return;

    var size = this.buffer.length;
    while (size < needed)
        size *= 2;

    var old = this.buffer;
    this.buffer = new Buffer(size);
    old.copy(this.buffer);
}

DynamicBuffer.prototype.toBuffer = function () {
    return this.buffer.slice(0, this.length);
}

DynamicBuffer.prototype.align = function (size) {
    var padding = (size - this.length % size) % size;
    for (var i = 0; i < padding; i++)
        this.appendUInt8(0);
}

DynamicBuffer.prototype.append = function (string, encoding) {
    this.ensureFree(Buffer.byteLength(string, encoding) + 1);
    this.length += this.buffer.write(string, this.length);
}

DynamicBuffer.prototype.appendUInt8 = function (value) {
    this.ensureFree(1);
    this.length = this.buffer.writeUInt8(value, this.length);
}

DynamicBuffer.prototype.appendInt16 = function (value) {
    this.ensureFree(2);
    this.length = this.buffer.writeInt16LE(value, this.length);
}

DynamicBuffer.prototype.appendUInt16 = function (value) {
    this.ensureFree(2);
    this.length = this.buffer.writeUInt16LE(value, this.length);
}

DynamicBuffer.prototype.appendInt32 = function (value) {
    this.ensureFree(4);
    this.length = this.buffer.writeInt32LE(value, this.length);
}

DynamicBuffer.prototype.appendUInt32 = function (value) {
    this.ensureFree(4);
    this.length = this.buffer.writeUInt32LE(value, this.length);
}

DynamicBuffer.prototype.appendDouble = function (value) {
    this.ensureFree(8);
    this.length = this.buffer.writeDoubleLE(value, this.length);
}

module.exports = DynamicBuffer;
