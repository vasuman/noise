#define LOOP 10.0
#define W 8
#define H 8

precision mediump float;

uniform vec2 uRes;
uniform float uTick;
uniform sampler2D uNoise;

const vec2 cTexDim = vec2(float(W), float(H));
const vec2 cScale = vec2(10.0, 10.0);
const vec2 cHalf = vec2(0.5, 0.5);

vec2 gradient(vec2 g) {
    return normalize(texture2D(uNoise,  g * g / cTexDim).rg - cHalf);
}

float dotGradient(vec2 g, vec2 pos) {
    vec2 dist = pos - g;
    vec2 grad = gradient(g);
    return dot(grad, dist);
}

float intrp(float a, float b, float w) {
    float f = w * w * w * (6.0 * w * w - 15.0 * w + 10.0);
    return a * (1.0 - f) + b * f;
}

void main() {
    // grid coordinates
    vec2 p = gl_FragCoord.xy / (uRes / cScale),
        g = floor(p), w = p - g;
    float tl = dotGradient(g, p);
    g += vec2(0.0, 1.0);
    float bl = dotGradient(g, p),
          left = intrp(tl, bl, w.y);
    g += vec2(1.0, -1.0);
    float tr = dotGradient(g, p);
    g += vec2(0.0, 1.0);
    float br = dotGradient(g, p),
          right = intrp(tr, br, w.y);
    float i = intrp(left, right, w.x) + 0.3;
    gl_FragColor = vec4(i, i, i, 1.0);
}
