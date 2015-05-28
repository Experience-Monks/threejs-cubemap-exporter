var PNGIO = require('png-io');

var cameraNames = ['PX', 'NX', 'PY', 'NY', 'PZ', 'NZ'];

function exportCubeMap(renderer, scene, cubeMapCamera, filenameBase, unpremultiply, finalCallback)
{
	var width = cubeMapCamera.renderTarget.width;
	var height = cubeMapCamera.renderTarget.height;

	// Create canvas append to document body
	var canvas = document.createElement('canvas');
	canvas.id     = 'canvas';
	canvas.width  = width;
	canvas.height = height;
	canvas.style.zIndex   = 8;
	canvas.style.position = 'absolute';

	document.body.appendChild(canvas);

	var context2D = canvas.getContext('2d');
	var context3D = renderer.getContext();
	var target = new THREE.WebGLRenderTarget(width, height);

	function cameraToPNG(camera, name, callback)
	{
		renderer.render(scene, camera, target);

		// Create a data string
		var data = new Uint8Array(width * height * 4);
		context3D.readPixels(0, 0, width, height, context3D.RGBA, context3D.UNSIGNED_BYTE, data);

		if (unpremultiply)
		{
			var l = data.length;
			for (var i = 0; i < l; i += 4)
			{
				if (data[i+3] > 0)
				{
					data[i] = ~~(data[i] / (data[i+3] / 255));
					data[i+1] = ~~(data[i+1] / (data[i+3] / 255));
					data[i+2] = ~~(data[i+2] / (data[i+3] / 255));
				}
			}					
		}

		var imageData = context2D.createImageData(width, height);
		imageData.data.set(data);

		context2D.putImageData(imageData, 0, 0);

		var pngUrl = canvas.toDataURL(); // PNG is the default

		var startIndex = pngUrl.indexOf(',') + 1;
		var pngDataRaw = pngUrl.substring(startIndex);

		var filename = filenameBase.split('.').join('.' + name + '.');

		var pngio = new PNGIO(filename);
		pngio.save(pngDataRaw, function() {
			console.log('success');
			callback();
		}, 
		function() {
			console.log('failure');
			callback();
		});
	}

	var i = 0;
	function nextCamera()
	{
		if (i >= cameraNames.length)
		{
			finalCallback();
			return;
		}

		cameraToPNG(cubeMapCamera.children[i], cameraNames[i], nextCamera);
		i++;
	}
	nextCamera();
}

exportCubeMap.fileSuffixes = cameraNames;
module.exports = exportCubeMap;
