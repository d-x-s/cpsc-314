/////////////////////////////////////////////////////////////////////////////////////////
//  UBC CPSC 314,  January 2023  -- A3 Template
/////////////////////////////////////////////////////////////////////////////////////////

console.log('Hello world -- A3 Jan 2023');

var a=7;  
var b=2.6;
console.log('a=',a,'b=',b);
var myvector = new THREE.Vector3(0,1,2);
console.log('myvector =',myvector);

var animation = true;
var catJump = true;
var catStretch = false;
var meshesLoaded = false;
var RESOURCES_LOADED = false;
var deg2rad = Math.PI/180;

// give the following global scope (in this file), which is useful for motions and objects
// that are related to animation

var myboxMotion = new Motion(myboxSetMatrices);     
var handMotion = new Motion(handSetMatrices);     
var link1, link2, link3, link4, link5;
var linkFrame1, linkFrame2, linkFrame3, linkFrame4, linkFrame5;
var sphere;    
var mybox;     
var meshes = {};  

// declare cat vars
var catMotion = new Motion(catSetMatrices);
var catStretchMotion = new Motion(catSetMatrices);

var catBody; var catBodyFrame;

var catNeck; var catNeckFrame;

var catHead; var catHeadFrame;

var catEar1; var catEar1Frame;
var catEar2; var catEar2Frame;

var catTail1; var catTail1Frame;
var catTail2; var catTail2Frame;

var catLeftHumerus; var catLeftHumerusFrame;
var catLeftUlna;  var catLeftUlnaFrame;

var catRightHumerus; var catRightHumerusFrame;
var catRightUlna; var catRightUlnaFrame;

var catLeftFemur; var catLeftFemurFrame;
var catLeftTibia; var catLeftTibiaFrame;
var catLeftFoot; var catLeftFootFrame;

var catRightFemur; var catRightFemurFrame;
var catRightTibia; var catRightTibiaFrame;
var catRightFoot; var catRightFootFrame;

var catLeftHumerusJoint; var catLeftHumerusJointFrame;
var catRightHumerusJoint; var catRightHumerusJointFrame;

var ball;

// SETUP RENDERER & SCENE

var canvas = document.getElementById('canvas');
var camera;
var light;
var ambientLight;
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x01131e, 0.005);
var renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setClearColor(0xd0f0d0);     // set background colour
canvas.appendChild(renderer.domElement);

const listener = new THREE.AudioListener();
const sound = new THREE.Audio( listener );
const audioLoader = new THREE.AudioLoader();

//////////////////////////////////////////////////////////
//  initCamera():   SETUP CAMERA
//////////////////////////////////////////////////////////

function initCamera() {
    // set up M_proj    (internally:  camera.projectionMatrix )
    var cameraFov = 30;     // initial camera vertical field of view, in degrees
      // view angle, aspect ratio, near, far
    camera = new THREE.PerspectiveCamera(cameraFov,1,0.1,1000); 

    var width = 10;  var height = 5;
//    camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 0.1, 1000 );

    // set up M_view:   (internally:  camera.matrixWorldInverse )
    camera.position.set(0,12,20);
    camera.up = new THREE.Vector3(0,1,0);
    camera.lookAt(0,0,0);
    scene.add(camera);

    camera.add( listener );


      // SETUP ORBIT CONTROLS OF THE CAMERA
//    const controls = new OrbitControls( camera, renderer.domElement );
    var controls = new THREE.OrbitControls(camera);
    controls.damping = 0.2;
    controls.autoRotate = false;
};

// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
}

//SCROLLBAR FUNCTION DISABLE
window.onscroll = function () {
     window.scrollTo(0,0);
}

////////////////////////////////////////////////////////////////////////	
// init():  setup up scene
////////////////////////////////////////////////////////////////////////	

function init() {
    console.log('init called');

    initCamera();
    initMotions();
    initLights();
    initObjects();
    initHand();
    initCat();
    initFileObjects();

    window.addEventListener('resize',resize);
    resize();
};

////////////////////////////////////////////////////////////////////////
// initMotions():  setup Motion instances for each object that we wish to animate
// set the keyframes here
////////////////////////////////////////////////////////////////////////

function initMotions() {

    myboxMotion.addKeyFrame(new Keyframe('pose A',0.0, [5, -10, 0, 0]));
    myboxMotion.addKeyFrame(new Keyframe('pose B',1.0, [5, -10, 0, -90]));
    myboxMotion.addKeyFrame(new Keyframe('pose C',2.0, [5, -5, 0, 0])); // change the y parameter of this keyframe to shoot it high up
    myboxMotion.addKeyFrame(new Keyframe('pose D',3.0, [5, -10, 0, 0]));
    myboxMotion.addKeyFrame(new Keyframe('pose A',4.0, [5, -10, 0, 0]));

      // basic interpolation test, just printing interpolation result to the console
    myboxMotion.currTime = 0.1;
    console.log('kf',myboxMotion.currTime,'=',myboxMotion.getAvars());    // interpolate for t=0.1
    myboxMotion.currTime = 2.9;
    console.log('kf',myboxMotion.currTime,'=',myboxMotion.getAvars());    // interpolate for t=2.9

      // keyframes for hand:    name, time, [x, y, theta1, theta2, theta3, theta4, theta5]
    handMotion.addKeyFrame(new Keyframe('straight',         0.0, [0, 3,    0, 0, 0, 0, 0]));
    handMotion.addKeyFrame(new Keyframe('right finger curl',1.0, [0, 3,    0, +180, -180, 0,0]));
    handMotion.addKeyFrame(new Keyframe('straight',         2.0, [0, 3,    0, 0, 0, 0, 0]));
    handMotion.addKeyFrame(new Keyframe('left finger curl', 3.0, [0, 3,    0, 0, 0, -90,-90]));
    handMotion.addKeyFrame(new Keyframe('straight',         4.0, [0, 3,    0, 0, 0, 0, 0]));
    handMotion.addKeyFrame(new Keyframe('both fingers curl',4.5, [0, 3,    0, -90, -90, -90,-90]));
    handMotion.addKeyFrame(new Keyframe('straight',         6.0, [0, 3,    0, 0, 0, 0, 0]));

    // catMotion
    // keyframes for the cat animated motion:   name, time, [x, y, z, theta1, theta2, theta3, theta4, theta5, theta6, theta7, theta8, theta9]
    catMotion.addKeyFrame(new Keyframe('neutral',0.0,  [0, 3, 0, -10,  -90, 0, 45, 90,  157.5, -144, 135, -90, 4, 0]));
    catMotion.addKeyFrame(new Keyframe('move'   ,1.0,  [0, 4, 0,  15,  -45, 0, 60, 100, 170,   -130, 110, -70, 4, 0]));
    catMotion.addKeyFrame(new Keyframe('move'   ,2.0,  [0, 5, 0,  15,  -45, 0, 60, 80,  165,   -130, 110, -70, 4, 0]));
    catMotion.addKeyFrame(new Keyframe('finish' ,3.0,  [0, 3, 0, -10,  -90, 0, 45, 90,  157.5, -144, 135, -90, 4, 0]));

    // catStretchMotion
    // keyframes for the cat animated motion:   name, time, [x, y, z, theta1, theta2, theta3, theta4, theta5, theta6, theta7, theta8, theta9]
    catStretchMotion.addKeyFrame(new Keyframe('neutral' ,0.0,  [0, 3, 0, -10, -90, 0, 45, 90, 157.5, -144, 135, -90, 4, 0, 0]));
    catStretchMotion.addKeyFrame(new Keyframe('move'    ,1.0,  [0, 3, 0,   0, -45, 0, 45, 90, 100, -144, 135, -120, 7, 4, 180]));
    catStretchMotion.addKeyFrame(new Keyframe('move'    ,3.0,  [0, 3, 0,   0, -45, 0, 45, 90, 100, -144, 135, -120, 7, 0, 360]));
    catStretchMotion.addKeyFrame(new Keyframe('finish'  ,4.0,  [0, 3, 0, -10, -90, 0, 45, 90, 157.5, -144, 135, -90, 4, 0, 0]));
}

