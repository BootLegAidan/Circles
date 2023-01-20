let w = 2500;               // Width of the canvas
let h = 2500;               // Height of the canvas
let overlapChecks = 25;     // How many times to repeat phase 1
let sizeChecks = 5;        // How many times to repeat phase 2
let mainLoop = 3            // How many times the engine runs through the phases every tick
let showConnections = false // Enable drawing lines between circles that are touching
let showCircles = true      // Enable drawing the circles
let color = false            // Add color to the circles
let fillCircle = false      // Whether the circle is filled in (fillCircle = true) or if its just an outline (fillCircle = false)
let maxSizes = false
/*  ^ If true, the circle will stop growing if it is touching another circle or if its radius is equal to a predefined number
If false, the circles will continue growing until they touch another circle. */
;[w,h] = [window.innerWidth*2,window.innerHeight*2]

let c = document.getElementById('canvas')
let ctx = c.getContext('2d')
let debugText = document.getElementById('debug')
;[c.width, c.height] = [w, h]
let circles = []
let phase = 0;          // What the script is currently doing
let currentCircle = {}; // The circle that is curently being generated

function tick () {
  let tickStart = performance.now()
  ctx.clearRect(0,0,w,h)
  if (showCircles) {
    for (let i of circles) { // Loop through all the circles and draw them
      ctx.beginPath()
      ctx.arc(i.x,i.y,i.radius,0,Math.PI*2)
      if (color) {
        ctx.fillStyle = `hsl(${i.id},70%,70%)` // Generate a color based on the circles ID
      } else {
        ctx.fillStyle = 'black'
      }
      ctx.fill()
      if (!fillCircle) {
        ctx.beginPath()
        ctx.arc(i.x,i.y,Math.max(i.radius-5,0),0,Math.PI*2)
        ctx.fillStyle = 'white'
        ctx.fill()
      }
    }
  }
  if (showConnections) {
    for (let i of circles) {          // Loop through all the circles
      for (let j of i.connections) {  // Loops through all of the circles connections and draw them
        ctx.beginPath()
        ctx.moveTo(i.x,i.y)
        ctx.lineTo(j.x,j.y)
        if (color) {
          ctx.strokeStyle = `hsl(${i.id},70%,70%)` // Generate a color based on the circles ID
        } else {
          ctx.strokeStyle = 'black'
        }
        ctx.stroke()
      }
    }
  }
  let drawTime = performance.now() - tickStart
  for (let tickLoop = 0; tickLoop < mainLoop; tickLoop++) { // A higher number makes generation faster, but can heavily impact performance
    for (let loops = 0; loops < overlapChecks; loops++) {   // Check for a spot multiple times. Higher numbers speed up generation, but may impact performance
    if (phase == 0) {                                       // Create a new circle
      currentCircle = {                                     // Create a new circle at a random point
          x: Math.randBetween(0,w,true),
          y: Math.randBetween(0,h,true),
          radius: 1,
          finalRadius: Math.randBetween(0,(h+w)/4,true),
          connections: [],
          id: circles.length
        }
        if (checkDistance(currentCircle.x,currentCircle.y,currentCircle.radius)) { // Check if the current circle isn't overlapping another circle. if it is, we have to create a different spot
          phase = 1
          console.log(currentCircle);
        }
      }
    }
    for (let loops = 0; loops < sizeChecks; loops ++) {                                 // Check for the size multiple times. Higher numbers speed up generation, but may impact performance
      if (phase == 1) {                                                                 // Adjust the size of the current circle
        if (!checkDistance(currentCircle.x,currentCircle.y,currentCircle.radius)) {     // Check if the current circle isn't overlapping another circle
          phase = 2                                                                     // If the circle is touching a finalized circle, move to the next phase
        } else if ((currentCircle.radius <= currentCircle.finalRadius) || (!maxSizes && circles.length)) {  // If the current circles radius is under its target radius, it needs to grow. If maxSizes is false, it will grow regardless of its size
          currentCircle.radius++
        } else {
          phase = 2 // If the current circle is at it's target radius, move to the next phase
        }
      }
    }
    if (phase == 2) {             // Finalize the circle
      circles.push(currentCircle) // Add the current circle to the list of finished circles
      currentCircle = {}          // Delete the current circle
      phase = 0                   // Reset to phase 0
    }
  }

  // Draw the current circle
  ctx.beginPath()
  ctx.arc(currentCircle.x,currentCircle.y,currentCircle.radius,0,Math.PI*2)
  ctx.fillStyle = `hsl(${currentCircle.radius / 5},70%,70%)` // Make it visually distinct
  ctx.fill()

  debugText.innerHTML = `
    Update time: ${Math.floor((performance.now() - tickStart)*10)/10}ms<br>
    Draw time: ${Math.floor(drawTime*10)/10}ms<br>
    Circle count: ${circles.length}
  `
  requestAnimationFrame(tick)
}
function checkDistance(x,y,r) {
  for (let i of circles) {                        // Loop through all the already made circles
    if (Math.dist(i.x,i.y,x,y) < i.radius + r) {  // Check if the current circle is touching a already made circle
      if (showConnections && phase == 1) {        // Check if connections are enabled and if the circle has found a valid spot
        i.connections.push({x: x, y: y})                   // Add the connections to an array so that they can be drawn
      }
      return false
    }
  }
  return true
}
requestAnimationFrame(tick)
