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

function dx_du(u, v) {
    return -v * Math.sin(u);
}

function dx_dv(u, v) {
    return Math.cos(u);
}

function dy_du(u, v) {
    return v * Math.cos(u);
}

function dy_dv(u, v) {
    return Math.sin(u);
}

function dz_du(a, b, c, u) {
    let numerator = c * b * b * Math.sin(2 * u);
    let denominator = 2 * Math.sqrt(Math.pow(a, 2) - Math.pow(b, 2) * Math.pow(Math.cos(u), 2));
    let result = numerator / denominator;
    
    if(!isFinite(result) || isNaN(result))  {
        return numerator < 0.0 ? -100 : 100;
    }
    return result;
}


function dz_dv(a, b, c, u) {
    return 0;
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
    const normals = [];

    for (let i = 0; i <= uSteps; i++) {
        const u = uMin + i * du;
        for (let j = 0; j <= vSteps; j++) {
            const v = vMin + j * dv;

            const x = fx(u, v);
            const y = fy(u, v);
            const z = fz(a, b, c, u);

            vertices.push(x, y, z);

            const tangent_u = m4.normalize([
                dx_du(u, v),
                dy_du(u, v),
                dz_du(a, b, c, u)
            ], [0, 0, 1]);

            const tangent_v = m4.normalize([
                dx_dv(u, v),
                dy_dv(u, v),
                dz_dv(a, b, c, u)
            ], [1, 0, 0]);

            normals.push(...m4.normalize(m4.cross(tangent_u, tangent_v, []), [0, 1, 0]));
        }
    }

    for (let i = 0; i < uSteps; i++) {
        for (let j = 0; j < vSteps; j++) {
            const topLeft = i * (vSteps + 1) + j;
            const topRight = i * (vSteps + 1) + (j + 1);
            const bottomLeft = (i + 1) * (vSteps + 1) + j;
            const bottomRight = (i + 1) * (vSteps + 1) + (j + 1);

            indices.push(topLeft, bottomLeft, bottomRight);
            indices.push(topLeft, bottomRight, topRight);
        }
    }

    return { vertices, normals, indices };
}

export default function Model(gl, shProgram) {
    this.iVertexBuffer = gl.createBuffer();
    this.iNormalBuffer = gl.createBuffer();
    this.iIndexBuffer = gl.createBuffer();
    this.count = 0;

    this.BufferData = function(vertices, normals, indices) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.count = indices.length;
    };

    this.Draw = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.vertexAttribPointer(shProgram.iAttribNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribNormal);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);

        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    }

    this.CreateSurfaceData = function() {
        const { vertices, normals, indices } = generateSurface();
        this.BufferData(vertices, normals, indices);
    }
}