///////////////////////////////////////////////////////////////////////////////////////
// catSetMatrices(avars)
// position the body parts here (and add animation variables if necessary)
///////////////////////////////////////////////////////////////////////////////////////
function catSetMatrices(avars) {
  var xPosition = avars[0];
  var yPosition = avars[1];
  var zPosition = avars[2];
  var theta1 = avars[3]*deg2rad;  // controls neck rotation
  var theta2 = avars[4]*deg2rad;  // controls tail 1 rotation
  var theta3 = avars[5]*deg2rad;  // controls tail 2 rotation
  var theta4 = avars[6]*deg2rad;  // controls humerus rotation
  var theta5 = avars[7]*deg2rad;  // controls ulna rotation
  var theta6 = avars[8]*deg2rad;  // controls femur rotation
  var theta7 = avars[9]*deg2rad;  // controls tibia rotation
  var theta8 = avars[10]*deg2rad; // controls foot rotation
  var theta9 = avars[11]*deg2rad; // controls body rotation
  var ballPosX = avars[12];
  var ballPosY = avars[13];
  var ballSpin = avars[14]*deg2rad;
  var M =  new THREE.Matrix4();

  ball.matrix.identity();
  ball.matrix.multiply(M.makeTranslation(-ballPosX, ballPosY, 0));
  ball.matrix.multiply(M.makeRotationZ(ballSpin));

  catBodyFrame.matrix.identity();
  catBodyFrame.matrix.multiply(M.makeTranslation(0, yPosition, 0));  
  catBodyFrame.matrix.multiply(M.makeRotationZ(theta9));
  catBody.matrix.copy(catBodyFrame.matrix);

  catNeckFrame.matrix.copy(catBodyFrame.matrix);
  catNeckFrame.matrix.multiply(M.makeTranslation(-0.5, 3.25, 0));
  catNeckFrame.matrix.multiply(M.makeRotationZ(theta1));
  catNeck.matrix.copy(catNeckFrame.matrix);

  catHeadFrame.matrix.copy(catNeckFrame.matrix);
  catHeadFrame.matrix.multiply(M.makeTranslation(-0.5, 1.5, 0))
  catHead.matrix.copy(catHeadFrame.matrix);

  catEar1Frame.matrix.copy(catHeadFrame.matrix);
  catEar1.matrix.copy(catEar1Frame.matrix);
  catEar1.matrix.multiply(M.makeTranslation(-1.25, 0, 1.25));
  catEar1.matrix.multiply(M.makeRotationZ(Math.PI/2));
  catEar1.matrix.multiply(M.makeRotationX(Math.PI/4));

  catEar2Frame.matrix.copy(catHeadFrame.matrix);
  catEar2.matrix.copy(catEar2Frame.matrix);
  catEar2.matrix.multiply(M.makeTranslation(-1.25, 0, -1.25));
  catEar2.matrix.multiply(M.makeRotationZ(Math.PI/2));
  catEar2.matrix.multiply(M.makeRotationX(-Math.PI/4));

  catTail1Frame.matrix.copy(catBodyFrame.matrix);
  catTail1Frame.matrix.multiply(M.makeTranslation(-1.5, -3, 0));
  catTail1Frame.matrix.multiply(M.makeRotationZ(theta2));
  catTail1.matrix.copy(catTail1Frame.matrix);

  catTail2Frame.matrix.copy(catTail1Frame.matrix);
  catTail2Frame.matrix.multiply(M.makeTranslation(0.7, -1.6, 0));
  catTail2.matrix.copy(catTail2Frame.matrix);
  catTail2.matrix.multiply(M.makeRotationZ(Math.PI/4));

  catLeftHumerusFrame.matrix.copy(catBodyFrame.matrix);
  catLeftHumerusFrame.matrix.multiply(M.makeRotationZ(theta4));
  catLeftHumerusFrame.matrix.multiply(M.makeTranslation(2.5, 0.25, -0.75));
  catLeftHumerus.matrix.copy(catLeftHumerusFrame.matrix);

  catLeftHumerusJointFrame.matrix.copy(catLeftHumerusFrame.matrix);
  catLeftHumerusJointFrame.matrix.multiply(M.makeTranslation(0, -1, 0,));
  catLeftHumerusJoint.matrix.copy(catLeftHumerusJointFrame.matrix);

  catLeftUlnaFrame.matrix.copy(catLeftHumerus.matrix);
  catLeftUlnaFrame.matrix.multiply(M.makeRotationZ(theta5));
  catLeftUlnaFrame.matrix.multiply(M.makeTranslation(-1, -0.75, 0));
  catLeftUlna.matrix.copy(catLeftUlnaFrame.matrix);

  catRightHumerusFrame.matrix.copy(catBodyFrame.matrix);
  catRightHumerusFrame.matrix.multiply(M.makeRotationZ(theta4));
  catRightHumerusFrame.matrix.multiply(M.makeTranslation(2.5, 0.25, 0.75));
  catRightHumerus.matrix.copy(catRightHumerusFrame.matrix);

  catRightHumerusJointFrame.matrix.copy(catRightHumerusFrame.matrix);
  catRightHumerusJointFrame.matrix.multiply(M.makeTranslation(0, -1, 0,));
  catRightHumerusJoint.matrix.copy(catRightHumerusJointFrame.matrix);

  catRightUlnaFrame.matrix.copy(catRightHumerusFrame.matrix);
  catRightUlnaFrame.matrix.multiply(M.makeRotationZ(theta5));
  catRightUlnaFrame.matrix.multiply(M.makeTranslation(-1, -0.75, 0));
  catRightUlna.matrix.copy(catRightUlnaFrame.matrix);

  catLeftFemurFrame.matrix.copy(catBodyFrame.matrix);
  catLeftFemurFrame.matrix.multiply(M.makeTranslation(1.25, -1.8, -0.75));
  catLeftFemurFrame.matrix.multiply(M.makeRotationZ(theta6));
  catLeftFemur.matrix.copy(catLeftFemurFrame.matrix);

  catLeftFemurJointFrame.matrix.copy(catLeftFemurFrame.matrix);
  catLeftFemurJointFrame.matrix.multiply(M.makeTranslation(-0.05, -1, 0,));
  catLeftFemurJoint.matrix.copy(catLeftFemurJointFrame.matrix);

  catLeftTibiaFrame.matrix.copy(catLeftFemurFrame.matrix);
  catLeftTibiaFrame.matrix.multiply(M.makeRotationZ(theta7)); //-(1/1.25)
  catLeftTibiaFrame.matrix.multiply(M.makeTranslation(0.75, -0.15, 0));
  catLeftTibia.matrix.copy(catLeftTibiaFrame.matrix);

  catLeftTibiaJointFrame.matrix.copy(catLeftTibiaFrame.matrix);
  catLeftTibiaJointFrame.matrix.multiply(M.makeTranslation(0.1, -0.8, 0,));
  catLeftTibiaJoint.matrix.copy(catLeftTibiaJointFrame.matrix);

  catLeftFootFrame.matrix.copy(catLeftTibiaFrame.matrix);
  catLeftFootFrame.matrix.multiply(M.makeRotationZ(theta8));
  catLeftFootFrame.matrix.multiply(M.makeTranslation(-0.75, -0.25, 0));
  catLeftFoot.matrix.copy(catLeftFootFrame.matrix);

  catRightFemurFrame.matrix.copy(catBodyFrame.matrix);
  catRightFemurFrame.matrix.multiply(M.makeTranslation(1.25, -1.8, 0.75));
  catRightFemurFrame.matrix.multiply(M.makeRotationZ(theta6));
  catRightFemur.matrix.copy(catRightFemurFrame.matrix);

  catRightFemurJointFrame.matrix.copy(catRightFemurFrame.matrix);
  catRightFemurJointFrame.matrix.multiply(M.makeTranslation(-0.05, -1, 0,));
  catRightFemurJoint.matrix.copy(catRightFemurJointFrame.matrix);

  catRightTibiaFrame.matrix.copy(catRightFemurFrame.matrix);
  catRightTibiaFrame.matrix.multiply(M.makeRotationZ(theta7)); //-(1/1.25)
  catRightTibiaFrame.matrix.multiply(M.makeTranslation(0.75, -0.15, 0));
  catRightTibia.matrix.copy(catRightTibiaFrame.matrix);
  
  catRightTibiaJointFrame.matrix.copy(catRightTibiaFrame.matrix);
  catRightTibiaJointFrame.matrix.multiply(M.makeTranslation(0.1, -0.8, 0));
  catRightTibiaJoint.matrix.copy(catRightTibiaJointFrame.matrix);
  
  catRightFootFrame.matrix.copy(catRightTibiaFrame.matrix);
  catRightFootFrame.matrix.multiply(M.makeRotationZ(theta8));
  catRightFootFrame.matrix.multiply(M.makeTranslation(-0.75, -0.25, 0));
  catRightFoot.matrix.copy(catRightFootFrame.matrix);

  ///

  catBody.updateMatrixWorld();  
  catNeck.updateMatrixWorld();
  catHead.updateMatrixWorld();
  catEar1.updateMatrixWorld();
  catEar2.updateMatrixWorld();
  catTail1.updateMatrixWorld();
  catTail2.updateMatrixWorld();
  catLeftHumerus.updateMatrixWorld();
  catLeftUlna.updateMatrixWorld();
  catRightHumerus.updateMatrixWorld();
  catRightUlna.updateMatrixWorld();
  catLeftFoot.updateMatrixWorld();
  catLeftHumerusJoint.updateMatrixWorld();
  catRightHumerusJoint.updateMatrixWorld();

  catBodyFrame.updateMatrixWorld();
  catNeckFrame.updateMatrixWorld();
  catHeadFrame.updateMatrixWorld();
  catEar1Frame.updateMatrixWorld();
  catEar2Frame.updateMatrixWorld();
  catTail1Frame.updateMatrixWorld();
  catTail2Frame.updateMatrixWorld();
  catLeftHumerusFrame.updateMatrixWorld();
  catLeftUlnaFrame.updateMatrixWorld();
  catRightHumerusFrame.updateMatrixWorld();
  catRightUlnaFrame.updateMatrixWorld();
  catLeftFootFrame.updateMatrixWorld();
  catLeftHumerusJointFrame.updateMatrixWorld();
  catRightHumerusJointFrame.updateMatrixWorld();
}

