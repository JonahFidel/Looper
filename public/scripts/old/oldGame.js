//////////////////////
// GLOBAL VARIABLES //
//////////////////////

var renderer, scene, camera;

//////////////////////
//    GAME STUFF    //
//////////////////////

function setup() {

	// set up all the 3D objects in the scene
	createScene();

	// begin!
	draw();
}

//////////////////////
//      CONFIG      //
//////////////////////

function createScene(){

	scene = new THREE.Scene();

	var WIDTH = 640, HEIGHT = 360;

	var VIEW_ANGLE = 70,
	    ASPECT = WIDTH / HEIGHT,
	    NEAR = 0.1,
	    FAR = 10000;

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);
	var c = document.getElementById("gameCanvas");
	c.appendChild(renderer.domElement);

	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.z = 30;
	camera.position.y = 30	

	var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 1, 1 ).normalize();
    scene.add(light);

	var terrainGenerator = new TerrainGenerator();

	// These are just an example, more will be generated as the player gets to certain distances 
	terrainGenerator.generateNextTile();
	terrainGenerator.generateNextTile();


	var ship = new Spaceship();
	ship.createSpaceship();
	ship.createMovementListeners();

}

function draw() {	
	// draw THREE.JS scene
	renderer.render(scene, camera);

	// loop draw function call
	updateCamera(); // Do it once to avoid that annoying camera movement!


	shipMovement();
	requestAnimationFrame(draw);
}

function updateCamera(){
	// have the camera be directly behind the spaceship, and up a little
}

//////////////////////
//    GENERATION    //
//////////////////////


function TerrainGenerator(){
	this.zRenderingPosition = 0;
}

TerrainGenerator.prototype = {
	constructor: TerrainGenerator,

	generateNextTile: function(){
	    for (var i = -500; i <= 500; i+=100){

	    	var geometry = new THREE.CubeGeometry(100, 10, 100);
		  	var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('textures/sand.jpg') } );

		    mesh = new THREE.Mesh(geometry, material);
		    mesh.position.z = -this.zRenderingPosition;
	    	mesh.position.x = i;

	    	scene.add(mesh);
	    }
		this.zRenderingPosition += 100;
	}
}

function Spaceship(){
	var ship;
}

Spaceship.prototype = {
	constructor: Spaceship,

	createControlListeners: function(){
		// make button listeners
	},

	setShip: function(theShip){
		this.ship = theShip;
	},

	getShip: function(){
		return this.ship;
	},

	createSpaceship: function(){

		var geometry = new THREE.CubeGeometry(5, 5, 10);
	  	var material = new THREE.MeshNormalMaterial()

	    ship = new THREE.Mesh(geometry, material);
	    ship.position.z = -10;
    	ship.position.y = 10;


    	this.setShip(ship);
    	scene.add(this.ship);

	},

	moveForward: function(){

	},

	createMovementListeners: function(){
		
		var ship = this.getShip();

		window.onkeyup = function(e) {
			var key = e.keyCode ? e.keyCode : e.which;

			if (key == 65) {
			    ship.position.x -= 1;
			} else if (key == 68) {
			    ship.position.x += 1;
			} else if (key == 87){
				ship.position.y += 1;
			} else if (key == 83){
				ship.position.y -= 1;
			}
		}
	}
}



