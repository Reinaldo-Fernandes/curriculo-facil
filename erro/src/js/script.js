const cube = document.getElementById('cube');
let rotationX = 0;
let rotationY = 0;

function rotateCube() {
  rotationY += 1;
  rotationX += 0.5;
  cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
  requestAnimationFrame(rotateCube);
}

rotateCube();
