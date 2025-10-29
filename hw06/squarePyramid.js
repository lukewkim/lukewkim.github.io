export class SquarePyramid
{
    constructor(gl)
    {
        this.gl = gl;
        
        // Creating VAO and buffers
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        this.vertices = new Float32Array(
        [
            // Front Face (Red)
            -0.5, 0.0, 0.5, 0.5, 0.0, 0.5, 0.0, 1.0, 0.0,// 0, 1, 2
            // Right Face (Yellow)
            0.5, 0.0, 0.5,  0.5, 0.0, -0.5,  0.0, 1.0, 0.0, // 3, 4, 5
            // Left Face (Green)
            -0.5, 0.0, 0.5,  -0.5, 0.0, -0.5,  0.0, 1.0, 0.0, // 6, 7, 8
            // Back Face (Cyan)
            0.5, 0.0, -0.5,  -0.5, 0.0, -0.5,  0.0, 1.0, 0.0, // 9, 10, 11
            // Bottom 1 (Blue)
            -0.5, 0.0, 0.5,   0.5, 0.0, 0.5, 0.5, 0.0, -0.5,
            // Bottom 2 (Blue)
            -0.5, 0.0, 0.5,   -0.5, 0.0, -0.5, 0.5, 0.0, -0.5
        ]);

        this.indices = new Uint16Array(
        [
            // 모든 정점을 순서대로 참조 (EBO를 인덱스 번호 0부터 17까지 정의)
            0, 1, 2,  // Front
            3, 4, 5,  // Right
            6, 7, 8,  // Left
            9, 10, 11, // Back
            12, 13, 14, // Bottom 1
            15, 16, 17  // Bottom 2
        ]);

        this.texCoords = new Float32Array([

            0, 0, 0.25, 0, 0, 1,

            0.25, 0, 0.5, 0, 0.25, 1,

            0.5, 0, 0.75, 0, 0.5, 1,
            
            0.75, 0, 1, 0, 1, 1,
            
            0, 0, 0, 1, 1, 1,
            
            0, 0, 1, 0, 1, 1,
        ]);


        this.initBuffers();
    }

    initBuffers()
    {
        const gl = this.gl;

        // 버퍼 크기 계산
        const vSize = this.vertices.byteLength;
        const tSize = this.texCoords.byteLength;
        const totalSize = vSize + tSize;

        gl.bindVertexArray(this.vao);

        // VBO에 데이터 복사
        // gl.bufferSubData(target, offset, data): target buffer의 
        //     offset 위치부터 data를 copy (즉, data를 buffer의 일부에만 copy)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, totalSize, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.texCoords);

        // EBO에 인덱스 데이터 복사
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        // vertex attributes 설정
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);  // position
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, vSize);  // color

        // vertex attributes 활성화
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);

        // 버퍼 바인딩 해제
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    draw(shader)
    {
        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, 18, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null)
    }

    delete()
    {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
} 