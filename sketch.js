// Initialize variables
// For connecting
let mSerial;
let connectButton;
let readyToReceive;
// For sensor
let a0Value = 0;  // Value read from the photoreistor
let joyStickX = 0;  // X-axis value from the joystick
let joyStickY = 0;  // Y-axis value from the joystick
// Constants for joystick
const JOYSTICK_DEADZONE = 300;  // Deadzone range
const JOYSTICK_MID_X = 1960;  // Midpoint X
const JOYSTICK_MID_Y = 1948;  // Midpoint Y
// Variables for the cat display and other visual elements
let catB, catF, catM, catN, catSelect, mosLeft, mosRight, fyj, catNS, catMS, catBS, catFS, catSelectS, startBg, gameBg;  // png&gif
let catState = 'normal'; // States normal
let catMFrameCount = 0; // Frame counter for catM GIF
// Variables for sunBar
let sunBarLength = 300;  // Initial length of the sunBar
let sunBarDecreaseSpeed = 1;  // Speed of decrease
let sunBarIncreaseSpeed = 3 * sunBarDecreaseSpeed;  // Speed of increase
// Variables for healthBar
let healthBarLength = 300;  // Initial length of the healthBar
let healthBarDecreaseSpeed = 0.5;  // Speed of decrease in length
// Variables for controlling the ball
let ballX, ballY;  // Position of the ball
let ballSize = 20;
let ballSpeed = 7;  // Movement speed of the ball
// Game states
let gameStarted = false;  // If the game has started
let tryAgain = false;  // If the "Try Again" message should show
let startButton;  // Button to start the game
// The mosquitoes array
let mosquitoes = [];
let numMosquito;
// Other gaming UI
let changeButton; // Button to change the cat
let currentCat = 'catX'; // Variable to keep track of the current cat
let sleepingTime = 0; // Time in seconds

// Function to preload images (GIFs are load in setup using DOM)
function preload() {
  catB = loadImage('catB.png');
  catF = loadImage('catF.png');
  catBS = loadImage('catBS.png');
  catFS = loadImage('catFS.png');
  cuteFont = loadFont('cute.ttf');
  catSelect = loadImage('catSelect.png');
  catSelectS = loadImage('catSelectS.png');
  mosLeft = loadImage('mosLeft.png');
  mosRight = loadImage('mosRight.png');
  fyj = loadImage('fyj.png');
  startBg = loadImage('start.jpg');
  gameBg = loadImage('bg.jpg');
}

// Function to add mosquitos
function addMosquito() {
  let mosquito = {
    x: random(width), // Starting at a random position on x-axis from the top of the canvas
    y: 0,             
    speedX: random(-5, 5), // Random initial speed
    speedY: random(-5, 5),
    size: 10          // Size of the mosquito circle
  };
  mosquitoes.push(mosquito);
}