/////////////////////////////////////////////////////////////////////////////////////
//  initCat():  define all geometry associated with the cat
//  initialize all the body parts of the cat here
/////////////////////////////////////////////////////////////////////////////////////

function initCat() {
  //var catMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff} );
  var catMaterial = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/fur.jpg') })
  var ballMaterial = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/beachball.jpg') })



  // BODY
  // cylinder
  // parameters:  radiusAtTop, radiusAtBottom, height, radialSegments, heightSegments
  var bodyCylinder = new THREE.CylinderGeometry( 1.4, 1.5, 6, 20, 4 );
  catBody = new THREE.Mesh( bodyCylinder, catMaterial );  
  scene.add( catBody );

  catBodyFrame = new THREE.AxesHelper(10);
  scene.add( catBodyFrame );

  catBody.matrixAutoUpdate = false; 
  catBodyFrame.matrixAutoUpdate = false; 

  // NECK
  // cylinder
  // parameters: radiusAtTop, radiusAtBottom, height, radialSegments, heightSegments
  var neckCylinder = new THREE.CylinderGeometry( 0.75, 0.75, 3, 20, 4 );
  catNeck = new THREE.Mesh( neckCylinder, catMaterial );  
  scene.add( catNeck );

  catNeckFrame = new THREE.AxesHelper(1);
  scene.add( catNeckFrame );

  catNeck.matrixAutoUpdate = false;
  catNeckFrame.matrixAutoUpdate = false;

  // HEAD
  // sphere
  // parameters: radius, segments, segments
  var headSphere = new THREE.SphereGeometry(1.5, 32, 32);
  catHead = new THREE.Mesh( headSphere, catMaterial );  
  scene.add( catHead );

  catHeadFrame = new THREE.AxesHelper(3);
  scene.add( catHeadFrame );

  catHead.matrixAutoUpdate = false;
  catHeadFrame.matrixAutoUpdate = false;

  // EAR 1
  // cone
  // parameters: radiusTop, radiusBot, height, radialSegments, heightSegments
  var coneGeometry = new THREE.CylinderGeometry( 0.0, 0.30, 0.80, 20, 4 );
  catEar1 = new THREE.Mesh( coneGeometry, catMaterial );  
  scene.add( catEar1 );

  catEar1Frame = new THREE.AxesHelper(3);
  scene.add( catEar1Frame );

  catEar1.matrixAutoUpdate = false;
  catEar1Frame.matrixAutoUpdate = false;

  // EAR 2
  // cone
  // parameters: radiusTop, radiusBot, height, radialSegments, heightSegments
  var coneGeometry = new THREE.CylinderGeometry( 0.0, 0.30, 0.80, 20, 4 );
  catEar2 = new THREE.Mesh( coneGeometry, catMaterial );  
  scene.add( catEar2 );

  catEar2Frame = new THREE.AxesHelper(3);
  scene.add( catEar2Frame );

  catEar2.matrixAutoUpdate = false;
  catEar2Frame.matrixAutoUpdate = false;

  // TAIL 1
  // cylinder
  // parameters: radiusAtTop, radiusAtBottom, height, radialSegments, heightSegments
  var tailCylinder = new THREE.CylinderGeometry( 0.1, 0.1, 2, 20, 4 );
  catTail1 = new THREE.Mesh( tailCylinder, catMaterial );  
  scene.add( catTail1 );

  catTail1Frame = new THREE.AxesHelper(0);
  scene.add( catTail1Frame );

  catTail1.matrixAutoUpdate = false;
  catTail1Frame.matrixAutoUpdate = false;

  // TAIL 2
  // cylinder
  // parameters: radiusAtTop, radiusAtBottom, height, radialSegments, heightSegments
  var tailCylinder = new THREE.CylinderGeometry( 0.1, 0.1, 2, 20, 4 );
  catTail2 = new THREE.Mesh( tailCylinder, catMaterial );  
  scene.add( catTail2 );

  catTail2Frame = new THREE.AxesHelper(0);
  scene.add( catTail2Frame );

  catTail2.matrixAutoUpdate = false;
  catTail2Frame.matrixAutoUpdate = false;

  // LEFT HUMERUS
  // cylinder
  // parameters: radiusAtTop, radiusAtBottom, height, radialSegments, heightSegments
  var humerusCylinder = new THREE.CylinderGeometry( 0.25, 0.13, 2, 20, 4 );
  catLeftHumerus = new THREE.Mesh( humerusCylinder, catMaterial );  
  scene.add( catLeftHumerus );

  catLeftHumerusFrame = new THREE.AxesHelper(0);
  scene.add( catLeftHumerusFrame );

  catLeftHumerus.matrixAutoUpdate = false;
  catLeftHumerusFrame.matrixAutoUpdate = false;

  // LEFT HUMERUS JOINT
  // sphere
  var humerusJointSphere = new THREE.SphereGeometry(0.2, 32, 32);
  catLeftHumerusJoint = new THREE.Mesh( humerusJointSphere, catMaterial );
  scene.add( catLeftHumerusJoint );

  catLeftHumerusJointFrame = new THREE.AxesHelper(0);
  scene.add( catLeftHumerusJointFrame );

  catLeftHumerusJoint.matrixAutoUpdate = false;
  catLeftHumerusJointFrame.matrixAutoUpdate = false;

  // LEFT ULNA
  // cylinder
  // parameters: radiusAtTop, radiusAtBottom, height, radialSegments, heightSegments
  var ulnaCylinder = new THREE.CylinderGeometry( 0.13, 0.07, 1.5, 20, 4 );
  catLeftUlna = new THREE.Mesh( ulnaCylinder, catMaterial );  
  scene.add( catLeftUlna );

  catLeftUlnaFrame = new THREE.AxesHelper(0);
  scene.add( catLeftUlnaFrame );

  catLeftUlna.matrixAutoUpdate = false;
  catLeftUlnaFrame.matrixAutoUpdate = false;
  
  // RIGHT HUMERUS
  // cylinder
  // parameters: radiusAtTop, radiusAtBottom, height, radialSegments, heightSegments
  var humerusCylinder = new THREE.CylinderGeometry( 0.25, 0.13, 2, 20, 4 );
  catRightHumerus = new THREE.Mesh( humerusCylinder, catMaterial );  
  scene.add( catRightHumerus );

  catRightHumerusFrame = new THREE.AxesHelper(0);
  scene.add( catRightHumerusFrame );

  catRightHumerus.matrixAutoUpdate = false;
  catRightHumerusFrame.matrixAutoUpdate = false;

  // RIGHT HUMERUS JOINT
  // sphere
  var humerusJointSphere = new THREE.SphereGeometry(0.2, 32, 32);
  catRightHumerusJoint = new THREE.Mesh( humerusJointSphere, catMaterial );
  scene.add( catRightHumerusJoint );

  catRightHumerusJointFrame = new THREE.AxesHelper(0);
  scene.add( catRightHumerusJointFrame );

  catRightHumerusJoint.matrixAutoUpdate = false;
  catRightHumerusJointFrame.matrixAutoUpdate = false;

  // RIGHT ULNA
  // cylinder
  // parameters: radiusAtTop, radiusAtBottom, height, radialSegments, heightSegments
  var ulnaCylinder = new THREE.CylinderGeometry( 0.13, 0.07, 1.5, 20, 4 );
  catRightUlna = new THREE.Mesh( ulnaCylinder, catMaterial );  
  scene.add( catRightUlna );

  catRightUlnaFrame = new THREE.AxesHelper(0);
  scene.add( catRightUlnaFrame );

  catRightUlna.matrixAutoUpdate = false;
  catRightUlnaFrame.matrixAutoUpdate = false;

  // LEFT FEMUR
  // cylinder
  // parameters: radiusAtTop, radiusAtBottom, height, radialSegments, heightSegments
  var femurCylinder = new THREE.CylinderGeometry( 0.25, 0.13, 2, 20, 4 );
  catLeftFemur = new THREE.Mesh( femurCylinder, catMaterial );  
  scene.add( catLeftFemur );

  catLeftFemurFrame = new THREE.AxesHelper(0);
  scene.add( catLeftFemurFrame );

  catLeftFemur.matrixAutoUpdate = false;
  catLeftFemurFrame.matrixAutoUpdate = false;

  // LEFT FEMUR JOINT
  // sphere
  var femurJointSphere = new THREE.SphereGeometry(0.25, 32, 32);
  catLeftFemurJoint = new THREE.Mesh( femurJointSphere, catMaterial );
  scene.add( catLeftFemurJoint );

  catLeftFemurJointFrame = new THREE.AxesHelper(0);
  scene.add( catLeftFemurJointFrame );

  catLeftFemurJoint.matrixAutoUpdate = false;
  catLeftFemurJointFrame.matrixAutoUpdate = false;

  // LEFT TIBIA
  // cylinder
  // parameters: radiusAtTop, radiusAtBottom, height, radialSegments, heightSegments
  var tibiaCylinder = new THREE.CylinderGeometry( 0.13, 0.13, 1.75, 20, 4 );
  catLeftTibia = new THREE.Mesh( tibiaCylinder, catMaterial );  
  scene.add( catLeftTibia );

  catLeftTibiaFrame = new THREE.AxesHelper(0);
  scene.add( catLeftTibiaFrame );

  catLeftTibia.matrixAutoUpdate = false;
  catLeftTibiaFrame.matrixAutoUpdate = false;

  // LEFT TIBIA JOINT
  // sphere
  var femurJointSphere = new THREE.SphereGeometry(0.2, 32, 32);
  catLeftTibiaJoint = new THREE.Mesh( femurJointSphere, catMaterial );
  scene.add( catLeftTibiaJoint );

  catLeftTibiaJointFrame = new THREE.AxesHelper(0);
  scene.add( catLeftTibiaJointFrame );

  catLeftTibiaJoint.matrixAutoUpdate = false;
  catLeftTibiaJointFrame.matrixAutoUpdate = false;
  
  // LEFT FOOT
  // cylinder
  // parameters: radiusAtTop, radiusAtBottom, height, radialSegments, heightSegments
  var footCylinder = new THREE.CylinderGeometry( 0.13, 0.07, 1.25, 20, 4 );
  catLeftFoot = new THREE.Mesh( footCylinder, catMaterial );  
  scene.add( catLeftFoot );

  catLeftFootFrame = new THREE.AxesHelper(0);
  scene.add( catLeftFootFrame );

  catLeftFoot.matrixAutoUpdate = false;
  catLeftFootFrame.matrixAutoUpdate = false;

  // RIGHT FEMUR
  // cylinder
  // parameters: radiusAtTop, radiusAtBottom, height, radialSegments, heightSegments
  var femurCylinder = new THREE.CylinderGeometry( 0.25, 0.13, 2, 20, 4 );
  catRightFemur = new THREE.Mesh( femurCylinder, catMaterial );  
  scene.add( catRightFemur );

  catRightFemurFrame = new THREE.AxesHelper(0);
  scene.add( catRightFemurFrame );

  catRightFemur.matrixAutoUpdate = false;
  catRightFemurFrame.matrixAutoUpdate = false;

  // RIGHT FEMUR JOINT
  // sphere
  var femurJointSphere = new THREE.SphereGeometry(0.25, 32, 32);
  catRightFemurJoint = new THREE.Mesh( femurJointSphere, catMaterial );
  scene.add( catRightFemurJoint );

  catRightFemurJointFrame = new THREE.AxesHelper(0);
  scene.add( catRightFemurJointFrame );

  catRightFemurJoint.matrixAutoUpdate = false;
  catRightFemurJointFrame.matrixAutoUpdate = false;

  // RIGHT TIBIA
  // cylinder
  // parameters: radiusAtTop, radiusAtBottom, height, radialSegments, heightSegments
  var tibiaCylinder = new THREE.CylinderGeometry( 0.13, 0.13, 1.75, 20, 4 );
  catRightTibia = new THREE.Mesh( tibiaCylinder, catMaterial );  
  scene.add( catRightTibia );

  catRightTibiaFrame = new THREE.AxesHelper(0);
  scene.add( catRightTibiaFrame );

  catRightTibia.matrixAutoUpdate = false;
  catRightTibiaFrame.matrixAutoUpdate = false;

  // RIGHT TIBIA JOINT
  // sphere
  var femurJointSphere = new THREE.SphereGeometry(0.2, 32, 32);
  catRightTibiaJoint = new THREE.Mesh( femurJointSphere, catMaterial );
  scene.add( catRightTibiaJoint );

  catRightTibiaJointFrame = new THREE.AxesHelper(0);
  scene.add( catRightTibiaJointFrame );

  catRightTibiaJoint.matrixAutoUpdate = false;
  catRightTibiaJointFrame.matrixAutoUpdate = false;
  
  // RIGHT FOOT
  // cylinder
  // parameters: radiusAtTop, radiusAtBottom, height, radialSegments, heightSegments
  var footCylinder = new THREE.CylinderGeometry( 0.13, 0.07, 1.25, 20, 4 );
  catRightFoot = new THREE.Mesh( footCylinder, catMaterial );  
  scene.add( catRightFoot );

  catRightFootFrame = new THREE.AxesHelper(0);
  scene.add( catRightFootFrame );

  catRightFoot.matrixAutoUpdate = false;
  catRightFootFrame.matrixAutoUpdate = false;

  // BEACH BALL
  // sphere
  // parameters: radius, segments, segments
  var headSphere = new THREE.SphereGeometry(1.5, 32, 32);
  ball = new THREE.Mesh( headSphere, ballMaterial );  
  scene.add( ball );
  ball.matrixAutoUpdate = false;


}






