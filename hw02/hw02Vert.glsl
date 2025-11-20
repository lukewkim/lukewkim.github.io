#version 300 es
layout(location = 0) in vec3 aPos;
uniform vec2 offset;
void main()
{
    vec2 pos = aPos.xy + offset;
    gl_Position = vec4(pos, aPos.z, 1.0);
}