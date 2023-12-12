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
// Variables for the cat display
let catB, catF, catM, catN;  // Cat png&gif
let catState = 'normal'; // States normal
let catMFrameCount = 0; // Frame counter for catM GIF
// Variables for sunBar
let sunBarLength = 300;  // Initial length of the sunBar
let sunBarDecreaseSpeed = 1;  // Speed of decrease
let sunBarIncreaseSpeed = 3 * sunBarDecreaseSpeed;  // Speed of increase
// Variables for healthBar
let healthBarLength = 300;  // Initial length of the healthBar
let healthBarDecreaseSpeed = 0.5;  // Speed of decrease in length caused by sunBar
// Variables for controlling the ball
let ballX, ballY;  // Position of the ball
let ballSize = 20;
let ballSpeed = 5;  // Movement speed of the ball
// Game states
let gameStarted = false;  // If the game has started
let tryAgain = false;  // If the "Try Again" message should show
let startButton;  // Button to start the game
// The mosquitoes array
let mosquitoes = [];
let numMosquito = 1; //set number to 1 for now


// Function to preload images (GIFs are load in setup using DOM)
function preload() {
  catB = loadImage('catB.png');
  catF = loadImage('catF.png');
}

// Function to add mosquito (currently a red ball)
function addMosquito() {
  let mosquito = {
    x: random(width), // Starting at a random position on x-axis from the top of the canvas
    y: 0,             
    speedX: random(-5, 5), // Random initial speed
    speedY: random(-5, 5),
    size: 10          // Size of the mosquito circle
    // this will be replaced by a png or even a GIF next week, it will change direction according to on the let or right side of the screen so the mosquito is facing the cat
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
// Function to draw mosquitoes (this part will be edited to be png or gif)
function drawMosquitoes() {
    fill(255, 0, 0);
    mosquitoes.forEach(m => {
        ellipse(m.x, m.y, m.size, m.size);
    });
}
// Function to display the cat-related gif and png
function drawCat() {
  imageMode(CENTER);
  // Hide GIF images at first
  catM.hide();
  catN.hide();
  // Set cases for switching displays (states) of the cat
  switch (catState) {
    case 'normal':
      // The logic is this, all states beside the beingBit is normal case
      if (sunBarLength === 300) {//sun bar full
        image(catB, 800, 600, 391, 391); // Burn
      } else if (sunBarLength === 0) {//sun bar empty
        image(catF, 800, 600, 391, 391); // Frozen
      } else {
        catN.show(); // Normal state
        catN.position(800 - 391 / 2, 600 - 391 / 2);
      }
      break;

    case 'beingBit':
      catM.show();//show the beingBit GIF
      catM.position(800 - 391 / 2, 600 - 391 / 2);
      if (catMFrameCount < 180) {
        catMFrameCount++;
      } else {
        catState = 'normal'; // Change back to normal state
        catMFrameCount = 0; // Reset frame counter
      }
      break;
  }
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

function setup() {
  createCanvas(1600, 900);  // Set canvas size

  readyToReceive = false;  // Set initial state to not ready to receive data

  // Initialize ball position in center of canvas
  ballX = width / 2;
  ballY = height / 2;

// Initialize GIFs in setup
catM = createImg('catM.gif');
catN = createImg('catN.gif');

catM.hide();  // Initially hide GIFs
catN.hide();


  // Setup serial communication
  mSerial = createSerial();

  // Create and position the 'Connect To Serial' button
  connectButton = createButton("Connect To Serial");
  connectButton.position(10, 10);
  connectButton.mousePressed(connectToSerial);

  // Create and position the 'Start' button
  startButton = createButton('Start');
  startButton.position(width / 2 - 30, height / 2 - 15);
  startButton.mousePressed(startGame); 

  for (let i = 0; i < numMosquito; i++) {
    addMosquito();
}
}

function draw() {
  if (!gameStarted) {
    background(0);  // Set background to black when game is not started (will be updated next week with a gif or jpg)

    // Show "Try Again" message if the user lost the game
    if (tryAgain) {
      fill(255);
      textSize(32);
      textAlign(CENTER, CENTER);
      text("Try Again", width / 2, height / 2);
    }
    return;  // If user lost, skip the rest of the draw function and restart the game
  }

  // Set background to white when game is started (will be updated next week with a png or gif)
  background(255);

  // Serial communication
  if (mSerial.opened() && readyToReceive) {
    readyToReceive = false;
    mSerial.clear();
    mSerial.write(0xab);
  }

  // Read serial data
  if (mSerial.availableBytes() > 0) {
    receiveSerial();
  }

  // Display sensor data on the screen (will be removed in the final version)
  fill(0);
  textSize(16);
  text(`Photoreistor Value: ${a0Value}\nJoystick X: ${joyStickX}, Y: ${joyStickY}`, 10, 20);  // Display all sensor values from Arduuino
//starts to call all the functions that we created
  if (gameStarted) {
    updateBallPosition();
  }
  updateMosquitoes();
  drawMosquitoes();
  drawCat();
  //Game UI
  // sunBar (not samba)
  if (sunBarLength < 300 && a0Value > 200) {
    sunBarLength += sunBarIncreaseSpeed;  // Increase length if "sun shines" and the bar is not full
  } else {
    sunBarLength -= sunBarDecreaseSpeed;  // Otherwise decrease length
  }
  sunBarLength = constrain(sunBarLength, 0, 300);  // Ensure length stays within max value
  // Drawing sunBar
  fill(sunBarLength >= 300 ? color(165, 42, 42) : color(0, 255, 0));  // Color is based on length
  noStroke();
  rect(50, height - 80, sunBarLength, 20);
  // Draw border for sunBar
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
    // Update the ball's position based on the angle and speed
    ballX += ballSpeed * Math.cos(angle);
    ballY += ballSpeed * Math.sin(angle);
    // Ensure the ball stays within the canvas
    ballX = constrain(ballX, ballSize / 2, width - ballSize / 2);
    ballY = constrain(ballY, ballSize / 2, height - ballSize / 2);
  }
}
  // Draw the ball (Will be updated next week as a png or gif, if have time, change to different state after hitting mosquito)
  fill(0, 0, 255);
  noStroke();
  ellipse(ballX, ballY, ballSize, ballSize);
}
// Start game status
function startGame() {
  gameStarted = true;  // Set game state to started
  tryAgain = false;  // Reset try again message
  sunBarLength = 300;  // Reset sunBar length
  healthBarLength = 300;  // Reset healthBar length
  startButton.hide();  // Hide the start button
}
// Reset of the game statuus
function resetGame() {
  gameStarted = false;  // Set game to not started
  tryAgain = true;  // Enable the try again
  sunBarLength = 300;  // Reset sunBar length
  healthBarLength = 300;  // Reset healthBar length
  startButton.show();  // Show the start button for a round of new game
  catM.hide();  // Initially hide GIFs
  catN.hide();
}