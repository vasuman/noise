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
        throw 'link failed, ' + gl.getProgramInfoLog(program);
    }
    return program;
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
            console.log(script, this);
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
