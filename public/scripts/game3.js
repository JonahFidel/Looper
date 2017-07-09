//Jonah Fidel and Michael Dunnegan 
//4/21/16
//starFox 128
//Final Project for COSC 435: Computer Graphics
//Professor Elodie Fourquet 

/* 
This project was completed mostly in a one-month period 
during the Spring of 2016. Our idea was to create a remake 
of the classic StarFox64 game for Nintendo 64. 
*/ 

//as of right now this will only run properly in Safari.
//declaration of global variables  
var hex = 0xff0000; 
var bbox;
var rayTrack; 
var track = 0;
var endgame = false; 
var scene; 
var mesh1; 
var scoreMesh; 
var canvas1;
var score = 0; 
var camera; 
var vertCount;
var context1;
var lives = 3; 
var loader = new THREE.JSONLoader();
var clock = new THREE.Clock(); 
var activeObstacles = [];
var activeRings = [];
var activeRingBoxes = [];
var arrowList = [];
var directionList = [];
var ship; 
var first = 1;
var count5 = 0; 

var lavaTexture = new THREE.ImageUtils.loadTexture( 'textures/lava.jpg');
	lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping; 
	// multiplier for distortion speed 		
	var baseSpeed = 0.02;
	// number of times to repeat texture in each direction
	var repeatS = repeatT = 4.0;
	
	// texture used to generate "randomness", distort all other textures
	var noiseTexture = new THREE.ImageUtils.loadTexture( 'textures/cloud.png' );
	noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping; 
	// magnitude of noise effect
	var noiseScale = 0.5;
	
	// texture to additively blend with base image texture
	var blendTexture = new THREE.ImageUtils.loadTexture( 'textures/lava.jpg' );
	blendTexture.wrapS = blendTexture.wrapT = THREE.RepeatWrapping; 
	// multiplier for distortion speed 
	var blendSpeed = 0.01;
	// adjust lightness/darkness of blended texture
	var blendOffset = 0.25;

	// texture to determine normal displacement
	var bumpTexture = noiseTexture;
	bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping; 
	// multiplier for distortion speed 		
	var bumpSpeed   = 0.15;
	// magnitude of normal displacement
	var bumpScale   = 40.0;

	var customUniforms = {
			baseTexture: 	{ type: "t", value: lavaTexture },
			baseSpeed:		{ type: "f", value: baseSpeed },
			repeatS:		{ type: "f", value: repeatS },
			repeatT:		{ type: "f", value: repeatT },
			noiseTexture:	{ type: "t", value: noiseTexture },
			noiseScale:		{ type: "f", value: noiseScale },
			blendTexture:	{ type: "t", value: blendTexture },
			blendSpeed: 	{ type: "f", value: blendSpeed },
			blendOffset: 	{ type: "f", value: blendOffset },
			bumpTexture:	{ type: "t", value: bumpTexture },
			bumpSpeed: 		{ type: "f", value: bumpSpeed },
			bumpScale: 		{ type: "f", value: bumpScale },
			alpha: 			{ type: "f", value: 1.0 },
			time: 			{ type: "f", value: 1.0 }
		};

	var engine;// = new ParticleEngine();

