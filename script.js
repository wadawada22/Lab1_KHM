function compileShader(gl, sourceCode, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Помилка компіляції шейдера:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function setupWebGL(canvas) {
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert('WebGL не підтримується, спроба experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }
    if (!gl) {
        alert('Браузер не підтримує WebGL');
        return null;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // чорний

    return gl;
}

// Прямокутник (квадрат)
const rectangleVertexShaderSource = `
    attribute vec4 aPosition;
    attribute vec4 aColor;
    uniform mat4 uRotationMatrix; // Матриця обертання
    varying vec4 vColor;

    void main() {
        gl_Position = uRotationMatrix * aPosition; // Здійснення обертання
        vColor = aColor;
    }
`;

const rectangleFragmentShaderSource = `
    precision mediump float;
    varying vec4 vColor;

    void main() {
        gl_FragColor = vColor;
    }
`;

function setupRectangleShaders(gl) {
    const vertexShader = compileShader(gl, rectangleVertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, rectangleFragmentShaderSource, gl.FRAGMENT_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.useProgram(program);

    return program;
}

function setupRectangle(gl, program) {
    const vertices = new Float32Array([
        //Лівий верхній трикутник
        -0.5,  0.5, 0.0, 1.0, 0.0, 0.0, 1.0, // верх.-лівий
        -0.5, -0.5, 0.0, 1.0, 0.0, 1.0, 1.0, // ниж.-лівий
         0.5,  0.5, 0.0, 0.0, 1.0, 1.0, 1.0, // верх.-правий 
        //Правий нижній трикутник
        -0.5, -0.5, 0.0, 0.0, 0.0, 1.0, 1.0, // ниж.-лівий
         0.5, -0.5, 0.0, 1.0, 0.5, 1.0, 1.0, // ниж.-правий
         0.5,  0.5, 0.0, 0.2, 0.0, 1.0, 1.0  // верх.-правий
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    const aColor = gl.getAttribLocation(program, 'aColor');

    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 7 * 4, 0);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 7 * 4, 3 * 4);
    gl.enableVertexAttribArray(aColor);
}

function createRotationMatrix(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [
        cos,  sin, 0, 0,
       -sin,  cos, 0, 0,
        0,    0,   1, 0,
        0,    0,   0, 1
    ];
}

let rectangleAngle = 0;

function renderRectangle(gl, program) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    const uRotationMatrix = gl.getUniformLocation(program, 'uRotationMatrix');
    const rotationMatrix = createRotationMatrix(rectangleAngle);
    
    gl.uniformMatrix4fv(uRotationMatrix, false, new Float32Array(rotationMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function animateRectangle(gl, program) {
    rectangleAngle += 0.01;
    renderRectangle(gl, program);
    requestAnimationFrame(() => animateRectangle(gl, program));
}

// Зірка
const starVertexShaderSource = `
    attribute vec4 aPosition;
    attribute vec4 aColor;
    uniform mat4 uTranslationMatrix; // Матриця для переміщення
    varying vec4 vColor;

    void main() {
        gl_Position = uTranslationMatrix * aPosition; // Здійснити переміщення
        vColor = aColor;
    }
`;

const starFragmentShaderSource = `
    precision mediump float;
    varying vec4 vColor;

    void main() {
        gl_FragColor = vColor;
    }
`;

function setupStarShaders(gl) {
    const vertexShader = compileShader(gl, starVertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, starFragmentShaderSource, gl.FRAGMENT_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.useProgram(program);

    return program;
}

function setupStar(gl, program) {
    const vertices = new Float32Array([
        0.0, 0.0, 0.0,   // Центр
        0.0, 0.5, 0.0,   // Верхня
        0.15, 0.15, 0.0, // Права-верхня
        0.5, 0.0, 0.0,   // Права
        0.15, -0.15, 0.0,// Права-нижня
        0.0, -0.5, 0.0,  // Нижня
        -0.15, -0.15, 0.0,// Ліва-нижня
        -0.5, 0.0, 0.0,  // Ліва
        -0.15, 0.15, 0.0,// Ліва-верхня
        0.0, 0.5, 0.0,   // Верхня - повтор
    ]);

    const colors = new Float32Array([
        0.247, 0.094, 1, 0.5, // Центр 
        1, 0.98, 0.749, 1.0, // Верхня 
        0.4, 0.6, 1.0, 1.0, // Права-верхня
        0.0, 0.2, 0.6, 1.0, // Права 
        0.2, 0.4, 0.8, 1.0, // Права-нижня 
        0.2, 0.4, 0.8, 1.0, // Нижня
        0.4, 0.6, 1.0, 1.0, // Ліва-нижня
        0.6, 0.8, 1.2, 1.0, // Ліва
        1, 0.565, 0.937, 1.0, // Ліва-Верхня 
        1, 0.98, 0.749, 1.0 // Верхня - повтор
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    const aColor = gl.getAttribLocation(program, 'aColor');

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);
}

function createTranslationMatrix(translationY) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, translationY, 0, 1
    ];
}

let translationY = 0.0;
let direction = 1;

function renderStar(gl, program, translationY) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    const uTranslationMatrix = gl.getUniformLocation(program, 'uTranslationMatrix');
    const translationMatrix = createTranslationMatrix(translationY);
    
    gl.uniformMatrix4fv(uTranslationMatrix, false, new Float32Array(translationMatrix));
    
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 12);
}

function animateStar(gl, program) {
    translationY += direction * 0.015;
    if (translationY > 0.5 || translationY < -0.5) {
        direction *= -1; // ЯЧкщо доходить до межі 
    }
    renderStar(gl, program, translationY);
    requestAnimationFrame(() => animateStar(gl, program));
}

function main() {
    // прямокутник
    const rectangleCanvas = document.getElementById('rectangle-canvas');
    const rectangleGl = setupWebGL(rectangleCanvas);
    if (!rectangleGl) return;

    const rectangleProgram = setupRectangleShaders(rectangleGl);
    setupRectangle(rectangleGl, rectangleProgram);
    animateRectangle(rectangleGl, rectangleProgram);

    // Зірка
    const starCanvas = document.getElementById('star-canvas');
    const starGl = setupWebGL(starCanvas);
    if (!starGl) return;

    const starProgram = setupStarShaders(starGl);
    setupStar(starGl, starProgram);
    animateStar(starGl, starProgram);
}

// onload 
window.onload = main;
