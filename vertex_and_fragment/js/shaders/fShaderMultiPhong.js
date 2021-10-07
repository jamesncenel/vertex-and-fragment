/**
 * @file Phong fragment shader with point and directional lights
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2021/04/01
 */

/* TODO (2.3) */

var shaderID = "fShaderMultiPhong";

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

/***
 * NUM_DIR_LIGHTS is replaced to the number of directional lights by the
 * replaceNumLights() function in teapot.js before the shader is compiled.
 */
#if NUM_DIR_LIGHTS > 0

	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};

	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

#endif


void main() {

	// Compute ambient reflection
	vec3 ambientReflection = material.ambient * ambientLightColor;
	
	// Get our normal vector:
	vec3 normalizedNorm = normalize(normalCam);

	// Get our fragment's position:
	vec4 homogeneousFrag = vec4(fragPosCam, 1.0);
	
	// Get our vertex in view space:
	// vec4 vertexInViewSpace = modelViewMat * vec4( position, 1.0);
	
	// Set up our light position in view space:
	vec4 viewLightCoords;

	// Set up our Li vector:
	vec4 lightVector;

	// Get our dot product that represents diffuse intensity:
	float diffuseIntensity;

	// Put it all together?
	vec3 diffuseReflection;

	// Specular addition:
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

	vec4 viewDirectionVect;
	float directionDiffIntensity;
	vec3 directionDiffReflection;
	
	// Directional light extension
	// NOTE: I used this page to help understand how we should represent directional light:
	//			https://www.lighthouse3d.com/tutorials/glsl-12-tutorial/directional-lights-i/
	for(int j = 0; j < NUM_DIR_LIGHTS; j++)
	{
		viewDirectionVect = normalize( viewMat * vec4( directionalLights[j].direction, 0.0) );
		directionDiffIntensity = max( dot( viewDirectionVect, vec4(normalizedNorm, 0.0) ), 0.0 );
		directionDiffReflection = material.diffuse * directionalLights[j].color * directionDiffIntensity;
		fColor += directionDiffReflection;
	}
	gl_FragColor = vec4( fColor, 1.0 );

}
` );

var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
