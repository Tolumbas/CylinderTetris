var vShader =
	'uniform mat4 uProjectionMatrix;'+
	'uniform mat4 uViewMatrix;'+
	'uniform mat4 uModelMatrix;'+
	'uniform mat4 uNormalMatrix;'+
	'uniform bool uUseNormalMatrix;'+
	''+
	'uniform vec3 uAmbientColor;'+
	'uniform vec3 uDiffuseColor;'+
	'uniform bool uUseTexture;'+
	''+
	'uniform vec3 uLightDir;'+
	''+
	'attribute vec3 aXYZ;'+
	'attribute vec2 aST;'+
	'attribute vec3 aColor;'+
	'attribute vec3 aNormal;'+
	''+
	'varying vec3 vST;'+
	'varying vec3 vColor;'+
	'varying vec3 vXYZ;'+
	''+
	'void main ()'+
	'{'+
	'	mat4 mvMatrix = uViewMatrix * uModelMatrix;'+
	'	gl_Position = uProjectionMatrix * mvMatrix * vec4(aXYZ,1);'+
	'	mat4 nMatrix = uUseNormalMatrix?uNormalMatrix:mvMatrix;'+
	''+
	'	vST = vec3(aST,1);'+
	'	vXYZ = aXYZ;'+
	'	vColor = uAmbientColor*aColor;'+
	''+
	'	vec3 light = normalize(-uLightDir);'+
	'	vec3 normal = vec3(normalize(nMatrix*vec4(aNormal,0)));'+
	'	vColor += aColor*uDiffuseColor*abs(dot(normal,light));'+
	'}';
	
var fShader =
	'precision mediump float;'+
	'uniform mat3 uTexMatrix;'+
	'uniform samplerCube uTexUnit;'+
	'uniform bool uUseTexture;'+
	'uniform bool uSkybox;'+
	'uniform sampler2D uSampler;'+
	''+
	'varying vec3 vST;'+
	'varying vec3 vColor;'+
	'varying vec3 vXYZ;'+
	
	'void main( )'+
	'{'+
	'	if(uSkybox){'+
	'		gl_FragColor = textureCube(uTexUnit,vXYZ);'+
	'	}'+
	' else'+
	'		if(uUseTexture){'+
	'		vec4 texCol = texture2D(uSampler,(uTexMatrix*vST).st);'+
	'		gl_FragColor = texCol*vec4(vColor,1.0);'+
	'	}'+
	'	else{'+
	'			gl_FragColor = vec4(vColor,1.0);'+
	'		}'+
	'	}';
