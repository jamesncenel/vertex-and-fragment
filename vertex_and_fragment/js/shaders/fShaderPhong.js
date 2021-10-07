/**
 * @file Phong fragment shader
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2021/04/01
 */

/* TODO (2.2.2) */

var shaderID = "fShaderPhong";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */
precision mediump float;

varying vec3 normalCam; // Normal in view coordinate
varying vec3 fragPosCam; // Fragment position in view cooridnate

uniform mat4 viewMat;

struct Material {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	float shininess;
};

uniform Material material;

uniform vec3 attenuation;

uniform vec3 ambientLightColor;


/***
 * NUM_POINT_LIGHTS is replaced to the number of point lights by the
 * replaceNumLights() function in teapot.js before the shader is compiled.
 */
#if NUM_POINT_LIGHTS > 0

	struct PointLight {
		vec3 position;
		vec3 color;
	};

	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

#endif


void main() {

	// Compute ambient reflection
	vec3 ambientReflection = material.ambient * ambientLightColor;
	
	// Get our normal vector in view space:
	vec3 normalizedNorm = normalize(normalCam);

	vec4 homogeneousFrag = vec4(fragPosCam, 1.0);
	
	// Get our vertex in view space:
	// vec4 vertexInViewSpace = modelViewMat * vec4( position, 1.0);
	
	// Set up our light position in view space:
	vec4 viewLightCoords;

	// Set up our Li vector:
	vec4 lightVector;

	// Set up our dot product that represents diffuse intensity:
	float diffuseIntensity;

	// Put it all together (setup)
	vec3 diffuseReflection;

	// Specular addition setup:
	vec4 perfectReflector;
	float specularIntensity;
	vec3 specularReflection;

	// Implementing a proper falloff term:
	float littleR;
	float falloff;

	// Showing it all
	vec3 fColor = ambientReflection;

	// Big ol' for loop
	for(int i = 0; i < NUM_POINT_LIGHTS; i++)
	{
		viewLightCoords = viewMat * vec4( pointLights[i].position, 1.0);
		lightVector = normalize( viewLightCoords - homogeneousFrag );
		diffuseIntensity = max( dot(lightVector, vec4(normalizedNorm, 0.0)), 0.0);
		diffuseReflection = (material.diffuse * pointLights[i].color * diffuseIntensity);

		// perfectReflector = -1.0 * reflect(lightVector, vec4(normalizedNorm, 0.0));
		perfectReflector = 2.0*(dot(lightVector, vec4(normalizedNorm, 0.0))) * vec4(normalizedNorm, 0.0) - lightVector;
		specularIntensity = pow(max(dot(perfectReflector, vec4(normalizedNorm, 0.0)), 0.0), material.shininess);
		specularReflection = (material.specular * pointLights[i].color * specularIntensity);

		littleR = distance(viewLightCoords, homogeneousFrag);
		falloff = 1.0 / (attenuation.x + (attenuation.y * littleR) + (attenuation.z * pow(littleR, 2.0) ));

		fColor += (falloff * (diffuseReflection + specularReflection));
	}
	gl_FragColor = vec4( fColor, 1.0 );

}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