///////////////////////////////////////////////////////////////////////////////////////
// handSetMatrices(avars)
///////////////////////////////////////////////////////////////////////////////////////

function handSetMatrices(avars) {
  var xPosition = avars[0];
  var yPosition = avars[1];
  var theta1 = avars[2]*deg2rad;
  var theta2 = avars[3]*deg2rad;
  var theta3 = avars[4]*deg2rad;
  var theta4 = avars[5]*deg2rad;
  var theta5 = avars[6]*deg2rad;
  var M =  new THREE.Matrix4();
  
    ////////////// link1 
  linkFrame1.matrix.identity(); 
  linkFrame1.matrix.multiply(M.makeTranslation(xPosition,-yPosition*3,10));  // move the hand out of the scene
  // linkFrame1.matrix.multiply(M.makeRotationZ(theta1));    
  linkFrame1.matrix.multiply(M.makeRotationZ(theta5));    
    // Frame 1 has been established, now setup the extra transformations for the scaled box geometry
  link1.matrix.copy(linkFrame1.matrix);
  link1.matrix.multiply(M.makeTranslation(2,0,0));   
  link1.matrix.multiply(M.makeScale(6,1,4)); // make the palm wider

    ////////////// link2
  linkFrame2.matrix.copy(linkFrame1.matrix);      // start with parent frame
  linkFrame2.matrix.multiply(M.makeTranslation(5,0,1));
  linkFrame2.matrix.multiply(M.makeRotationZ(theta2));    
    // Frame 2 has been established, now setup the extra transformations for the scaled box geometry
  link2.matrix.copy(linkFrame2.matrix);
  link2.matrix.multiply(M.makeTranslation(2,0,0));   
  link2.matrix.multiply(M.makeScale(4,1,1));    

    ///////////////  link3
  linkFrame3.matrix.copy(linkFrame2.matrix);
  linkFrame3.matrix.multiply(M.makeTranslation(4,0,0));
  linkFrame3.matrix.multiply(M.makeRotationZ(theta3));    
    // Frame 3 has been established, now setup the extra transformations for the scaled box geometry
  link3.matrix.copy(linkFrame3.matrix);
  link3.matrix.multiply(M.makeTranslation(2,0,0));   
  link3.matrix.multiply(M.makeScale(4,1,1));    

    /////////////// link4
  linkFrame4.matrix.copy(linkFrame1.matrix);
  linkFrame4.matrix.multiply(M.makeTranslation(4,0,-1));
  linkFrame4.matrix.multiply(M.makeRotationZ(theta4));    
    // Frame 4 has been established, now setup the extra transformations for the scaled box geometry
  link4.matrix.copy(linkFrame4.matrix);
  link4.matrix.multiply(M.makeTranslation(2,0,0));   
  link4.matrix.multiply(M.makeScale(4,1,1));    

    // link5
  linkFrame5.matrix.copy(linkFrame4.matrix);
  linkFrame5.matrix.multiply(M.makeTranslation(4,0,0));
  linkFrame5.matrix.multiply(M.makeRotationZ(theta5));    
    // Frame 5 has been established, now setup the extra transformations for the scaled box geometry
  link5.matrix.copy(linkFrame5.matrix);
  link5.matrix.multiply(M.makeTranslation(2,0,0));   
  link5.matrix.multiply(M.makeScale(4,1,1));    

  link1.updateMatrixWorld();
  link2.updateMatrixWorld();
  link3.updateMatrixWorld();
  link4.updateMatrixWorld();
  link5.updateMatrixWorld();

  linkFrame1.updateMatrixWorld();
  linkFrame2.updateMatrixWorld();
  linkFrame3.updateMatrixWorld();
  linkFrame4.updateMatrixWorld();
  linkFrame5.updateMatrixWorld();
}

