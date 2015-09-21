#define FACT 9000.0
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
    return normalize(texture2D(uNoise,  (uTick / FACT) * g * g * g / cTexDim).rg - cHalf);
}

float dotGradient(vec2 g, vec2 pos) {
    vec2 dist = pos - g;
    vec2 grad = gradient(g);
    return dot(grad, dist);
}

float fade(float w) {
    return w * w * w * (6.0 * w * w - 15.0 * w + 10.0);
}

void main() {
    // grid coordinates
    vec2 p = gl_FragCoord.xy / (uRes / cScale),
        g = floor(p), w = p - g;
    float tl = dotGradient(g, p);
    g += vec2(0.0, 1.0);
    float bl = dotGradient(g, p),
          left = mix(tl, bl, fade(w.y));
    g += vec2(1.0, -1.0);
    float tr = dotGradient(g, p);
    g += vec2(0.0, 1.0);
    float br = dotGradient(g, p),
          right = mix(tr, br, fade(w.y));
    float i = fade(mix(left, right, fade(w.x)) + 0.4);
    gl_FragColor = vec4(i, i, i, 1.0);
}
