// Initialize variables
let mSerial;
let connectButton;
let readyToReceive;
let a0Value = 0;  // Value read from the photoreistor
let joyStickX = 0;  // X-axis value from the joystick
let joyStickY = 0;  // Y-axis value from the joystick

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
}

function draw() {
  if (!gameStarted) {
    background(0);  // Set background to black when game is not started

    // Show "Try Again" message if the user lost the game
    if (tryAgain) {
      fill(255);
      textSize(32);
      textAlign(CENTER, CENTER);
      text("Try Again", width / 2, height / 2);
    }
    return;  // If lost, skip the rest of the draw function and restart the game
  }

  // Set background to white when game is started
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

  // Display sensor data on the screen
  fill(0);
  textSize(16);
  text(`Photoreistor Value: ${a0Value}\nJoystick X: ${joyStickX}, Y: ${joyStickY}`, 10, 20);  // Display all sensor values from Arduuino

  // sunBar (not samba)
  if (sunBarLength < 300 && a0Value > 200) {
    sunBarLength += sunBarIncreaseSpeed;  // Increase length if "sun shines" and the bar is not full
  } else {
    sunBarLength -= sunBarDecreaseSpeed;  // Otherwise decrease length
  }
  sunBarLength = constrain(sunBarLength, 0, 300);  // Ensure length stays within max value

  // Draw sunBar
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

  // Ball movement
  if (joyStickX < 1000) {
    ballX -= ballSpeed;  // Move ball left
  } else if (joyStickX > 2000) {
    ballX += ballSpeed;  // Move ball right
  }

  if (joyStickY < 1000) {
    ballY -= ballSpeed;  // Move ball up
  } else if (joyStickY > 2000) {
    ballY += ballSpeed;  // Move ball down
  }

  // Make sure ball stays within the canvas
  ballX = constrain(ballX, ballSize / 2, width - ballSize / 2);
  ballY = constrain(ballY, ballSize / 2, height - ballSize / 2);

  // Draw the ball
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
}