///////////////////////////////////////////////////////////////////////////////////////
// myboxSetMatrices(avars)
///////////////////////////////////////////////////////////////////////////////////////

function myboxSetMatrices(avars) {
    // note:  in the code below, we use the same keyframe information to animation both
    //        the box and the dragon, i.e., avars[], although only the dragon uses avars[3], as a rotation

     // update position of a box
    mybox.matrixAutoUpdate = false;     // tell three.js not to over-write our updates
    mybox.matrix.identity();              
    mybox.matrix.multiply(new THREE.Matrix4().makeTranslation(avars[0], avars[1], avars[2]));  
    mybox.matrix.multiply(new THREE.Matrix4().makeRotationY(-Math.PI/2));
    mybox.matrix.multiply(new THREE.Matrix4().makeScale(1.0,1.0,1.0));
    mybox.updateMatrixWorld();  

     // update position of a dragon
    var theta = avars[3]*deg2rad;
    meshes["dragon1"].matrixAutoUpdate = false;
    meshes["dragon1"].matrix.identity();
    meshes["dragon1"].matrix.multiply(new THREE.Matrix4().makeTranslation(avars[0],avars[1],0));  
    meshes["dragon1"].matrix.multiply(new THREE.Matrix4().makeRotationX(theta));  
    meshes["dragon1"].matrix.multiply(new THREE.Matrix4().makeScale(0.3,0.3,0.3));
    meshes["dragon1"].updateMatrixWorld();  
}