// acts as a main function
var game = function(){

	var renderer; 
	var terrainGenerator;
	var collosionDetector; 
	var backgroundMesh; 
	var pause = 0;
	var canvas1; 
	var material1; 
	var texture1; 
	var context2; 
	var canvas2; 
	var material2; 
	var texture2; 


	var draw = function(){

		requestAnimationFrame(draw);

		renderer.render(scene, camera);

		handleInput();

		updateCameraAndShipPositionOnZAxis();

		collisionDetector();  

		terrainGenerator.generateNextTileIfNeeded(camera.position.z, true);
	};

	//handle pause input on keydown 'p'
	document.addEventListener("keydown", function(k){
		var press = k.which || k.keyCode; 

		//pause
		if (press === 80 && pause == 0) {
			pause = 1;  
			pauseFunc();
			//console.log("keycode: "+e.keyCode);
		
		}
		//unpause
		else if (press === 80 && pause != 0) {

			 pause = 0;   
			 //console.log("keycode: "+e.keyCode);
		}

	}); 

//WebGL initialization
	var createScene = function(){
		//Scene
		scene = new THREE.Scene();	
		var WIDTH = 960, HEIGHT = 540;

		var VIEW_ANGLE = 70,
		    ASPECT = WIDTH / HEIGHT,
		    NEAR = 0.1,
		    FAR = 10000;

		//Renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(WIDTH, HEIGHT);
		var c = document.getElementById("gameCanvas");
		c.appendChild(renderer.domElement);

		//trying to add a background 
		var texture = THREE.ImageUtils.loadTexture( 'textures/background5.jpg' );
		
		backgroundMesh = new THREE.Mesh(
		    new THREE.PlaneGeometry(20000, 20000, 20000),
		    new THREE.MeshBasicMaterial({
		        map: texture
		    }));

		scene.add(backgroundMesh); 
		backgroundMesh.position.z = -7000; 

		// CAMERA
		camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
		scene.add(camera);
		camera.position.z = 30;
		camera.position.y = 20;

		//console.log("this works"); 

		var camPos = camera.position.x;
		var camPosZ = camera.position.z; 
		console.log("camPos " + camPos);

		// LIGHT
		// number one -- start light? 
		var light = new THREE.DirectionalLight( 0xffffff );
	    light.position.set( 0, 1, 0).normalize();
	    scene.add(light);
	    //not sure why we need this light, shouldn't ambient light 
	    //up the whole scene?? 

	    //number two -- on the camera 
	     var secondLight = new THREE.DirectionalLight( 0xFF0000 );
	     camera.add(secondLight);

	     //number three -- ambient 
	     var thirdLight = new THREE.AmbientLight(0xaaaaaa);
         scene.add(thirdLight);


	    // TERRAIN GENERATOR
		terrainGenerator = new TerrainGenerator();
		terrainGenerator.generateInitialTiles()
	};

	function update()
	{
		var delta = clock.getDelta();
		customUniforms.time.value += delta;
		//controls.update();
		//stats.update();
	}

	var loadParticles = function(){
		var customMaterial = new THREE.ShaderMaterial( 
		{
		    uniforms: customUniforms,
			vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
			fragmentShader: document.getElementById( 'fragmentShader' ).textContent
		});
			
		var ballGeometry = new THREE.SphereGeometry( 60, 64, 64 );
		var ball1 = new THREE.Mesh(	ballGeometry, customMaterial );
		var ball2 = new THREE.Mesh(	ballGeometry, customMaterial );
		var ball3 = new THREE.Mesh(	ballGeometry, customMaterial );
		var ball4 = new THREE.Mesh(	ballGeometry, customMaterial );

		ball1.scale.set(0.007,0.004,0.004);
		ball2.scale.set(0.007,0.004,0.004);
		ball3.scale.set(0.007,0.004,0.004);
		ball4.scale.set(0.007,0.004,0.004);
		
		ship.add(ball1);
		ship.add(ball2);
		ship.add(ball3);
		ship.add(ball4);

		ball1.position.set(-1.4, 0, -5);
		ball2.position.set(1.4, 0, -5);

		ball3.position.set(-0.7, 0.5, -5);
		ball4.position.set(0.7, 0.5, -5);
	};

		var handleInput = function(){
			//this would ideally be highly condensed by having a function call instead of repeating code 

			if (Key.isDown(Key.A) && ship.position.x >= -75) {
				if (ship.position.x == -75){
					console.log("you've gone too far!!"); 
					//arrow = new Three.MeshNormalMaterial
						cameraPositionX = camera.position.x; 
						cameraPositionY = camera.position.y; 
						cameraPositionZ = camera.position.z; 
						canvas1 = document.createElement('canvas');
						context1 = canvas1.getContext('2d');
						context1.font = "Bold 40px Arial";
						context1.fillStyle = "rgba(255,0,0,0.95)";
					    context1.fillText('   >', 0, 50);
					    
						// canvas contents will be used for a texture
						 texture1 = new THREE.Texture(canvas1);
						 texture1.needsUpdate = true;
					      
					     material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
					     material1.transparent = true;

					    mesh1 = new THREE.Mesh(
					        new THREE.PlaneGeometry(canvas1.width, canvas1.height),
					        material1
					      );
						mesh1.position.set(cameraPositionX, cameraPositionY, cameraPositionZ - 200);
						scene.add(mesh1);
				}
				ship.position.x -= 1;
				backgroundMesh.position.x += 5; 
				ship.rotation.z += .01;
			}
			if (Key.isDown(Key.D) && ship.position.x <= 75) {
				if (ship.position.x == 75){
					console.log("you've gone too far!!"); 
					cameraPositionX = camera.position.x; 
					cameraPositionY = camera.position.y; 
					cameraPositionZ = camera.position.z; 
					canvas1 = document.createElement('canvas');
					context1 = canvas1.getContext('2d');
					context1.font = "Bold 40px Arial";
					context1.fillStyle = "rgba(255,0,0,0.95)";
				    context1.fillText('<   ', 0, 50);
				    
					// canvas contents will be used for a texture
					 texture1 = new THREE.Texture(canvas1);
					 texture1.needsUpdate = true;
				      
				     material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
				     material1.transparent = true;

				    mesh1 = new THREE.Mesh(
				        new THREE.PlaneGeometry(canvas1.width, canvas1.height),
				        material1
				      );
					mesh1.position.set(cameraPositionX + 250, cameraPositionY, cameraPositionZ - 200);
					scene.add(mesh1);
				}
				ship.position.x += 1;
				backgroundMesh.position.x -= 5; 
				ship.rotation.z -= .01;
			} 
			if (Key.isDown(Key.S) && ship.position.y >= -5) {
				if (ship.position.y == -5){
					console.log("you've gone too far!!"); 
					//arrow = new Three.MeshNormalMaterial
					cameraPositionX = camera.position.x; 
					cameraPositionY = camera.position.y; 
					cameraPositionZ = camera.position.z; 
					canvas1 = document.createElement('canvas');
					context1 = canvas1.getContext('2d');
					context1.font = "Bold 70px Arial";
					context1.fillStyle = "rgba(255,0,0,0.95)";
				    context1.fillText('^', 0, 50);
				    
					// canvas contents will be used for a texture
					 texture1 = new THREE.Texture(canvas1);
					 texture1.needsUpdate = true;
				      
				     material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
				     material1.transparent = true;

				    mesh1 = new THREE.Mesh(
				        new THREE.PlaneGeometry(canvas1.width, canvas1.height),
				        material1
				      );
					mesh1.position.set(cameraPositionX + 130 , cameraPositionY +50 , cameraPositionZ - 200);
					scene.add(mesh1);
				}
				ship.position.y -= 1;
				backgroundMesh.position.y += 5; 
				ship.rotation.x -= .01;
		   	} 
		   	if (Key.isDown(Key.W) && ship.position.y <= 60) {
				if (ship.position.y == 60){
					console.log("you've gone too far!!");
					cameraPositionX = camera.position.x; 
					cameraPositionY = camera.position.y; 
					cameraPositionZ = camera.position.z; 
					canvas1 = document.createElement('canvas');
					context1 = canvas1.getContext('2d');
					context1.font = "Bold 70px Arial";
					context1.fillStyle = "rgba(255,0,0,0.95)";
				    context1.fillText('v', 0, 50);
				    
					// canvas contents will be used for a texture
					 texture1 = new THREE.Texture(canvas1);
					 texture1.needsUpdate = true;
				      
				     material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
				     material1.transparent = true;

				    mesh1 = new THREE.Mesh(
				        new THREE.PlaneGeometry(canvas1.width, canvas1.height),
				        material1
				      );
					mesh1.position.set(cameraPositionX + 130 , cameraPositionY + 20 , cameraPositionZ - 200);
					scene.add(mesh1);
				}
				ship.position.y += 1;
				backgroundMesh.position.y -= 5; 
				ship.rotation.x += .01;
			}
		}

	var initializeSpaceship = function(){
	
	loader.load( 'textures/spaceship.json', function (object2) {

		//console.log("ship before " + ship)
	
		var material = new THREE.MeshPhongMaterial({
			color:0xffffff, 
			map: THREE.ImageUtils.loadTexture('textures/metal.jpg'),
			bumpMap: THREE.ImageUtils.loadTexture('textures/sandBumpMap.jpg'),
			bumpScale: 0.9
		});

		ship = new THREE.Mesh(object2, material);

		ship.position.y = 36;
		ship.position.z = -100;
		ship.rotation.y =3.14;
		ship.rotation.x = .5;
		ship.scale.set(5,5,5);

		rayTrack = bbox.geometry.vertices.length;
		//console.log(rayTrack); 

		ship.add(bbox);  
		bbox.visible = false; 
		loadParticles(); 
		camera.add(ship);

		draw();
	});

};

var scoreUpdate = function(mesh){
	//scene.remove(mesh); 
	canvas1 = document.createElement('canvas');
	context1 = canvas1.getContext('2d');
	context1.font = "Bold 45px Arial";
	context1.fillStyle = "rgba(255,255,255,0.95)";
    context1.fillText('Score: ' + score, 0, 50);
	 texture1 = new THREE.Texture(canvas1);
	 texture1.needsUpdate = true;
      
     material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
     material1.transparent = true;

    scoreMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(canvas1.width, canvas1.height),
        material1
      );

	scene.add(scoreMesh);
	
	
	return scoreMesh;  
};
pauseFunc = function() {
	if (endgame == true) { location.reload() }
	cameraPositionX = camera.position.x; 
	cameraPositionY = camera.position.y; 
	cameraPositionZ = camera.position.z; 
	canvas1 = document.createElement('canvas');
	context1 = canvas1.getContext('2d');
	context1.font = "Bold 40px Arial";
	context1.fillStyle = "rgba(255,255,255,0.95)";
    context1.fillText('Game Paused', 0, 50);
    
	// canvas contents will be used for a texture
	texture1 = new THREE.Texture(canvas1);
	texture1.needsUpdate = true;
      
    material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
    material1.transparent = true;

    mesh1 = new THREE.Mesh(
        new THREE.PlaneGeometry(canvas1.width, canvas1.height),
        material1
      );
    console.log("hello"); 
	mesh1.position.set(cameraPositionX, cameraPositionY, cameraPositionZ - 200);
	//scene.add(scoreMesh);
	scene.add(mesh1);
	console.log("goodbye");
}

	endGame = function(){
		console.log("There was a collision and you died lol")
		endgame = true; 
		console.log("You died, game ended. Your score was: " + score);
		pauseFunc(); 
		
		//0 = 1; 
		//break; 
	}

	var updateCameraAndShipPositionOnZAxis = function(){
		
		//ensure game is not paused 
		if (pause == 0) {
			camera.position.z -= 1;

			backgroundMesh.position.z -= 1;

			scene.remove(scoreMesh); 
			scoreMesh = scoreUpdate(scoreMesh);  
			scene.add(scoreMesh); 
			scoreMesh.position.z = camera.position.z - 490;
			scoreMesh.position.y = camera.position.y + 250; 
			scoreMesh.position.x = camera.position.x - 430;
			
			if (mesh1 != null && ship.position.x < 75 && ship.position.x > -75 && ship.position.y > -5 && ship.position.y < 60)
			{
				console.log("enter");
				scene.remove(mesh1); 
				mesh1 = null; 
			}
			else if (mesh1!= null){
				mesh1.position.z -= 1; 
			} 
			
			//console.log("this works too"); 
			scene.add(backgroundMesh); 
		}	
		else {
			return;
		}
	};

	var initializeBoundingBox = function(){
		bbox = new THREE.BoundingBoxHelper(ship, hex);
		//bbox = bbox.scale(.5,.5,.5); 

	};
	//calls for initializations
	(function main(){
		createScene();	
		initializeBoundingBox();
		initializeSpaceship();
	})();
};

