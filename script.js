let params = {k1:0,k2:0,k3:0,p1:0,p2:0};
let undistort = false;
let img = null, tex = null;

const canvas = document.getElementById('gl');
const gl = canvas.getContext('webgl');
if(!gl) alert("WebGL not supported!");

document.getElementById('undistortToggle').addEventListener('change', e => undistort = e.target.checked);

const vs = `attribute vec2 a_pos; varying vec2 v_uv; void main(){ v_uv=a_pos*0.5+0.5; gl_Position=vec4(a_pos,0.,1.); }`;

const fs = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform float k1,k2,k3,p1,p2;
uniform bool undistort;
void main(){
    vec2 xy = v_uv - 0.5;
    float r2 = dot(xy, xy);
    float radial = 1.0 + k1*r2 + k2*r2*r2 + k3*r2*r2*r2;
    vec2 xy_d = undistort ? xy / radial : xy * radial;
    // tangential distortion
    xy_d += undistort ? vec2(0.0) : vec2(2.0*p1*xy.x*xy.y + p2*(r2+2.0*xy.x*xy.x),
                                      p1*(r2+2.0*xy.y*xy.y) + 2.0*p2*xy.x*xy.y);
    vec2 st = xy_d + 0.5;
    if(st.x < 0.0 || st.x > 1.0 || st.y < 0.0 || st.y > 1.0) gl_FragColor = vec4(0.,0.,0.,1.);
    else gl_FragColor = texture2D(u_tex, st);
}
`;

function compile(type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.error(gl.getShaderInfoLog(s));
    return s;
}

const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
gl.linkProgram(prog);
gl.useProgram(prog);

const posLoc = gl.getAttribLocation(prog,"a_pos");
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc,2,gl.FLOAT,false,0,0);

const u = name => gl.getUniformLocation(prog,name);

document.querySelectorAll('input[type=range]').forEach(sl=>{
    sl.addEventListener('input', e => params[e.target.id] = parseFloat(e.target.value));
});

document.getElementById('fileInput').addEventListener('change', e=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(ev){
        img = new Image();
        img.src = ev.target.result;
        img.onload = ()=>{
            canvas.width = img.width;
            canvas.height = img.height;
            gl.viewport(0,0,canvas.width,canvas.height);

            if(!tex) tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
            gl.uniform1i(u('u_tex'),0);
        }
    }
    reader.readAsDataURL(file);
});

function render(){
    if(img){
        for(const k of ['k1','k2','k3','p1','p2'])
            gl.uniform1f(u(k), params[k]);
        gl.uniform1i(u('undistort'), undistort ? 1 : 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES,0,6);
    }
    requestAnimationFrame(render);
}
render();