/////////////////////////////////////	
// initLights():  SETUP LIGHTS
/////////////////////////////////////	

function initLights() {
    light = new THREE.PointLight(0xffff00);
    light.position.set(5,15,5);
    light.castShadow = true;
    scene.add(light);
    ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);
}

/////////////////////////////////////	
// MATERIALS
/////////////////////////////////////	

var diffuseMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff} );
var diffuseMaterial2 = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide } );
var basicMaterial = new THREE.MeshBasicMaterial( {color: 0xff0000} );
var armadilloMaterial = new THREE.MeshBasicMaterial( {color: 0x7fff7f} );

/////////////////////////////////////	
// initObjects():  setup objects in the scene
/////////////////////////////////////	

function initObjects() {
    var worldFrame = new THREE.AxesHelper(5) ;
    worldFrame.position.set(-7, -1, -7);
    scene.add(worldFrame);

    // initiar

    // mybox 
    var myboxGeometry = new THREE.BoxGeometry( 2, 2, 2 );    // width, height, depth
    mybox = new THREE.Mesh( myboxGeometry, diffuseMaterial );
    mybox.position.set(0,4,0);
    scene.add( mybox );

    // textured floor
    var floorTexture = new THREE.TextureLoader().load('images/grass.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(1, 1);
    var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
    var floorGeometry = new THREE.PlaneGeometry(15, 15);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -1.1;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);

    // sphere, located at light position
    var sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);    // radius, segments, segments
    sphere = new THREE.Mesh(sphereGeometry, basicMaterial);
    sphere.position.set(0,4,2);
    sphere.position.set(light.position.x, light.position.y, light.position.z);
    scene.add(sphere);

    // box
    var boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );    // width, height, depth
    var box = new THREE.Mesh( boxGeometry, diffuseMaterial );
    box.position.set(-4, -6, 0);
    scene.add( box );

    // multi-colored cube      [https://stemkoski.github.io/Three.js/HelloWorld.html] 
    var cubeMaterialArray = [];    // order to add materials: x+,x-,y+,y-,z+,z-
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xff3333 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xff8800 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xffff33 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x33ff33 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x3333ff } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x8833ff } ) );
      // Cube parameters: width (x), height (y), depth (z), 
      //        (optional) segments along x, segments along y, segments along z
    var mccGeometry = new THREE.BoxGeometry( 1.5, 1.5, 1.5, 1, 1, 1 );
    var mcc = new THREE.Mesh( mccGeometry, cubeMaterialArray );
    mcc.position.set(0,-6,0);
    scene.add( mcc );	

    // cylinder
    // parameters:  radiusAtTop, radiusAtBottom, height, radialSegments, heightSegments
    var cylinderGeometry = new THREE.CylinderGeometry( 0.30, 0.30, 0.80, 20, 4 );
    var cylinder = new THREE.Mesh( cylinderGeometry, diffuseMaterial);
    cylinder.position.set(2, -6, 0);
    scene.add( cylinder );

    // cone:   parameters --  radiusTop, radiusBot, height, radialSegments, heightSegments
    var coneGeometry = new THREE.CylinderGeometry( 0.0, 0.30, 0.80, 20, 4 );
    var cone = new THREE.Mesh( coneGeometry, diffuseMaterial);
    cone.position.set(4, -6, 0);
    scene.add( cone);

    // torus:   parameters -- radius, diameter, radialSegments, torusSegments
    var torusGeometry = new THREE.TorusGeometry( 1.2, 0.4, 10, 20 );
    var torus = new THREE.Mesh( torusGeometry, diffuseMaterial);

    torus.rotation.set(0,0,0);     // rotation about x,y,z axes
    torus.scale.set(1,2,3);
    torus.position.set(-6, -6, 0);   // translation

    scene.add( torus );

    /////////////////////////////////////
    //  CUSTOM OBJECT 
    ////////////////////////////////////
    
    var geom = new THREE.Geometry(); 
    var v0 = new THREE.Vector3(0,0,0);
    var v1 = new THREE.Vector3(3,0,0);
    var v2 = new THREE.Vector3(0,3,0);
    var v3 = new THREE.Vector3(3,3,0);
    
    geom.vertices.push(v0);
    geom.vertices.push(v1);
    geom.vertices.push(v2);
    geom.vertices.push(v3);
    
    geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
    geom.faces.push( new THREE.Face3( 1, 3, 2 ) );
    geom.computeFaceNormals();
    
    customObject = new THREE.Mesh( geom, diffuseMaterial );
    customObject.position.set(0, -6, -2);
    scene.add(customObject);
}

