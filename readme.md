# Newton

An easy-to-use, feature-rich physics engine that's designed from the ground up for JavaScript.

```js
var renderer = new Newton.Renderer(document.getElementById('viewport'));
var sim = new Newton.Simulator(simulate, renderer, 60);
var particles = new Newton.Body();

var particleLayer = sim.createLayer();

particleLayer
  .addBody(particles)
  .addForce(new Newton.LinearGravity(Math.PI * 0.5, 0.01, 0))
  .wrapIn(new Newton.Rectangle(0, 0, 640, 480));

sim.start();

function simulate(time) {
  while (time--) {
    particles.addParticle(new Newton.Particle(Math.random() * 640, 0, Math.random() * 5 + 1));
  }
}
```

See this [simple demo](http://www.google.com) in action or check out [more examples](http://www.google.com).

## Installation

```
$ bower install newton
```

## Philosophy

I started Newton after struggling to find an engine
with a normal, simple JavaScript API that was also
powerful enough to complete a non-trivial HTML5 game with physics.

Until Newton, the best physics libraries available for JavaScript were
[Box2d](https://github.com/kripken/box2d.js/) and
[Chipmunk](https://github.com/josephg/Chipmunk-js) -
both of which are JS ports of very capable and popular C++ projects.
Unfortunately, these ports combine the clarity and conciseness of C++ with the speed of JavaScript.
[CoffeePhysics](https://github.com/soulwire/Coffee-Physics),
[Verlet-JS](https://github.com/subprotocol/verlet-js), and
[PhysicsJS](https://github.com/wellcaffeinated/PhysicsJS)
haven't supplanted these C-based libraries for various reasons.

A game-ready HTML5 physics engine should be:

- Written in and optimized for idiomatic JavaScript
- Easily orchestrated through a simple API
- Featureful for non-trivial games and simulations
- Designed with garbage collection in mind
- Decoupled from rendering
- Consistent across browsers and hardware
- Fluid and without stutter
- Stable, fast, and predictable

Read all the [nerdy details](http://www.google.com) about how Newton accomplishes these goals.

## Quick Start

### The loop

At its core, Newton is a loop that periodically calls two callbacks: `simulate` and `render`.
`simulate` is called in regular time steps and should be used to add simulation logic, like
behaviors responding to user input. `render` is called as quickly as possible based on
RequestAnimationFrame and should be used to draw the scene in its current state.

#### Newton.Simulator

```js
var sim = new Newton.Simulator(simulateFn, renderFn, simulationFps);
sim.start();
sim.stop();

function simulateFn(time, simulator) {}
function renderFn(time, simulator) {}
```

- simulateFn: callback for simulation logic; optional
- renderFn: callback for drawing the scene; optional
- simulationFps: number of frames per second for the fixed time step; optional, defaults to 60

#### Newton.Renderer

You can render the scene however you like by providing a render function
that takes the arguments *(frameTimeInMs, simulator)*. However, it's often convenient to
have a default renderer for quick development. Newton provides one based on Canvas:

```js
var renderer = new Newton.Renderer(document.getElementById('viewport'));
var sim = new Newton.Simulator(null, renderer);
```

### Layers and bodies

A physics engine needs some sort of organization that allows you to group physical
entities into logical objects. Newton uses Layers and Bodies.

#### Newton.Layer

Layers control which Bodies collide with each other. Layers also provide a mechanism
for applying shared forces like gravity, wind, and explosions.

Created via `Simulator.createLayer`.

```js
var envLayer = sim.createLayer();
var fixedLayer = sim.createLayer();
var playerLayer = sim.createLayer();

envLayer                // shared forces like gravity
  .addForce(gravity);

fixedLayer              // responds to no forces, no collisions
  .respondTo([])
  .addBody(terrain);

playerLayer             // responds to forces and collisions on all layers
  .addBody(player)
  .respondTo([playerLayer, fixedLayer, envLayer]);

```

By default, Layers respond to themselves, eg: `layer.respondTo([layer])`.

#### Newton.Body

Bodies group related Particles, Edges, and Constraints together into logical entities.
The player's character in a game, a vehicle, and a bridge could all be represented as
instances of Body.

```js
var body = new Newton.Body();

body
  .addParticle(particle)
  .addEdge(edge);
```

##### Newton.Particle

##### Newton.Edge

##### Newton.DistanceConstraint

##### Newton.AngleConstraint

#### Newton.Material

Materials determine how colliding objects react.

```js
var material = new Newton.Material({
  weight: 2,
  restitution: 0.5,
  friction: 0.2,
  maxVelocity: 50
});

var body = new Newton.Body(material);   // default for contained Particles and Edges
var particle = new Newton.Particle(0, 0, 1, material);  // overrides Body value
```

- weight: multiplier for a Particle's mass (0 .. N); optional, default = 1
- restitution: bounciness of a Particle (0 .. 1); optional, default = 1
- friction: roughness of an Edge; optional (0 .. 1), default = 0
- maxVelocity: determines drag and terminal velocity (0 .. 1000); optional, default = 100

### Forces

Forces and impulses (force * time) can be applied via methods, but can also be represented
as objects in the scene. For example, instead of manually applying gravity as a force
each frame, it's convenient to attach a LinearGravity instance to a Layer in the Simulation.

#### Impulses

Impulses allow programmatic, time-based changes to the velocities of Bodies and Particles.
They're the 'verb' form of forces.

```js
particle.applyImpulse(0.025, 0, 100);       // force, direction, time
body.applyImpulse(0.1, Math.PI * 0.5, 16);  // applies to all Particles in this Body
```

#### LinearGravity

Adding a LinearGravity instance to a Layer (A) creates a force that's exerted on all
Particles in Layers that respond to (A). Useful for gravity, wind.

```js
var gravity = new LinearGravity(force, direction);

layer.addForce(gravity);
```

- force: strength of the gravity
- direction: angle in radians

#### RadialGravity

### Math primitives

#### Newton.Vector

#### Newton.Rectangle

## Examples

## The nerdy details

Physics major?
Browser performance wizard?
Like to argue about Euler vs. Verlet vs. RK4?
This is for you.

### Verlet integration

Under the hood, Newton.js uses the simple and stable
[verlet method](http://www.gamedev.net/page/resources/_/technical/math-and-physics/a-verlet-based-approach-for-2d-game-physics-r2714)
to integrate Newton's equations of motion.

### Decoupled simulation

JavaScript physics engines must deal with a wide variety of unstable framerates,
simulation complexities,
browsers, and hardware. To deliver consistent simulations in different scenarios, Newton uses a
[render-independent fixed-time simulation step](http://gafferongames.com/game-physics/fix-your-timestep/).

The render step runs as quickly as possible via RequestAnimationFrame while the simulation runs at a separate,
fixed interval via a time accumulator. This keeps Newton smooth, fast, and stutter-free.

### Arbitrary renderer

Newton comes with a simple built-in canvas renderer for development and experimentation but allows
you to render any way you like - including Canvas, WebGL, SVG, and CSS. Newton can even run simulations
in node.js!

### Garbage collector-friendly

Newton's 2D Vector class uses mutable operations by default to avoid flooding the garbage
collector with extraneous objects. Garbage-collector abuse is an issue with most JS physics engines,
including
[Chipmunk](https://groups.google.com/forum/#!topic/v8-users/e9HNSVoovEU) and
[Box2d](https://www.scirra.com/blog/76/how-to-write-low-garbage-real-time-javascript).

## License

