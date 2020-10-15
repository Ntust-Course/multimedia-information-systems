const canvas = document.getElementById("part1");
const ctx = canvas.getContext("2d");

// mouse control
var closestPoint;
let dragOffsetX;
let dragOffsetY;
let cursor;
const minDist = 20;

const mouse = {
  x: -(minDist + 1),
  y: -(minDist + 1),
  button: false,
  drag: false,
  dragStart: false,
  dragEnd: false,
  dragStartX: 0,
  dragStartY: 0,
};

let mouseEvents = (e) => {
  let bounds = canvas.getBoundingClientRect();
  mouse.x = e.pageX - bounds.left - window.scrollX;
  mouse.y = e.pageY - bounds.top - window.scrollY;
  const lb = mouse.button;
  mouse.button =
    e.type === "mousedown" ? true : e.type === "mouseup" ? false : mouse.button;
  if (lb !== mouse.button) {
    if (mouse.button) {
      mouse.drag = true;
      mouse.dragStart = true;
      mouse.dragStartX = mouse.x;
      mouse.dragStartY = mouse.y;
    } else {
      mouse.drag = false;
      mouse.dragEnd = true;
    }
  }
};

["down", "up", "move"].forEach((name) =>
  canvas.addEventListener("mouse" + name, mouseEvents)
);

let getClosestPoint = (from, minDist) => {
  var closestPoint;
  points.forEach((point) => {
    const dist = Math.hypot(from.x - point.x, from.y - point.y);
    if (dist < minDist) {
      closestPoint = point;
      minDist = dist;
    }
  });
  return closestPoint;
};

// main update function
let update = () => {
  cursor = "auto";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (mouse.drag === false) {
    closestPoint = getClosestPoint(mouse, minDist);
    if (closestPoint) {
      cursor = "move";
    }
  }
  if (mouse.dragStart) {
    if (closestPoint) {
      dragOffsetX = closestPoint.x - mouse.x;
      dragOffsetY = closestPoint.y - mouse.y;
    }
    mouse.dragStart = false;
  } else if (mouse.drag && closestPoint) {
    cursor = "none";
    closestPoint.x = mouse.x + dragOffsetX;
    closestPoint.y = mouse.y + dragOffsetY;
  }

  // draw all points
  ctx.beginPath();
  draw(points);

  canvas.style.cursor = cursor;
  requestAnimationFrame(update);
};
requestAnimationFrame(update);

const bezier = (t, p0, p1, p2, p3) => {
  const cX = 3 * (p1.x - p0.x),
    bX = 3 * (p2.x - p1.x) - cX,
    aX = p3.x - p0.x - cX - bX;

  const cY = 3 * (p1.y - p0.y),
    bY = 3 * (p2.y - p1.y) - cY,
    aY = p3.y - p0.y - cY - bY;

  const x = aX * t ** 3 + bX * t ** 2 + cX * t + p0.x;
  const y = aY * t ** 3 + bY * t ** 2 + cY * t + p0.y;

  return { x, y };
};

const draw = (pts) => {
  let accuracy = 0.001; //this'll give the bezier 100 segments

  // draw points
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#000000";
  pts.map((p) => ctx.rect(p.x - 5, p.y - 5, 10, 10));
  ctx.fill();
  ctx.stroke();

  // draw curve
  ctx.fillStyle = "#000000";
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 0; i < 1; i += accuracy) {
    let p = bezier(i, ...pts);
    ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
};

// default points
const points = [
  { x: 10, y: 10 },
  { x: 50, y: 150 },
  { x: 150, y: 100 },
  { x: 200, y: 200 },
];
