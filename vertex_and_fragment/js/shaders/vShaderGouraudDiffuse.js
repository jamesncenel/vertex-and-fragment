/**
 * @file Gouraud vertex shader with diffuse and ambient light
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2021/04/01
 */

/* TODO (2.1.1), (2.1.3) */

var shaderID = "vShaderGouraudDiffuse";

var shader = document.createTextNode( `
/**
 * varying qualifier is used for passing variables from a vertex shader
 * to a fragment shader. In the fragment shader, these variables are
 * interpolated between neighboring vertexes.
 */
varying vec3 vColor; // Color at a vertex

uniform mat4 viewMat;
uniform mat4 projectionMat;
uniform mat4 modelViewMat;
uniform mat3 normalMat;

struct Material {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	float shininess;
};

uniform Material material;

uniform vec3 attenuation;

uniform vec3 ambientLightColor;

attribute vec3 position;
attribute vec3 normal;


/***
 * NUM_POINT_LIGHTS is replaced to the number of point lights by the
 * replaceNumLights() function in teapot.js before the shader is compiled.
 */
#if NUM_POINT_LIGHTS > 0

	struct PointLight {
		vec3 color;
		vec3 position;
	};

	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

#endif


void main() {

	// Compute ambient reflection
	vec3 ambientReflection = material.ambient * ambientLightColor;
	
	// Get our normal vector in view space:
	vec3 normInViewSpace = normalize((normalMat * normal));
	
	// Get our vertex in view space?:
	vec4 vertexInViewSpace = modelViewMat * vec4( position, 1.0);
	
	// Set up our light position in view space:
	vec4 viewLightCoords;

	// Set up our Li vector:
	vec4 lightVector;

	// Get our dot product that represents diffuse intensity:
	float diffuseIntensity;

	// Put it all together?
	vec3 diffuseReflection;

	// Implementing a proper falloff term:
	float littleR;
	float falloff;

	// Showing it all
	vColor = ambientReflection;

	// Big ol' for loop
	for(int i = 0; i < NUM_POINT_LIGHTS; i++)
	{
		viewLightCoords = viewMat * vec4( pointLights[i].position, 1.0);
		lightVector = normalize( viewLightCoords - vertexInViewSpace );
		diffuseIntensity = max( dot(lightVector, vec4(normInViewSpace, 0.0)), 0.0);
		diffuseReflection = (material.diffuse * pointLights[i].color * diffuseIntensity);

		littleR = distance(viewLightCoords, vertexInViewSpace);
		falloff = 1.0 / (attenuation.x + (attenuation.y * littleR) + (attenuation.z * pow(littleR, 2.0) ));

		vColor += (falloff * (diffuseReflection));
	}

	

	gl_Position =
		projectionMat * modelViewMat * vec4( position, 1.0 );

}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-vertex" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
