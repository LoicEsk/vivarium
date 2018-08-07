(function() {
    var util = require('util');
    var MathUtil = require('./MathUtil');
    var Coordinate = require('./Coordinate');

    // Define the constructor
    function Vector(x, y) {
        Vector.super_.call(this, x, y);
    };

    util.inherits(Vector, Coordinate);


    /**
     * @return {!Vector} A random unit-length vector.
     */
    Vector.randomUnit = function() {
        var angle = Math.random() * Math.PI * 2;
        return new Vector(Math.cos(angle), Math.sin(angle));
    };


    /**
     * @return {!Vector} A random vector inside the unit-disc.
     */
    Vector.random = function() {
        var mag = Math.sqrt(Math.random());
        var angle = Math.random() * Math.PI * 2;

        return new Vector(Math.cos(angle) * mag, Math.sin(angle) * mag);
    };


    /**
     * Returns a new Vec2 object from a given coordinate.
     * @param {!Coordinate} a The coordinate.
     * @return {!Vector} A new vector object.
     */
    Vector.fromCoordinate = function(a) {
        return new Vector(a.x, a.y);
    };


    /**
     * @return {!Vector} A new vector with the same coordinates as this one.
     * @override
     */
    Vector.prototype.clone = function() {
        return new Vector(this.x, this.y);
    };


    /**
     * Returns the magnitude of the vector measured from the origin.
     * @return {number} The length of the vector.
     */
    Vector.prototype.magnitude = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };


    /**
     * Returns the squared magnitude of the vector measured from the origin.
     * NOTE(brenneman): Leaving out the square root is not a significant
     * optimization in JavaScript.
     * @return {number} The length of the vector, squared.
     */
    Vector.prototype.squaredMagnitude = function() {
        return this.x * this.x + this.y * this.y;
    };


    /**
     * @return {!Vector} This coordinate after scaling.
     * @override
     */
    Vector.prototype.scale =
    /** @type {function(number, number=):!Vector} */
        (Coordinate.prototype.scale);


    /**
     * Reverses the sign of the vector. Equivalent to scaling the vector by -1.
     * @return {!Vector} The inverted vector.
     */
    Vector.prototype.invert = function() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    };


    /**
     * Normalizes the current vector to have a magnitude of 1.
     * @return {!Vector} The normalized vector.
     */
    Vector.prototype.normalize = function() {
        return this.scale(1 / this.magnitude());
    };


    /**
     * Adds another vector to this vector in-place.
     * @param {!Coordinate} b The vector to add.
     * @return {!Vector}  This vector with {@code b} added.
     */
    Vector.prototype.add = function(b) {
        this.x += b.x;
        this.y += b.y;
        return this;
    };


    /**
     * Subtracts another vector from this vector in-place.
     * @param {!Coordinate} b The vector to subtract.
     * @return {!Vector} This vector with {@code b} subtracted.
     */
    Vector.prototype.subtract = function(b) {
        this.x -= b.x;
        this.y -= b.y;
        return this;
    };


    /**
     * Rotates this vector in-place by a given angle, specified in radians.
     * @param {number} angle The angle, in radians.
     * @return {!Vector} This vector rotated {@code angle} radians.
     */
    Vector.prototype.rotate = function(angle) {
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var newX = this.x * cos - this.y * sin;
        var newY = this.y * cos + this.x * sin;
        this.x = newX;
        this.y = newY;
        return this;
    };


    /**
     * Rotates a vector by a given angle, specified in radians, relative to a given
     * axis rotation point. The returned vector is a newly created instance - no
     * in-place changes are done.
     * @param {!Vector} v A vector.
     * @param {!Vector} axisPoint The rotation axis point.
     * @param {number} angle The angle, in radians.
     * @return {!Vector} The rotated vector in a newly created instance.
     */
    Vector.rotateAroundPoint = function(v, axisPoint, angle) {
        var res = v.clone();
        return res.subtract(axisPoint).rotate(angle).add(axisPoint);
    };


    /**
     * Compares this vector with another for equality.
     * @param {!Vector} b The other vector.
     * @return {boolean} Whether this vector has the same x and y as the given
     *     vector.
     */
    Vector.prototype.equals = function(b) {
        return this == b || !!b && this.x == b.x && this.y == b.y;
    };


    /**
     * Returns the distance between two vectors.
     * @param {!Coordinate} a The first vector.
     * @param {!Coordinate} b The second vector.
     * @return {number} The distance.
     */
    Vector.distance = Coordinate.distance;


    /**
     * Returns the squared distance between two vectors.
     * @param {!Coordinate} a The first vector.
     * @param {!Coordinate} b The second vector.
     * @return {number} The squared distance.
     */
    Vector.squaredDistance = Coordinate.squaredDistance;


    /**
     * Compares vectors for equality.
     * @param {!Coordinate} a The first vector.
     * @param {!Coordinate} b The second vector.
     * @return {boolean} Whether the vectors have the same x and y coordinates.
     */
    Vector.equals = Coordinate.equals;


    /**
     * Returns the sum of two vectors as a new Vec2.
     * @param {!Coordinate} a The first vector.
     * @param {!Coordinate} b The second vector.
     * @return {!Vector} The sum vector.
     */
    Vector.sum = function(a, b) {
        return new Vector(a.x + b.x, a.y + b.y);
    };


    /**
     * Returns the difference between two vectors as a new Vec2.
     * @param {!Coordinate} a The first vector.
     * @param {!Coordinate} b The second vector.
     * @return {!Vector} The difference vector.
     */
    Vector.difference = function(a, b) {
        return new Vector(a.x - b.x, a.y - b.y);
    };


    /**
     * Returns the unit vector pointing in the direction of those coordinate from given ones.
     * @param {!Coordinate} a A Coordinate.
     * @return {number} The vector.
     */
    Vector.directionFromTo = function(a, b) {
        var dir = Vector.difference(b, a);
        if (dir.x != 0 || dir.y != 0) {
            dir.normalize();
        }
        return dir;
    };

    /**
     * Returns the dot-product of two vectors.
     * @param {!Coordinate} a The first vector.
     * @param {!Coordinate} b The second vector.
     * @return {number} The dot-product of the two vectors.
     */
    Vector.dot = function(a, b) {
        return a.x * b.x + a.y * b.y;
    };


    /**
     * Returns a new Vec2 that is the linear interpolant between vectors a and b at
     * scale-value x.
     * @param {!Coordinate} a Vector a.
     * @param {!Coordinate} b Vector b.
     * @param {number} x The proportion between a and b.
     * @return {!Vector} The interpolated vector.
     */
    Vector.lerp = function(a, b, x) {
        return new Vector(MathUtil.lerp(a.x, b.x, x),
            MathUtil.lerp(a.y, b.y, x));
    };
    
    module.exports = Vector;
}).call(this);