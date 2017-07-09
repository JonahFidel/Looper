//Mike Dunnegan and Jonah Fidel 
//4/21/16
//starFox 64

//should we make it so that pause pauses the spaceship too? 

//as of right now this will only run properly in Safari. 
var track = 0;
var scene; 
var mesh1; 
var scoreMesh; 
var livesMesh;  
var score = 0; 
var camera; 
var loader = new THREE.JSONLoader();


// acts as a main function
var game = function(){

	var renderer;
	var ship;
	var terrainGenerator;
	var scene;
	var camera;
	var collosionDetector; 
	var backgroundMesh; 
	var pause = 0;
	var canvas1;  
	var context1;
	var material1; 
	var texture1; 
	var context2; 
	var canvas2; 
	var material2; 
	var texture2; 

var adfhjs = -0; 

	var draw = function(){
		renderer.render(scene, camera);


		// loop draw function call
		updateCameraAndShipPositionOnZAxis();

		ship.handleInput(scene);

		if (collisionDetector.detectCollision()){
			this.endGame();
		}

		terrainGenerator.generateNextTileIfNeeded(ship.getZPosition(), scene);

		requestAnimationFrame(draw);
	};

	//handle pause input on keydown 'p'
	document.addEventListener("keydown", function(k){
		var press = k.which || k.keyCode; 

		if (press === 80 && pause == 0) {
			pause = 1;  

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
			scene.add(scoreMesh);
			scene.add(mesh1);
			console.log("goodbye");
		}
		else if (press === 80 && pause != 0) {

			 pause = 0;  
			// //text2 = document.createElement('div');
			// document.body.removeChild(text2); 

		}
	}); 

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
		var texture = THREE.ImageUtils.loadTexture( 'textures/background7.jpg' );
		
		backgroundMesh = new THREE.Mesh(
		    new THREE.PlaneGeometry(20000, 20000, 20000),
		    new THREE.MeshBasicMaterial({
		        map: texture
		    }));

		scene.add(backgroundMesh); 
		backgroundMesh.position.z = -8000; 

		// CAMERA
		camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
		scene.add(camera);
		camera.position.z = 30;
		camera.position.y = 20;

		console.log("this works"); 


		var camPos = camera.position.x;
		var camPosZ = camera.position.z; 
		console.log("camPos " + camPos);



		// LIGHT
		// number one -- start light? 
		var light = new THREE.DirectionalLight( 0xffffff );
	    light.position.set( 0, 1, 1 ).normalize();
	    scene.add(light);
	    //not sure why we need this light, shouldn't ambient light 
	    //up the whole scene?? 

	    //number two -- on the camera 
	     var secondLight = new THREE.DirectionalLight( 0xffffff );
	     camera.add(secondLight);

	     //number three -- ambient 
	     var thirdLight = new THREE.AmbientLight(0x777777);
         scene.add(thirdLight);


	    // TERRAIN GENERATOR
		terrainGenerator = new TerrainGenerator();
		terrainGenerator.generateInitialTiles(scene);

		// SPACESHIP
		ship = new Spaceship();
		ship.applyTexture();
		ship.setInitialPosition();

		console.log(ship);
		scene.add(ship.model);


		canvas1 = document.createElement('canvas');
		context1 = canvas1.getContext('2d');
		context1.font = "Bold 65px Arial";
		context1.fillStyle = "rgba(255,255,255,0.95)";
	    context1.fillText('Score: ' + score, 0, 50);
	    
		// canvas contents will be used for a texture
		 texture1 = new THREE.Texture(canvas1);
		 texture1.needsUpdate = true;
	      
	     material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
	     material1.transparent = true;

	    scoreMesh = new THREE.Mesh(
	        new THREE.PlaneGeometry(canvas1.width, canvas1.height),
	        material1
	      );

		scoreMesh.position.set(-490, 300, -500);
		scene.add(scoreMesh);
		console.log("scoreMesh added");

	};

	var initializeCollisionDetector = function(){
		collisionDetector = new CollisionDetector(ship.model, terrainGenerator, terrainGenerator.activeTerrain, 
												  terrainGenerator.getObstacleGenerator().activeObstacles);
	}

	var endGame = function(){
		console.log("There was a collision and you died lol")
	}

	var updateCameraAndShipPositionOnZAxis = function(){
		//implements pause functionality 
		if (pause == 0) {
			camera.position.z -= 1;
			//camera.rotation.y = 90;
			ship.getModel().position.z -= 1;
			backgroundMesh.position.z -= 1;
			scoreMesh.position.z -= 1; 
			//livesMesh.position.z -= 1; 
			
			if (mesh1 != null && ship.getModel().position.x < 40 && ship.getModel().position.x > -40 && ship.getModel().position.y > 10 && ship.getModel().position.y < 45)
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

	(function main(){
		createScene();
		initializeCollisionDetector();
		initializeSpaceship(); 
		draw();
	})();

};

// function initTextures() {
//   cubeTexture = gl.createTexture();
//   cubeImage = new Image();
//   cubeImage.onload = function() { handleTextureLoaded(cubeImage, cubeTexture); }
//   cubeImage.src = "cubetexture.png";
// }

function handleTextureLoaded(image, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

function CollisionDetector(shipMesh, terrainList, obstacleList){
	this.ship = shipMesh;
	this.activeTerrainList = terrainList;
	this.activeObstacleList = obstacleList;
}

CollisionDetector.prototype = {

	detectCollision: function(){
		return false;
	}

}

function ObstacleGenerator(){
	this.activeObstacles = [];
	this.obstacleGeometries = [new THREE.CylinderGeometry( 0, 30, 100, 4, 4 ), new THREE.CylinderGeometry( 0, 45, 50, 3, 4 )];
	this.obstacleMaterials = [new THREE.MeshPhongMaterial({
						color:0xffffff, 
						map: THREE.ImageUtils.loadTexture( 'textures/pyramid2.jpg'),
						bumpMap: THREE.ImageUtils.loadTexture('textures/sandBumpMap.jpg'),
						bumpScale: 0.5
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

function RingGenerator(){
	this.activeRings = [];
	this.ringGeometries = [new THREE.TorusGeometry( 10, 3, 100, 100)];
	this.ringMaterials = [new THREE.MeshNormalMaterial()]
}

// function backgroundGenerator(){ 
// 	this.backgroasund = 
// }


// BackgroundGenerator.prototype = { 
// 		constructor : backgroundGenerator , 
// 	}

RingGenerator.prototype = {
	constructor: RingGenerator , 

	generateRings: function (zCoordinateOfTile, scene){
		if (Math.random() > .2)
		{
			var ringMaterial = new THREE.MeshPhongMaterial(
			{
							color:0xffffff, 
							map: THREE.ImageUtils.loadTexture( 'textures/ice.jpg' ), 
							bumpMap: THREE.ImageUtils.loadTexture('textures/sandBumpMap.jpg'),
							bumpScale: 0.5
						});
		}
		else
		{
			var ringMaterial = new THREE.MeshPhongMaterial(
			{
							color:0xffffff, 
							map: THREE.ImageUtils.loadTexture( 'textures/fire.jpg' ), 
							bumpMap: THREE.ImageUtils.loadTexture('textures/sandBumpMap.jpg'),
							bumpScale: 0.5
						});
		}


		// 'i' will be an index for choosing objects
		var i = 0;
		var ring = new THREE.Mesh(this.ringGeometries[i], ringMaterial);
		//obstacle.position.x = // random between -400 and 0?

		//ring.position.x = (Math.random() * 200) - 100;

		ring.position.x = Math.random() *  65 - 30; 

		// if (ring.position.y == (Math.random() * 200) - 100){
		// 	ring.position.y = this.ring.positon.y;
		// 	console.log(ring.positon.y); 
		// 	 }
		// else {ring.position.y = ring.position.y + 100;}

		ring.position.y = Math.random() * 33 + 20
		ring.position.z = -zCoordinateOfTile + 25;


		this.activeRings.push(ring);
	    this.activeRings.shift();

		scene.add(ring);
	}
}

ObstacleGenerator.prototype = {
	constructor: ObstacleGenerator,

	generateObstacles: function(zCoordinateOfTile, scene){	 
		obstacle = new THREE.Mesh(this.obstacleGeometries[0], this.obstacleMaterials[track]);

		track++; 
		if (track > 2){
			track = 0; 
		}

		//console.log(i); 
		obstacle2 = new THREE.Mesh(this.obstacleGeometries[1], this.obstacleMaterials[track]); 
		//obstacle.position.x = // random between -400 and 0?

		obstacle.position.x = (Math.random() * 200) - 100;
		obstacle2.position.x = (Math.random() * 200) - 100;

		obstacle.position.y = 5;
		obstacle2.position.y = 5;

		obstacle.position.z = -zCoordinateOfTile;
		obstacle2.position.z = -zCoordinateOfTile + 50;


		this.activeObstacles.push(obstacle);
	    this.activeObstacles.shift();

	 //    if (i == 0){ 
		// 	i = 1;
		// } 
		// else if (i == 1){
		// 	i = 2; 
		// }	
		// else if (i == 2) {
		// 	i = 0; 
		// }

		//console.log(i); 
	    this.activeObstacles.push(obstacle2);
	    this.activeObstacles.shift();

		scene.add(obstacle)

		//  if (i == 0){ 
		// 	i = 1;
		// } 
		// else if (i == 1){
		// 	i = 2; 
		// }	
		// else {
		// 	i = 0; 
		// }

		scene.add(obstacle2);
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

	generateInitialTiles: function(scene){
		this.generateNextTile(scene);
		this.generateNextTile(scene);
		this.generateNextTile(scene);
		this.generateNextTile(scene);
	},

	generateNextTileIfNeeded: function(shipPosition, scene){
		if (this.nextTileNeeded(shipPosition)){
			this.generateNextTile(scene);
		}
	},

	nextTileNeeded: function(ZpositionOfShip){
		if (ZpositionOfShip % this.sizeOfTerrain == 0){
			return true;
		}
	},

	generateNextTile: function(scene){

		var START = -200;
		var END = 200;

	    for (var i = START; i <= END; i+=100){

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
						bumpScale: 0.5
					});

					var object1 = new THREE.Mesh(geometry, material);

					object1.position.y = -150;
					object1.position.z = -zPos-400;
					object1.position.x = i-400; // i - a random number between 0 and 200
					object1.position.x = i - (Math.random() * 400) + 100;

					object1.scale.set(100,100,100);

					object1.rotation.y = (Math.floor(Math.random() * 4) + 1) * 90; 

					AT.push(object1);
					AT.shift();
					
					scene.add(object1);
				}
			);
	    }
	    this.obstacleGenerator.generateObstacles(this.zRenderingPosition, scene);
	    this.ringGenerator.generateRings(this.zRenderingPosition, scene);
		this.zRenderingPosition += 100;
	}
}

var initializeSpaceship = function(){
		
		loader.load( 'textures/spaceship.json', function (geometry) {

			var material = new THREE.MeshPhongMaterial({
				color:0xffffff, 
				map: THREE.ImageUtils.loadTexture('textures/metal.jpg'),
				bumpMap: THREE.ImageUtils.loadTexture('textures/sandBumpMap.jpg'),
				bumpScale: 0.5
			});

			//console.log("shipModel before " + shipModel)
			shipModel = new THREE.Mesh(geometry, material);

			// demonstrates that it's not the ship that's making the game perform like ass
			//shipModel = new THREE.Mesh(new THREE.CubeGeometry(), new THREE.MeshNormalMaterial());

			shipModel.position.y = 50;
			shipModel.position.z = -100;
			shipModel.rotation.y = 3.14;
			shipModel.rotation.x = .5;
			shipModel.scale.set(5,5,5);
			camera.add(shipModel);
			draw();
		});

	};

function Spaceship(){
	var model;
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
		this.model.position.z = -10;
    	this.model.position.y = 25;
	},

	applyTexture: function(){
		var geometry = new THREE.CubeGeometry(5, 5, 10);
	  	var material = new THREE.MeshNormalMaterial()
	    this.model = new THREE.Mesh(geometry, material);
	},

	handleInput: function(scene){
		// if (Key.isDown(Key.T)) {
		// 	this.model.positon.x -= 1; 
		// 	console.log("pause");
		// }

		//the && statement is a temporary fix for the fade-to-black 
		//functionality when the user leaves the field of view 
		if (Key.isDown(Key.A) && this.model.position.x >= -40) {
			if (this.model.position.x == -40){
				//while (this.model.position.x == -40){
				//this should be replaced by a UI arrow event pointing the user back towards
				//the in-play area
				console.log("you've gone too far!!"); 
				//arrow = new Three.MeshNormalMaterial
					cameraPositionX = this.model.position.x; 
					cameraPositionY = this.model.position.y; 
					cameraPositionZ = this.model.position.z; 
					canvas1 = document.createElement('canvas');
					context1 = canvas1.getContext('2d');
					context1.font = "Bold 40px Arial";
					context1.fillStyle = "rgba(255,0,0,0.95)";
				    context1.fillText('--->', 0, 50);
				    
					// canvas contents will be used for a texture
					 texture1 = new THREE.Texture(canvas1);
					 texture1.needsUpdate = true;
				      
				     material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
				     material1.transparent = true;

				    mesh1 = new THREE.Mesh(
				        new THREE.PlaneGeometry(canvas1.width, canvas1.height),
				        material1
				      );
				    //console.log("hello"); 
					mesh1.position.set(cameraPositionX, cameraPositionY, cameraPositionZ - 200);
					scene.add(mesh1);
					//console.log("goodbye");
				//}
			}
			this.model.position.x -= 1;
			this.model.rotation.z += .01;
			// var pos = this.model.position.x; 
			// console.log(pos);
			// make the camera move down too?
		}
		if (Key.isDown(Key.D) && this.model.position.x <= 40) {
			if (this.model.position.x == 40){
				//this should be replaced by a UI arrow event pointing the user back towards
				//the in-play area
				console.log("you've gone too far!!"); 
				cameraPositionX = this.model.position.x; 
				cameraPositionY = this.model.position.y; 
				cameraPositionZ = this.model.position.z; 
				canvas1 = document.createElement('canvas');
				context1 = canvas1.getContext('2d');
				context1.font = "Bold 40px Arial";
				context1.fillStyle = "rgba(255,0,0,0.95)";
			    context1.fillText('<---', 0, 50);
			    
				// canvas contents will be used for a texture
				 texture1 = new THREE.Texture(canvas1);
				 texture1.needsUpdate = true;
			      
			     material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
			     material1.transparent = true;

			    mesh1 = new THREE.Mesh(
			        new THREE.PlaneGeometry(canvas1.width, canvas1.height),
			        material1
			      );
			    //console.log("hello"); 
				mesh1.position.set(cameraPositionX + 250, cameraPositionY, cameraPositionZ - 200);
				scene.add(mesh1);
				//console.log("goodbye");


			}
			this.model.position.x += 1;
			this.model.rotation.z -= .01;
		} 
		if (Key.isDown(Key.S) && this.model.position.y >= 10) {
			if (this.model.position.y == 10){
				//this should be replaced by a UI arrow event pointing the user back towards
				//the in-play area
				console.log("you've gone too far!!"); 
				//arrow = new Three.MeshNormalMaterial
				cameraPositionX = this.model.position.x; 
				cameraPositionY = this.model.position.y; 
				cameraPositionZ = this.model.position.z; 
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
			    //console.log("hello"); 
				mesh1.position.set(cameraPositionX + 130 , cameraPositionY +50 , cameraPositionZ - 200);
				scene.add(mesh1);
				//console.log("goodbye");
			}
			this.model.position.y -= 1;
			this.model.rotation.x -= .01;
	   	} 
	   	if (Key.isDown(Key.W) && this.model.position.y <= 45) {
			if (this.model.position.y == 45){
				//this should be replaced by a UI arrow event pointing the user back towards
				//the in-play area
				console.log("you've gone too far!!");
				cameraPositionX = this.model.position.x; 
				cameraPositionY = this.model.position.y; 
				cameraPositionZ = this.model.position.z; 
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
			    //console.log("hello"); 
				mesh1.position.set(cameraPositionX + 130 , cameraPositionY + 20 , cameraPositionZ - 200);
				scene.add(mesh1);
				//console.log("goodbye"); 
			}
			this.model.position.y += 1;
			this.model.rotation.x += .01;
			//var pos = this.model.position.y; 
			//console.log(pos); 
			//console.log("hello"); 
		}
	}
}