/////////////////////////////////////////////////////////////////////////////////////
//  initHand():  define all geometry associated with the hand
/////////////////////////////////////////////////////////////////////////////////////

function initHand() {
    var handMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff} );
    var boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );    // width, height, depth

    link1 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( link1 );
    linkFrame1   = new THREE.AxesHelper(1) ;   scene.add(linkFrame1);
    link2 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( link2 );
    linkFrame2   = new THREE.AxesHelper(1) ;   scene.add(linkFrame2);
    link3 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( link3 );
    linkFrame3   = new THREE.AxesHelper(1) ;   scene.add(linkFrame3);
    link4 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( link4 );
    linkFrame4   = new THREE.AxesHelper(1) ;   scene.add(linkFrame4);
    link5 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( link5 );
    linkFrame5   = new THREE.AxesHelper(1) ;   scene.add(linkFrame5);

    link1.matrixAutoUpdate = false;  
    link2.matrixAutoUpdate = false;  
    link3.matrixAutoUpdate = false;  
    link4.matrixAutoUpdate = false;  
    link5.matrixAutoUpdate = false;
    linkFrame1.matrixAutoUpdate = false;  
    linkFrame2.matrixAutoUpdate = false;  
    linkFrame3.matrixAutoUpdate = false;  
    linkFrame4.matrixAutoUpdate = false;  
    linkFrame5.matrixAutoUpdate = false;
}

/////////////////////////////////////////////////////////////////////////////////////
//  create customShader material
/////////////////////////////////////////////////////////////////////////////////////

var customShaderMaterial = new THREE.ShaderMaterial( {
//        uniforms: { textureSampler: {type: 't', value: floorTexture}},
	vertexShader: document.getElementById( 'customVertexShader' ).textContent,
	fragmentShader: document.getElementById( 'customFragmentShader' ).textContent
} );

// var ctx = renderer.context;
// ctx.getShaderInfoLog = function () { return '' };   // stops shader warnings, seen in some browsers