function handleTextureLoaded(image, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

function ObstacleGenerator(){
	this.obstacleGeometries = [new THREE.CylinderGeometry( 0, 30, 100, 4, 4 ), new THREE.CylinderGeometry( 0, 45, 50, 3, 4 )];
	this.obstacleMaterials = [new THREE.MeshPhongMaterial({
						color:0xffffff, 
						map: THREE.ImageUtils.loadTexture( 'textures/pyramid2.jpg'),
						bumpMap: THREE.ImageUtils.loadTexture('textures/sandBumpMap.jpg'),
						bumpScale: 0.9
					}), 
					new THREE.MeshPhongMaterial({
						color:0xffffff, 
						map: THREE.ImageUtils.loadTexture( 'textures/pyramid.jpg'),
					}),
					new THREE.MeshPhongMaterial({
						color:0xffffff, 
						map: THREE.ImageUtils.loadTexture( 'textures/pyramid6.jpg'),
					})]; 
}

ObstacleGenerator.prototype = {
	constructor: ObstacleGenerator,

	generateObstacles: function(zCoordinateOfTile, deletePreviousObstacles){	 
		obstacle = new THREE.Mesh(this.obstacleGeometries[0], this.obstacleMaterials[track]);

		track++; 
		if (track > 2){
			track = 0; 
		}

		obstacle2 = new THREE.Mesh(this.obstacleGeometries[1], this.obstacleMaterials[track]); 
		//obstacle.position.x = // random between -400 and 0?

		obstacle.position.x = (Math.random() * 200) - 100;
		obstacle2.position.x = (Math.random() * 200) - 100;

		obstacle.position.y = 5;
		obstacle2.position.y = 5;

		obstacle.position.z = -zCoordinateOfTile;
		obstacle2.position.z = -zCoordinateOfTile + 50;

		activeObstacles.push(obstacle);

	    activeObstacles.push(obstacle2);

	    if (deletePreviousObstacles){
	    	//console.log("this is getting called");
	    	activeObstacles.shift(); 
	    	activeObstacles.shift(); 
	    }

		scene.add(obstacle) 
		scene.add(obstacle2);
	}
}

function RingGenerator(){
	this.ringGeometries = [new THREE.TorusGeometry( 10, 3, 100, 100)];
	this.ringMaterials = [new THREE.MeshNormalMaterial()]
}

RingGenerator.prototype = {
	constructor: RingGenerator , 

	generateRings: function (zCoordinateOfTile, deletePreviousRings){
		if (Math.random() > .2)
		{
			var ringMaterial = new THREE.MeshPhongMaterial(
			{
							color:0xffffff, 
							map: THREE.ImageUtils.loadTexture( 'textures/ice.jpg' ), 
							bumpMap: THREE.ImageUtils.loadTexture('textures/sandBumpMap.jpg'),
							bumpScale: 0.3
						});
		}
		else
		{
			var ringMaterial = new THREE.MeshPhongMaterial(
			{
							color:0xffffff, 
							map: THREE.ImageUtils.loadTexture( 'textures/fire.jpg' ), 
							bumpMap: THREE.ImageUtils.loadTexture('textures/sandBumpMap.jpg'),
							bumpScale: 0.3
						});
		}

		// 'i' will be an index for choosing objects
		var i = 0;
		var ring = new THREE.Mesh(this.ringGeometries[i], ringMaterial);
		//obstacle.position.x = // random between -400 and 0?

		ring.position.x = Math.random() *  65 - 30; 
		ring.position.y = Math.random() * 33 + 20;
		ring.position.z = -zCoordinateOfTile + 25;

		var ringBox = new THREE.BoundingBoxHelper(ring, hex); 
		ringBox.scale.set(10,10,10); 


		activeRingBoxes.push(ringBox);
		activeRings.push(ring);
		ringBox.visible = false; 

		if (deletePreviousRings)
		{
			console.log("shifting"); 
			activeRingBoxes.shift();
			activeRings.shift();  
			//activeRings.shift(); 
		}


		scene.add(ring);
		ring.add(ringBox); 

		//console.log(ringBox);
	}
}

function TerrainGenerator(){
	this.zRenderingPosition = 0;
	this.activeTerrain = [];
	this.sizeOfTerrain = 100;
	this.obstacleGenerator = new ObstacleGenerator();
	this.ringGenerator = new RingGenerator(); 

	this.terrainGeometry = new THREE.CubeGeometry(10, 10, 10);
	this.terrainMaterial = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('textures/sand.jpg') } );

	this.loader = new THREE.JSONLoader();

}

