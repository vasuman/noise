#define RES_X 10
#define RES_Y 10
#define LOOP 10.0

precision mediump float;

uniform vec2 uRes;
uniform vec2 uGrad[RES_X * RES_Y];
uniform float uTick;

void main() {
    vec2 n = gl_FragCoord.xy / uRes;
    gl_FragColor = vec4(n.x, n.y * sin(uTick / LOOP), 1.0, 1.0);
}
