function Particle(x, y, m) {
  this.position = new Vector(x, y);
  this.lastPosition = this.position.clone();
  this.acceleration = new Vector(0, 0);
  this.mass = m || 1.0;
  this.elasticity = 0.5;
  this.drag = 0.9999;
  this.bounds = undefined;
}

Particle.prototype.integrate = function(time, correction) {

  // Find velocity
  var velocity = this.position.clone()
    .sub(this.lastPosition)
    .scale(correction);

  // Set acceleration based on time squared
  this.acceleration.scale(time * time);

  // Record last location
  this.lastPosition = this.position;

  // Time-Corrected Verlet integration (TCV)
  this.position
    .add(velocity)
    .add(this.acceleration);

  // Reset acceleration after integration
  this.acceleration = new Vector(0, 0);
};

Particle.prototype.placeAt = function(x, y) {
  this.position.x = this.lastPosition.x = x;
  this.position.y = this.lastPosition.y = y;
  return this;
};

Particle.prototype.moveBy = function(dx, dy) {
  this.lastPosition = this.position.clone();
  this.position.add(dx, dy);
  return this;
};

Particle.prototype.setBounds = function(rect) {
  this.bounds = rect ? rect : undefined;
};

Particle.prototype.contain = function(time, correction) {
  if (this.x > this.bounds.right) this.x = this.bounds.right;
  else if (this.x < this.bounds.left) this.x = this.bounds.left;
  if (this.y > this.bounds.bottom) this.y = this.bounds.bottom;
  else if (this.y < this.bounds.top) this.y = this.bounds.top;
};

Particle.prototype.force = function(x, y, mass) {
  mass = mass || this.mass;
  this.acceleration.add({
    x: x / mass,
    y: y / mass
  });
};

Particle.prototype.gravitate = function(x, y, m) {
  var delta = this.position.clone().sub(new Vector(x, y));
  var r = delta.getLength();
  var f = (m * this.mass) / (r * r);
  var ratio = m / (m + this.mass);

  this.acceleration.add({
    x: f * (delta.x / r) * ratio,
    y: f * (delta.y / r) * ratio
  });
};


Particle.prototype.collide = function(segments) {
  return;

  var nearest, intersect;
  var i = segments.length;
  while (i--) {
    intersect = segments[i].intersection(this.x1, this.y1, this.x, this.y);
    if (intersect) {
      var dx = intersect.x - this.x1;
      var dy = intersect.y - this.y1;
      if (nearest) {
        var oldDistance = Math.sqrt(nearest.dx * nearest.dx + nearest.dy * nearest.dy);
        var newDistance = Math.sqrt(dx * dx + dy * dy);
        if (newDistance < oldDistance) {
          nearest = {
            dx: dx,
            dy: dy,
            x: intersect.x,
            y: intersect.y,
            segment: segments[i]
          };
        }
      }
      else {
        nearest = {
          dx: dx,
          dy: dy,
          x: intersect.x,
          y: intersect.y,
          segment: segments[i]
        };
      }
    }
  }
  if (nearest) {
    var projection = nearest.segment.project(this.x1, this.y1, this.x, this.y);
    var totalDx = this.x - this.x1;
    var totalDy = this.y - this.y1;
    var totalMotion = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
    var spentMotion = Math.sqrt(nearest.dx * nearest.dx + nearest.dy * nearest.dy);
    var remainingMotion = 1 - spentMotion / totalMotion;

    this.x = nearest.x;
    this.y = nearest.y;

    // TODO: no checks here make it possible to accidentally cross over another segment
    // this.x += projection.x * remainingMotion;
    // this.y += projection.y * remainingMotion;

    this.x1 = this.x - projection.x;
    this.y1 = this.y - projection.y;

    return nearest;
  }
};


if (typeof module !== 'undefined') module.exports = Particle;