TerrainGenerator.prototype = {
	constructor: TerrainGenerator,

	getActiveTerrain: function(){
		return this.activeTerrain;
	},

	getObstacleGenerator: function(){
		return this.obstacleGenerator;
	},

	getRingGenerator : function(){
		return this.RingGenerator; 
	}, 

	generateInitialTiles: function(){
		//doesn't seem to affect performance, might as well leave it

		this.generateNextTile(false);
		this.generateNextTile(false);
		this.generateNextTile(false);
		this.generateNextTile(false);
		this.generateNextTile(false);
		this.generateNextTile(false);
		this.generateNextTile(false);
		this.generateNextTile(false);
	},

	generateNextTileIfNeeded: function(shipPosition, deletePrevTiles){
		//console.log(shipPosition); 

		if (this.nextTileNeeded(shipPosition)){
			this.generateNextTile(deletePrevTiles);
		}
	},

	nextTileNeeded: function(ZpositionOfShip){
		if (ZpositionOfShip % this.sizeOfTerrain == 0){
			return true;
		}
	},

	generateNextTile: function(deletePrevTiles){
		//console.log("check1");
		//zpos = ship.position.z; 
		//console.log(zpos); 
		var START = -200;
		var END = 200;

	    // for (var i = START; i <= END; i+=100){

	    	var AT = this.getActiveTerrain();
	    	var zPos = this.zRenderingPosition;

	  		this.loader.load(
				// resource URL
				'textures/ruggedTerrain3.json',

				// Function when resource is loaded
				function (geometry) {


					var material = new THREE.MeshPhongMaterial({
						color:0xffffff, 
						map: THREE.ImageUtils.loadTexture( 'textures/sand.jpg'),
						bumpMap: THREE.ImageUtils.loadTexture('textures/sandBumpMap.jpg'),
						bumpScale: 1.3
					});

					var object1 = new THREE.Mesh(geometry, material);

					object1.position.y = -150;
					object1.position.z = -zPos-400;
					//object1.position.x = i-400; // i - a random number between 0 and 200
					object1.position.x = 0; 
					//object1.position.x = i - (Math.random() * 400) + 100;

					object1.scale.set(100,100,100);

					object1.rotation.y = (Math.floor(Math.random() * 4) + 1) * 90; 

					AT.push(object1);
					if (deletePrevTiles){
						AT.shift();	
					}
								
					scene.add(object1);
				}
			);
	    this.obstacleGenerator.generateObstacles(this.zRenderingPosition, deletePrevTiles);
	    this.ringGenerator.generateRings(this.zRenderingPosition, deletePrevTiles);
		this.zRenderingPosition += 100;
	}
}

