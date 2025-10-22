const canvas = document.getElementById('gl');
const gl = canvas.getContext('webgl');
if(!gl) alert("WebGL not supported!");

let img = null, tex = null;
let params = {k1:0,k2:0,k3:0,p1:0,p2:0};
let undistort = false;

document.getElementById('undistortToggle').addEventListener('change', e => undistort = e.target.checked);
document.querySelectorAll('input[type=range]').forEach(sl => {
    sl.addEventListener('input', e => params[e.target.id] = parseFloat(e.target.value));
});

document.getElementById('fileInput').addEventListener('change', e=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev=>{
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
        }
    }
    reader.readAsDataURL(file);
});

// Load shaders via fetch
async function loadShader(url, type){
    const res = await fetch(url);
    const src = await res.text();
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        console.error(gl.getShaderInfoLog(shader));
    return shader;
}

async function init() {
    const vs = await loadShader('vertex.glsl', gl.VERTEX_SHADER);
    const fs = await loadShader('fragment.glsl', gl.FRAGMENT_SHADER);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const posLoc = gl.getAttribLocation(prog,"a_pos");
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc,2,gl.FLOAT,false,0,0);

    const u = name => gl.getUniformLocation(prog,name);

    function render(){
        if(img){
            for(const k of ['k1','k2','k3','p1','p2'])
                gl.uniform1f(u(k), params[k]);
            gl.uniform1i(u('undistort'), undistort ? 1 : 0);
            gl.uniform1i(u('u_tex'), 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES,0,6);
        }
        requestAnimationFrame(render);
    }
    render();
}

init();
