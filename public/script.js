window.onload = function(){
(function() {
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  window.addEventListener("resize", e => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  });

  window.addEventListener("scroll", () => {
    e.preventDefault();
  });

  class Follower {
    constructor(x, y, z, mass) {
      this.position = new Float32Array([x, y, z]);
      this.velocity = new Float32Array([1, 1, Math.random() > 0.5 ? 1 : -1]);
      this.acceleration = new Float32Array([0, 0, 0]);
      this.mass = mass || 1;
      this.popped = false;
      this.poppable = false;
      this.element = document.createElement("div");
      this.element.classList.add("follower");
      document.getElementsByClassName("container")[0].appendChild(this.element);
      this.element.style.transform = `translate(${this.position[0]}px, ${
        this.position[1]
      }px)`;
      this.setHomie();
      this.element.addEventListener("mousedown", e => {
        e.stopPropagation();
        if (this.poppable) {
          this.element.classList.add("follower-pre-pop");
          this.element.firstChild.classList.add("homie-image-pre-pop");
          setTimeout(() => {
            this.element.firstChild.classList.add("homie-image-popped");
            this.element.classList.add("follower-popped");
          }, 300);
          setTimeout(() => (this.element.style.display = "none"), 600);
          this.popped = true;
        }
      });
    }

    applyForce(force) {
      const f = vec3.scale(new Float32Array(3), force, this.mass);
      vec3.add(this.acceleration, this.acceleration, f);
    }

    move() {
      vec3.add(this.velocity, this.velocity, this.acceleration);
      this.position[1] = this.position[1] + window.scrollY;
      this.velocity[1] = this.velocity[1] + window.scrollY;
      vec3.add(this.position, this.position, this.velocity);

      this.acceleration = new Float32Array(3);

      let [x, y, z] = this.position;
      z -= 50;

      this.element.style.transform = `translate(${x - 25}px, ${y - 25}px)
                                                        scale(${z / 100 * 2})`;
    }

    bounce() {
      const midWidth = Math.floor(windowWidth / 2);
      const midHeight = Math.floor(windowHeight / 2);

      if (Math.abs(this.position[0] - midWidth) >= midWidth - 25) {
        this.position[0] =
        this.position[0] + (this.position[0] > midWidth ? -25 : 25);
        this.velocity[0] *= -1;
        this.acceleration[0] *= -1;
      }

      if (Math.abs(this.position[1] - midHeight) >= midHeight - 25) {
        this.position[1] =
          this.position[1] + (this.position[1] > midHeight ? -25 : 25);
        this.velocity[1] *= -1;
        this.acceleration[1] *= -1;
      }
    }

    setHomie() {
      const request = new XMLHttpRequest();
      request.open("GET", "https://boiling-hamlet-18186.herokuapp.com/api");
      request.onload = () => {
        const src = JSON.parse(request.response).message;
        const img = document.createElement("img");
        img.src = src;
        img.classList.add("homie-image");
        img.onload = () => {
          this.element.append(img);
          this.poppable = true;
        };
      };
      request.send();
    }
  }

  class Attractor {
    constructor(x, y, z, mass, drag, gravity) {
      this.G = gravity;
      this.C = drag;
      this.mass = mass;
      this.position = new Float32Array([x, y, z]);
    }

    setXY(e) {
      this.position[0] = e.clientX - 10;
      this.position[1] = e.clientY - 10;
    }

    drag(follower) {
      const speed = vec3.len(follower.velocity);
      const dragMagnitude = speed * speed * this.C;
      const drag = vec3.scale(new Float32Array(3), follower.velocity, -1);
      vec3.normalize(drag, drag);
      vec3.scale(drag, drag, dragMagnitude);
      return drag;
    }

    attract(follower) {
      const distance = vec3.subtract(
        new Float32Array(3),
        this.position,
        follower.position
      );

      const distanceSq = vec3.multiply(new Float32Array(3), distance, distance);

      const strength = vec3.scale(
        new Float32Array(3),
        distanceSq,
        this.G * follower.mass * this.mass
      );

      let output = vec3.normalize(new Float32Array(3), distance);
      vec3.multiply(output, output, strength);

      return output;
    }

    repel(follower) {
      const inverse = vec3.inverse(new Float32Array(3), this.attract(follower));
      vec3.normalize(inverse, inverse);
      vec3.scale(inverse, inverse, 5);
      return inverse;
    }
  }

  const attractor = new Attractor(200, 200, 0, 1, 0.0005, 0.0001);

  let followers = [];
  for (let i = 0; i < 1; i++) {
    const follower = new Follower(
      Math.random() * 100,
      Math.random() * 100,
      Math.random() * 100
    );
    followers.push(follower);
  }

  const container = document.getElementsByClassName("container")[0];
  container.addEventListener("mousemove", attractor.setXY.bind(attractor));

  container.addEventListener("mousedown", e => {
    pushBack();
    const follower = new Follower(e.clientX, e.clientY, 5);
    followers.push(follower);
    follower.velocity = new Float32Array([
      Math.random() * 200,
      Math.random() * 200,
      Math.random() * 100,
      Math.random() * 10
    ]);
  });

  const homieCount = document.createElement("h1");
  homieCount.classList.add("homie-count");
  homieCount.innerHTML = "Homies count: " + followers.length;
  container.appendChild(homieCount);

  function pushBack() {
    followers.map(follower => follower.applyForce(attractor.repel(follower)));
  }

  function play(followers) {
    let popped = 0;
    followers.map(follower => {
      if (!follower.popped) {
        follower.applyForce(attractor.attract(follower));
        follower.applyForce(attractor.drag(follower));
        follower.bounce();
        follower.move();
      } else {
        popped++;
      }
    });

    homieCount.innerHTML =
      "Homies count: " +
      (followers.length - popped) +
      (followers.length - popped > 9 ? " wow." : "");

    requestAnimationFrame(() => play(followers));
  }

  play(followers);
})();
}