////////////////////////////////////////////////////////////////////////	
// initFileObjects():    read object data from OBJ files;  see onResourcesLoaded() for instances
////////////////////////////////////////////////////////////////////////	

var models;

function initFileObjects() {
        // list of OBJ files that we want to load, and their material
    models = {     
	teapot:    {obj:"obj/teapot.obj", mtl: customShaderMaterial, mesh: null	},
	armadillo: {obj:"obj/armadillo.obj", mtl: customShaderMaterial, mesh: null },
	dragon:    {obj:"obj/dragon.obj", mtl: customShaderMaterial, mesh: null }
    };

    var manager = new THREE.LoadingManager();
    manager.onLoad = function () {
	console.log("loaded all resources");
	RESOURCES_LOADED = true;
	onResourcesLoaded();
    }
    var onProgress = function ( xhr ) {
	if ( xhr.lengthComputable ) {
	    var percentComplete = xhr.loaded / xhr.total * 100;
	    console.log( Math.round(percentComplete, 2) + '% downloaded' );
	}
    };
    var onError = function ( xhr ) {
    };

    // Load models;  asynchronous in JS, so wrap code in a fn and pass it the index
    for( var _key in models ){
	console.log('Key:', _key);
	(function(key){
	    var objLoader = new THREE.OBJLoader( manager );
	    objLoader.load( models[key].obj, function ( object ) {
		object.traverse( function ( child ) {
		    if ( child instanceof THREE.Mesh ) {
			child.material = models[key].mtl;
			child.material.shading = THREE.SmoothShading;
		    }	} );
		models[key].mesh = object;
	    }, onProgress, onError );
	})(_key);
    }
}

/////////////////////////////////////////////////////////////////////////////////////
// onResourcesLoaded():  once all OBJ files are loaded, this gets called.
//                       Object instancing is done here
/////////////////////////////////////////////////////////////////////////////////////

function onResourcesLoaded(){
	
 // Clone models into meshes;   [Michiel:  AFAIK this makes a "shallow" copy of the model,
 //                             i.e., creates references to the geometry, and not full copies ]
    meshes["armadillo1"] = models.armadillo.mesh.clone();
    meshes["armadillo2"] = models.armadillo.mesh.clone();
    meshes["dragon1"] = models.dragon.mesh.clone();
    meshes["teapot1"] = models.teapot.mesh.clone();
    meshes["teapot2"] = models.teapot.mesh.clone();
    
    // position the object instances and parent them to the scene, i.e., WCS
    // For static objects in your scene, it is ok to use the default postion / rotation / scale
    // to build the object-to-world transformation matrix. This is what we do below.
    //
    // Three.js builds the transformation matrix according to:  M = T*R*S,
    // where T = translation, according to position.set()
    //       R = rotation, according to rotation.set(), and which implements the following "Euler angle" rotations:
    //            R = Rx * Ry * Rz
    //       S = scale, according to scale.set()
    
    meshes["armadillo1"].position.set(-6, -6, 2);
    meshes["armadillo1"].rotation.set(0,-Math.PI/2,0);
    meshes["armadillo1"].scale.set(1,1,1);
    scene.add(meshes["armadillo1"]);

    meshes["armadillo2"].position.set(-3, -6, 2);
    meshes["armadillo2"].rotation.set(0,-Math.PI/2,0);
    meshes["armadillo2"].scale.set(1,1,1);
    scene.add(meshes["armadillo2"]);

      // note:  the local transformations described by the following position, rotation, and scale
      // are overwritten by the animation loop for this particular object, which directly builds the
      // dragon1-to-world transformation matrix
    meshes["dragon1"].position.set(-5, 0.2, 4);
    meshes["dragon1"].rotation.set(0, Math.PI, 0);
    meshes["dragon1"].scale.set(0.3,0.3,0.3);
    scene.add(meshes["dragon1"]);

    meshes["teapot1"].position.set(3, -6, 3);
    meshes["teapot1"].scale.set(0.5, 0.5, 0.5);
    scene.add(meshes["teapot1"]);

    meshes["teapot2"].position.set(5, -6, 5);
    meshes["teapot2"].rotation.set(0, -Math.PI/2, 0);
    meshes["teapot2"].scale.set(0.5, 0.5, 0.5);
    scene.add(meshes["teapot2"]);

    meshesLoaded = true;
}


///////////////////////////////////////////////////////////////////////////////////////
// LISTEN TO KEYBOARD
///////////////////////////////////////////////////////////////////////////////////////

// movement
document.addEventListener("keydown", onDocumentKeyDown, false);

function onDocumentKeyDown(event) {
    var keyCode = event.which;
    // up
    if (keyCode == "W".charCodeAt()) {          // W = up
        light.position.y += 0.11;
        // down
    } else if (keyCode == "S".charCodeAt()) {   // S = down
        light.position.y -= 0.11;
        // left
    } else if (keyCode == "A".charCodeAt()) {   // A = left
	light.position.x -= 0.1;
        // right
    } else if (keyCode == "D".charCodeAt()) {   // D = right
        light.position.x += 0.11;
    } else if (keyCode == " ".charCodeAt()) {   // space
	animation = !animation;
    } else if (keyCode == "F".charCodeAt()) {
      catStretch = true;
      catJump = false;
    } else if (keyCode == "G".charCodeAt()) {
      catStretch = false;
      catJump = true;

    }
    else if (keyCode == "H".charCodeAt()) {
      audioLoader.load( 'sounds/meow.ogg', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop( false );
        sound.setVolume( 10 );
        sound.play();
      });
    }
    
};


///////////////////////////////////////////////////////////////////////////////////////
// UPDATE CALLBACK:    This is the main animation loop
///////////////////////////////////////////////////////////////////////////////////////

function update() {
//    console.log('update()');
    var dt=0.02;
    if (animation && meshesLoaded) {
	// advance the motion of all the animated objects
	  myboxMotion.timestep(dt);
   	handMotion.timestep(dt);

    if (catJump) {
      catMotion.timestep(dt);
    } 

    if (catStretch) {
      catStretchMotion.timestep(dt);
    }



    }
    if (meshesLoaded) {
	sphere.position.set(light.position.x, light.position.y, light.position.z);
	renderer.render(scene, camera);
    }
    requestAnimationFrame(update);      // requests the next update call;  this creates a loop
}

init();
update();

