const noiseArray = new ImageData(new Uint8ClampedArray([ 151, 160, 137, 91, 90, 15,
      131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142,
      8,99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0,26, 197, 62,
      94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87,
      174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
      77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92,
      41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73,
      209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159,
      86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5,
      202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58,
      17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163,
      70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108,
      110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34,
      242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249,
      14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176,
      115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29,
      24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180 ]), 8, 8);

const resX = 10, resY = 10;

var can, gl, gradient, posTick, t = 0;

function V() {
    this.x = this.y = 0;
}

V.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
}

V.prototype.r = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
}

V.prototype.norm = function() {
    var r = this.r();
    this.x /= r;
    this.y /= r;
}

function randRange(s, e) {
    return s + (e - s) * Math.random();
}

function Gradient(posGrad) {
    var size = resX * resY;
    this._arr = new Float32Array(size * 2);
    this._vs = new Array(size);
    this.posGrad = posGrad;
    var i, j, pos, v;
    for (i = 0; i < resX; i++) {
        for (j = 0; j < resY; j++) {
            v = new V();
            v.set(randRange(-1, 1), randRange(-1, 1));
            v.norm();
            this._vs[pos] = v;
        }
    }
    this._sync();
}

Gradient.prototype._sync = function() {
    var i, j, pos;
    for (i = 0; i < resX; i++) {
        for (j = 0; j < resY; j++) {
            pos = j * resX + i;
            this._arr[pos] = randRange(-1, 1);
            this._arr[pos + 1] = randRange(-1, 1);
        }
    }
    gl.uniform2fv(this.posGrad, this._arr);
}

Gradient.prototype.update = function() {
    this._sync();
}

function initShader(name, type) {
    var shader = gl.createShader(type),
        src = document.getElementById(name + '-shader');
    gl.shaderSource(shader, src.getAttribute('data-text'));
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw 'compile failed, ' + gl.getShaderInfoLog(shader);
    }
    return shader;
}

function initProgram() {
    var program = gl.createProgram(),
        vertShader = initShader('vertex', gl.VERTEX_SHADER),
        fragShader = initShader('fragment', gl.FRAGMENT_SHADER);
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program);
        throw 'link failed, ' + gl.getProgramInfoLog(program);
    }
    return program;
}

function loadTextures() {
    var noiseTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, noiseTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, noiseArray);
}

function initGL(program) {
    gl.clearColor(0, 0, 0, 1);
    gl.useProgram(program);
    var posLoc = gl.getAttribLocation(program, 'aPosition'),
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array([
                -1, -1,
                +1, -1,
                -1, +1,
                -1, +1,
                +1, -1,
                +1, +1]),
            gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    var posRes = gl.getUniformLocation(program, 'uRes');
    gl.uniform2f(posRes, can.width, can.height);
    var posGrad = gl.getUniformLocation(program, 'uGrad');
    gradient = new Gradient(posGrad);
    loadTextures();
    var posNoise = gl.getUniformLocation(program, 'uNoise');
    gl.uniform1i(posNoise, 0);
    posTick = gl.getUniformLocation(program, 'uTick');
}

function tick() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gradient.update();
    gl.uniform1f(posTick, t);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    t++;
    requestAnimationFrame(tick);
}

function loadShaders() {
    var scripts = document.querySelectorAll('script[type=shader]'),
        c = 0,
        i, xhr, script;
    function cb(script) {
        return function() {
            if (this.status !== 200) {
                throw 'failed to load script ' + script.src;
            }
            script.setAttribute('data-text', this.responseText);
            c++;
            if (c === scripts.length) {
                init();
            }
        }
    }
    for (i = 0; i < scripts.length; i++) {
        script = scripts[i];
        xhr = new XMLHttpRequest();
        xhr.open('GET', script.src, true);
        xhr.onload = cb(script);
        xhr.send();
    }
}

function init() {
    var program = initProgram();
    initGL(program);
    tick();
}

window.onload = function() {
    can = document.getElementById('game-canvas');
    can.width = document.documentElement.clientWidth;
    can.height = document.documentElement.clientHeight;
    gl = can.getContext('webgl');
    loadShaders();
}