// Functions to update the action of the created mosquito (I want the mosquitos to move towards the cat but in a insect-like curvy way)
function updateMosquitoes() {
  for (let i = mosquitoes.length - 1; i >= 0; i--) {
    let m = mosquitoes[i];
    // Calculate angle towards the cat so that we can make it move in a constant speed
    let angle = atan2(600 - m.y, 800 - m.x);
    let constantSpeed = 2;
    m.x += constantSpeed * cos(angle);
    m.y += constantSpeed * sin(angle);
    // Adding a random speed component
    m.x += m.speedX;
    m.y += m.speedY;
    // Ensure mosquitoes stay within the canvas
    m.x = constrain(m.x, 0, width);
    m.y = constrain(m.y, 0, height);
    // Check collision with the cat
    if (dist(m.x, m.y, 800, 600) < 140) {
      mosquitoes.splice(i, 1); // Remove mosquito after collision
      healthBarLength -= 50;    // Decrease health bar
      // Change cat state to beingBit
      catState = 'beingBit';
      // Set a timer to change the state back to normal after 3.04 seconds
      setTimeout(() => {
        catState = 'normal';
      }, 3040);
    }
    // Check collision with the joystick-controlled ball
    if (dist(m.x, m.y, ballX, ballY) < 50) {
      mosquitoes.splice(i, 1); // Remove mosquito after collision
    }
  }
  // Change mosquitoes' random speed component every 1/3 second (20 frames)
  if (frameCount % 20 == 0) {
    mosquitoes.forEach(m => {
      m.speedX = random(-5, 5);
      m.speedY = random(-5, 5);
    });
  }
  // Maintain the number of mosquitoes on the canvas
  while (mosquitoes.length < numMosquito) {
      addMosquito();
  }
}
// Function to draw mosquitoes
function drawMosquitoes() {
  mosquitoes.forEach(m => {
    // Choose the left or right image based on the mosquito's x position
    let mosquitoImage = m.x < width / 2 ? mosLeft : mosRight;
    image(mosquitoImage, m.x, m.y, 150, 150);
  });
}
// Function to update the number of mosquitoes based on sleeping time: less than 20 seconds, 1; 20-35 seconds, 2; more than 35, 3
function updateMosquitoCount() {
  if (sleepingTime < 20) {
    numMosquito = 1;
  } else if (sleepingTime >= 20 && sleepingTime < 35) {
    numMosquito = 2;
  } else if (sleepingTime >= 35) {
    numMosquito = 3;
  }
}
// Function to display the cat-related gif and png
function drawCat() {
  imageMode(CENTER);
  // Hide all GIF images at first
  catM.hide();
  catN.hide();
  catMS.hide();
  catNS.hide();

  let catToUse = currentCat === 'catX' ? { N: catN, M: catM, B: catB, F: catF } : { N: catNS, M: catMS, B: catBS, F: catFS };// the change cat function
  //logic of cat states
  switch (catState) {
    case 'normal':
      if (sunBarLength === 300) {
        image(catToUse.B, 800, 600, 391, 391); // Burn
      } else if (sunBarLength === 0) {
        image(catToUse.F, 800, 600, 391, 391); // Frozen
      } else {
        catToUse.N.show();
        catToUse.N.position(800 - 391 / 2, 600 - 391 / 2); // Normal
      }
      break;
    case 'beingBit':
      catToUse.M.show();
      catToUse.M.position(800 - 391 / 2, 600 - 391 / 2); // Mosquito-bited
      if (catMFrameCount < 180) {
        catMFrameCount++;
      } else {
        catState = 'normal';
        catMFrameCount = 0;
      }
      break;
  }
}
//logic for switching cats
function changeCat() {
  currentCat = currentCat === 'catX' ? 'catS' : 'catX';
}
// Function for serial data
function receiveSerial() {
  let line = mSerial.readUntil("\n");
  trim(line); 
  if (!line) return;

  if (line.charAt(0) != "{") {
    print("error: ", line);
    readyToReceive = true; 
    return;
  }

  let data = JSON.parse(line).data;
  a0Value = data.a0Val;  // Update photoreistor value
  joyStickX = data.joyStickX;  // Update joystick X value
  joyStickY = data.joyStickY;  // Update joystick Y value
  readyToReceive = true; 
}

function connectToSerial() {
  if (!mSerial.opened()) {
    mSerial.open(9600); 
    readyToReceive = true; 
    connectButton.hide(); 
  }
}
//Button style (home page UI)
function styleButton(button) {
  // Apply style sheet
  button.style('font-family', 'Cute');
  button.style('background-color', '#FFF4E8'); // Background color
  button.style('color', '#E3B899'); // Text color
  button.style('border', '2px solid #FFF4E8'); // Border color
  button.style('border-radius', '10px'); // Rounded corners
  button.style('padding', '15px 30px'); // Padding
  button.style('font-size', '20px'); // Font size
  button.style('cursor', 'pointer'); // Cursor pointer

  // mouse-hover intercation
  button.mouseOver(() => {
    button.style('background-color', '#E3B899'); // Hover background color
    button.style('color', '#FFF4E8'); // Hover text color
  });

  button.mouseOut(() => {
    button.style('background-color', '#FFF4E8'); // Revert to original background color
    button.style('color', '#E3B899'); // Revert to original text color
  });
}
// the "ball" is now an anti-mosquito poison
function drawBall() {
  image(fyj, ballX, ballY, 100, 100);
}

function setup() {
  createCanvas(1600, 900);  // Set canvas size
  imageMode(CENTER);
  readyToReceive = false;  // Set initial state to not ready to receive data

  // Initialize ball position in center of canvas
  ballX = width / 2;
  ballY = height / 2;

// Initialize GIFs in setup
catM = createImg('catM.gif');
catN = createImg('catN.gif');

catMS = createImg('catMS.gif');
catNS = createImg('catNS.gif');

catM.hide();  // Initially hide GIFs
catN.hide();
catMS.hide();
catNS.hide();

  // Setup serial communication
  mSerial = createSerial();

  // Create and position the 'Connect To Serial' button
  connectButton = createButton("Connect To Serial");
  connectButton.position(1240, 17); // Adjust position for connectButton
  connectButton.mousePressed(connectToSerial);

  // Create and position the buttons
  startButton = createButton('Start');
  startButton.position(1008, 248);
  startButton.mousePressed(startGame);

  changeButton = createButton('Change Cat');
  changeButton.position(1008, 179);
  changeButton.mousePressed(changeCat);
  //Call fonts and button style
  textFont(cuteFont);
  styleButton(connectButton);
  styleButton(startButton);
  styleButton(changeButton);

  for (let i = 0; i < numMosquito; i++) {
    addMosquito();

 // Initialize sleeping time
  sleepingTime = 0;
}
}

