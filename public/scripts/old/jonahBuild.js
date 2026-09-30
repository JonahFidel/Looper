// Jonah's hosted step from Mike's build toward the first merge.
// Same scene and flight as version2.js, with oldGame.js's cube in place of the imported ship.
// The course, pause, and endless travel from game2.js are not part of this step.

var game = function(){

	var renderer;
	var ship;
	var terrainGenerator;
	var scene;
	var camera;
	var collosionDetector;

	var draw = function(){
		renderer.render(scene, camera);

		updateCameraAndShipPositionOnZAxis();

		handleInput();

		if (collosionDetector.detectCollision()){
			this.endGame();
		}

		requestAnimationFrame(draw);
	};

	var createScene = function(){

		scene = new THREE.Scene();
		var WIDTH = 960, HEIGHT = 540;
		var VIEW_ANGLE = 70,
		    ASPECT = WIDTH / HEIGHT,
		    NEAR = 0.1,
		    FAR = 1000;

		renderer = new THREE.WebGLRenderer();
		renderer.setSize(WIDTH, HEIGHT);
		var c = document.getElementById("gameCanvas");
		c.appendChild(renderer.domElement);

		camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
		scene.add(camera);
		camera.position.z = 30;
		camera.position.y = 20;

		var light = new THREE.DirectionalLight( 0xffffff );
	    light.position.set( 0, 1, 1 ).normalize();
	    scene.add(light);
	    var secondLight = new THREE.DirectionalLight( 0xff99ff );
	    camera.add(secondLight);

		terrainGenerator = new TerrainGenerator();
		terrainGenerator.generateInitialTiles(scene);
	};

	var handleInput = function(){
		if (Key.isDown(Key.A)){
			ship.position.x -= 1;
			ship.rotation.z += .01;
		}
		if (Key.isDown(Key.D)) {
			ship.position.x += 1;
			ship.rotation.z -= .01;
		}
		if (Key.isDown(Key.S)) {
			ship.position.y -= 1;
			ship.rotation.x -= .01;
	   	}
	   	if (Key.isDown(Key.W)) {
			ship.position.y += 1;
			ship.rotation.x += .01;
		}
	};

	var initializeBox = function(){
		var geometry = new THREE.CubeGeometry(5, 5, 10);
		var material = new THREE.MeshNormalMaterial();

		ship = new THREE.Mesh(geometry, material);
		ship.position.y = 50;
		ship.position.z = -100;
		ship.rotation.y = 3.14;
		ship.rotation.x = .5;
		ship.scale.set(5, 5, 5);
		camera.add(ship);
	};

	var initializeCollisionDetector = function(){
		collosionDetector = new CollisionDetector(ship, terrainGenerator, terrainGenerator.activeTerrain,
												  terrainGenerator.getObstacleGenerator().activeObstacles);
	};

	var endGame = function(){
		console.log("There was a collision and you died lol");
	};

	var updateCameraAndShipPositionOnZAxis = function(){
		camera.position.z -= 1;
	};

	(function main(){
		createScene();
		initializeBox();
		initializeCollisionDetector();
		draw();
	})();

};

function CollisionDetector(shipMesh, terrainList, obstacleList){
	this.ship = shipMesh;
	this.activeTerrainList = terrainList;
	this.activeObstacleList = obstacleList;
}

CollisionDetector.prototype = {

	detectCollision: function(){
		return false;
	}

};

function ObstacleGenerator(){
	this.activeObstacles = [];
	this.obstacleGeometries = [new THREE.CubeGeometry(10, 10, 10), new THREE.CylinderGeometry( 1, 10, 10, 10 )];
	this.obstacleMaterials = [new THREE.MeshNormalMaterial()];
}

ObstacleGenerator.prototype = {
	constructor: ObstacleGenerator,

	generateObstacles: function(zCoordinateOfTile, scene){

		var i = 1;
		obstacle = new THREE.Mesh(this.obstacleGeometries[i], this.obstacleMaterials[i]);

		obstacle.position.x = (Math.random() * 200) - 100;

		obstacle.position.y = 5;
		obstacle.position.z = -zCoordinateOfTile;

		this.activeObstacles.push(obstacle);
	    this.activeObstacles.shift();

		scene.add(obstacle);

	}
};

function TerrainGenerator(){
	this.zRenderingPosition = 0;
	this.activeTerrain = [];
	this.sizeOfTerrain = 100;
	this.obstacleGenerator = new ObstacleGenerator();

	this.terrainGeometry = new THREE.CubeGeometry(10, 10, 1);
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

	generateInitialTiles: function(scene){
		this.generateNextTile(scene);
		this.generateNextTile(scene);
		this.generateNextTile(scene);
		this.generateNextTile(scene);
	},

	generateNextTile: function(scene){

		var START = -200;
		var END = 200;

	    for (var i = START; i <= END; i+=100){

	    	var AT = this.getActiveTerrain();
	    	var zPos = this.zRenderingPosition;

	  		this.loader.load(
				'textures/ruggedTerrain3.json',

				function (geometry) {

					var material = new THREE.MeshPhongMaterial({
						color:0xffffff,
						map: THREE.ImageUtils.loadTexture('textures/sand.jpg'),
						bumpMap: THREE.ImageUtils.loadTexture('textures/sandBumpMap.jpg'),
						bumpScale: 0.5
					});

					var object1 = new THREE.Mesh(geometry, material);

					object1.position.y = -150;
					object1.position.z = -zPos-400;
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
		this.zRenderingPosition += 100;
	}
};
