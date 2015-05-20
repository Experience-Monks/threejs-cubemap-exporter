/// <reference path="typings/three/three.d.ts"/>

THREE = require('three');

var View = require('threejs-managed-view').View;
var CheckerRoom = require('threejs-checkerroom');

var checkerRoom = new CheckerRoom();
var exportCubeMap = require('./');  

var view = new View({	
	useRafPolyfill: false,
	rendererSettings: { preserveDrawingBuffer: true }
});

// ---- Plane
view.scene.add(new THREE.AmbientLight());
view.scene.add(checkerRoom);

// ---- Create cube camera
var cubeMapCamera = new THREE.CubeCamera(0.01, 10, 256);
cubeMapCamera.position.y = 1;
view.scene.add(cubeMapCamera);

setTimeout(function() {

	var filename = 'file.png';

	exportCubeMap(view.renderer, view.scene, cubeMapCamera, filename, 
	function() {

		var filenames = exportCubeMap.fileSuffixes.map(function(suffix) {
			return filename.split('.').join('.' + suffix + '.');
		});

		var cubeMap = THREE.ImageUtils.loadTextureCube(filenames);
		cubeMap.format = THREE.RGBFormat;

		var sphere = new THREE.SphereGeometry(1, 16, 16);

		var sphereMat = new THREE.MeshPhongMaterial({
			envMap: cubeMap, 
			color: 0x000000,
			combine: THREE.AddOperation
		});
		var sphereMesh = new THREE.Mesh(sphere, sphereMat);
		sphereMesh.position.y = 1;

		view.scene.add(sphereMesh);
	});

}, 1000);