function draw() {
  clear();
  if (!gameStarted) {
      imageMode(CORNER);
      background(startBg);
      imageMode(CENTER);

      // Display the catSelect PNG
      let selectImage = currentCat === 'catX' ? catSelect : catSelectS;
      image(selectImage, 803, 165, 216, 216);

      // Display text on the restart screen
      noStroke();
      fill('#46675E');
      textSize(40);
      textAlign(CENTER, CENTER);
      if (tryAgain) {
          // Show sleeping time
          text(`Sleeping Time: ${floor(sleepingTime)} S`, 1300, 35);
      }
  } else {
      imageMode(CORNER);
      background(gameBg);
      imageMode(CENTER);


      // Serial communication and other game logic
      if (mSerial.opened() && readyToReceive) {
          readyToReceive = false;
          mSerial.clear();
          mSerial.write(0xab);
      }

      if (mSerial.availableBytes() > 0) {
          receiveSerial();
      }
      //Call all functions
      updateMosquitoCount();
      while (mosquitoes.length < numMosquito) {
        addMosquito();}
      updateMosquitoes();
      drawMosquitoes();
      drawCat();
      updateBallPosition();
      drawBall();

      // Update and display sleeping time during the game
      noStroke();
      fill('#46675E');
      textSize(35);
      textAlign(CENTER, TOP);
      sleepingTime += deltaTime / 1000; // deltaTime (milliseconds)
      text(`Sleeping Time: ${floor(sleepingTime)} S`, 750, 35);

  //Game UI
  // sunBar (not samba)
  if (sunBarLength < 300 && a0Value > 200) {
    sunBarLength += sunBarIncreaseSpeed;  // Increase length if "sun shines" and the bar is not full
  } else {
    sunBarLength -= sunBarDecreaseSpeed;  // Otherwise decrease length
  }
  sunBarLength = constrain(sunBarLength, 0, 300);  // Ensure length stays within max value
  // Drawing sunBar
  fill(sunBarLength >= 300 ? color(165, 42, 42) : color(0, 255, 0));  // Color based on length
  noStroke();
  rect(50, height - 80, sunBarLength, 20);
  // Border for sunBar
  stroke(0);
  noFill(); 
  rect(50, height - 80, 300, 20); 

  // healthBar
  if (sunBarLength == 0 || sunBarLength == 300) {
    healthBarLength -= healthBarDecreaseSpeed;  // Decrease length if sunBar is empty or full
  }
  healthBarLength = constrain(healthBarLength, 0, 300);
  // Draw healthBar
  fill(255, 0, 0);
  noStroke();
  rect(50, height - 110, healthBarLength, 20);
  // Draw border for healthBar
  stroke(0);
  noFill();
  rect(50, height - 110, 300, 20);
  // If health bar empty game over, reset game
  if (healthBarLength <= 0) {
    resetGame();
  }
  
  // Function to update the ball's position
function updateBallPosition() {
  let dx = joyStickX - JOYSTICK_MID_X;  // X-axis offset
  let dy = joyStickY - JOYSTICK_MID_Y;  // Y-axis offset
  // Calculate the distance from the midpoint
  let distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > JOYSTICK_DEADZONE) {
    // Calculate the angle
    let angle = Math.atan2(dy, dx);
    // Update the ball's position from angle and speed
    ballX += ballSpeed * Math.cos(angle);
    ballY += ballSpeed * Math.sin(angle);
    // Ensure the ball stays within the canvas
    ballX = constrain(ballX, ballSize / 2, width - ballSize / 2);
    ballY = constrain(ballY, ballSize / 2, height - ballSize / 2);
  }
}}}
  // Draw the ball
  //fill(0, 0, 255);
  //noStroke();
  //ellipse(ballX, ballY, ballSize, ballSize);

// Start game status
function startGame() {
  gameStarted = true;  // Set game state to started
  tryAgain = false;  // Reset try again(now final score) message
  sunBarLength = 300;  // Reset sunBar length
  healthBarLength = 300;  // Reset healthBar length
  startButton.hide();  // Hide the buttons
  changeButton.hide();

  // Reset sleeping time and mosquito array
  sleepingTime = 0;
  mosquitoes = [];
  updateMosquitoCount();
}
// Reset of the game status
function resetGame() {
  gameStarted = false;  // Set game to not started
  tryAgain = true;  // Enable the try again
  sunBarLength = 300;  // Reset sunBar length
  healthBarLength = 300;  // Reset healthBar length
  startButton.show();  // Show the button for a new game
  changeButton.show();

  // Hide cat GIFs
  catM.hide();
  catN.hide();
  catMS.hide();
  catNS.hide();
}