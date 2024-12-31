function get(name) {
    return parseFloat(document.getElementById(name).value);
}

function fx(u, v) {
     return v * Math.cos(u);
}

function fy(u, v) {
    return v * Math.sin(u);
}

function fz(a, b, c, u) {
    return c * Math.sqrt(Math.pow(a, 2.0) - Math.pow(b, 2.0) * Math.pow(Math.cos(u), 2.0));
}

function generateSurface() {
    const a = get('A');
    const b = get('B');
    const c = get('C');

    const uSteps = get('USteps');
    const vSteps = get('VSteps');

    const uMin = 0.0;
    const uMax = Math.PI * 2;

    const vMin = 0.0;
    const vMax = get('VMax');

    const du = (uMax - uMin) / uSteps;
    const dv = (vMax - vMin) / vSteps;

    const vertices = [];
    const indices = [];
    
    for (let i = 0; i <= uSteps; i++) {
        const u = uMin + i * du;
        for (let j = 0; j <= vSteps; j++) {
            const v = vMin + j * dv;
     
            const x = fx(u, v);
            const y = fy(u, v);
            const z = fz(a, b, c, u);

            vertices.push(x, y, z);
        }
    }

    for (let i = 0; i <= uSteps; i++) {
        for (let j = 0; j <= vSteps; j++) {
            const currentIndex = i * (vSteps + 1) + j;
            const prevUIndex = (i - 1) * (vSteps + 1) + j;
            const prevVIndex = i * (vSteps + 1) + (j - 1);

            if(i > 0) {
                indices.push(currentIndex, prevUIndex);
            }

            if(j > 0) {
                indices.push(currentIndex, prevVIndex);
            }
        }
    }
    
    return { vertices, indices };
}


function Model() {
    this.iVertexBuffer = gl.createBuffer();
    this.iIndexBuffer = gl.createBuffer();
    this.count = 0;

    this.BufferData = function(vertices, indices) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.count = indices.length;
    };

    this.Draw = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);

        gl.drawElements(gl.LINES, this.count, gl.UNSIGNED_SHORT, 0);
    }

    this.CreateSurfaceData = function() {
        const { vertices, indices } = generateSurface();
        this.BufferData(vertices, indices);
    }
}