function Spaceship(){
	var model;
	this.loader = new THREE.JSONLoader(); 
}

Spaceship.prototype = {
	constructor: Spaceship,

	getModel: function(){
		return this.model;
	},

	getZPosition: function(){
		return this.model.position.z;
	},

	getXPosition: function(){
		return this.model.position.x;
	},

	getYPosition: function(){
		return this.model.position.y;
	},

	setInitialPosition: function(){
		this.model.position.z = 0;
    	this.model.position.y = 25;
	},
}

var collisionDetector = function(){

	var vertexIndex; 
	
	var originPoint = new THREE.Vector3();

	originPoint.x = ship.position.x; 
	originPoint.y = ship.position.y; 
	originPoint.z = camera.position.z - 100; 

	var originPoint2 = new THREE.Vector3(); 

	originPoint2.x = ship.position.x; 
	originPoint2.y = ship.position.y; 
	originPoint2.z = camera.position.z - 75;
	//console.log(activeRings);  

	for (vertexIndex = 0; vertexIndex < rayTrack; vertexIndex++){       

	    var localVertex = bbox.geometry.vertices[vertexIndex].clone();
	    var globalVertex = localVertex.applyMatrix4(bbox.matrix); 
	    var directionVector = globalVertex.sub(bbox.position);

	    var ray = new THREE.Raycaster(originPoint2, directionVector.normalize());

	    var ringCollisionResults = ray.intersectObjects(activeRingBoxes);
		   	if (ringCollisionResults.length > 0)
		   	{
		   		score++; 
		   		console.log(score); 
		   		scene.remove(activeRings[0]);

		   	}

	   	var ray2 = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
	    var collisionResults = ray2.intersectObjects(activeObstacles);
	    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) 
	    {
			console.log("I'm doing something here"); 
			endGame(); 
	    }
	}
}


