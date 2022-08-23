/// @ts-check

document.body.classList.remove("nojs");

const pinkBG = "#f7c1c9";

const yellow = "#F2E788";
const green = "#8CC8BB";
const pink = "#F9C9CD";
const blue = "#BAE4F9";
const starColors = [yellow, green, pink, blue];

const msgColors = [
	"#ABDECE ",
	"#ED9FA4",
	"#E9D454",
	"#AC8E8C",
	"#A1DE9E",
];

const messageFill = "#AE8E8C";

const canvas = document.createElement("canvas");
canvas.id = "bg";
canvas.addEventListener("contextmenu", function (e) {
	e.preventDefault();
	return false;
});
document.body.appendChild(canvas);
var devicePixelRatio = window.devicePixelRatio || 1;
function resize() {
	canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
	canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
}
resize();
const context = canvas.getContext("2d");

let vw = canvas.width * 0.01;
let vh = canvas.height * 0.01;
window.addEventListener("resize", function() {
	resize();
	vw = canvas.width * 0.01;
	vh = canvas.height * 0.01;
	animateNext();
});

const _animations = [];
const _objects = [];
// adds both an object and an animation callback with shared state
// while the animation callback returns non-falsy values, it will repeatedly be
// called every frame with the state as first argument and delta time as second argument.
// The draw function will forever be drawn using the state on every draw call.
function addAnimation(draw, animation, state) {
	if (state === undefined)
		state = {};
	_objects.push({ cb: draw, state: state });
	_animations.push({ cb: animation, state: state });
	animateNext();
}

// register animation object for later setting (still loading) to preserve draw order
function reserveAnimationSlot() {
	let object = { cb: function() {} };
	let animation = { cb: function() { return true; } };
	_objects.push(object);
	_animations.push(animation);
	return [object, animation];
}

// like addAnimation, but use previously added slot reserved with reserveAnimationSlot
function setAnimation(slot, draw, animation, state) {
	slot[0].cb = draw;
	slot[0].state = state;
	slot[1].cb = animation;
	slot[1].state = state;
	animateNext();
}

function addObject(draw, state) {
	if (state === undefined)
		state = {};
	_objects.push({ cb: draw, state: state });
	animateNext();
}

let _lastTime = 0;
let _animationPending = false;
function animateNext() {
	if (_animationPending)
		return;
	_animationPending = true;
	requestAnimationFrame(animate);
}
let _paused = false;
function pause() { _paused = true; }
function unpause() { _paused = false; animateNext(); }
function animate(time) {
	if (!_lastTime)
		_lastTime = time;
	let delta = time - _lastTime;
	_lastTime = time;
	_animationPending = false;

	if (_paused) return;

	context.clearRect(0, 0, canvas.width, canvas.height);

	if (_animations.length > 0 && delta > 0)
	{
		for (let i = _animations.length - 1; i >= 0; i--)
			if (!_animations[i].cb(_animations[i].state, delta))
				_animations.splice(i, 1);
	}

	for (let i = 0; i < _objects.length; i++)
		_objects[i].cb(_objects[i].state);

	if (_animations.length > 0)
		animateNext();
}

/* const waveCanvas = document.createElement("canvas");
let height = 180;
waveCanvas.width = 240;
waveCanvas.height = height;
const waveContext = waveCanvas.getContext("2d");
waveContext.beginPath();
waveContext.moveTo(0, 0);
waveContext.lineTo(0, height / 2);
for (let i = 0; i <= 240; i++)
{
	let n = i / 240 * Math.PI * 2;
	waveContext.lineTo(i, Math.cos(n) * (height / 4) + (height / 4 * 3));
}
waveContext.lineTo(240, height / 2);
waveContext.lineTo(240, 0);
waveContext.fillStyle = "#68a7a3";
waveContext.fill(); */

function makeBorderArea() {
	let width = 80 * vw;
	let height = 60 * vh;
	return {
		x: (100 * vw - width) / 2,
		y: (100 * vh - height) / 2,
		w: width,
		h: height
	};
}

// border
addObject(function draw() {
	const area = makeBorderArea();
	context.lineWidth = 2 * vh;
	context.strokeStyle = "white";
	context.fillStyle = "white";
	context.translate(area.x + area.w / 2, area.y + area.h / 2);
	context.rotate(-2 / 180 * Math.PI);
	const x = -area.w / 2;
	const y = -area.h / 2;
	const w = area.w;
	const h = area.h;
	const radius = 5 * vh;
	roundRect(context, x, y, w, h, radius, false, true);

	context.beginPath();
	context.moveTo(x + w * 0.71, y);
	context.lineTo(x + w - radius, y);
	context.quadraticCurveTo(x + w, y, x + w, y + radius);
	context.lineTo(x + w, y + h * 0.3);
	context.lineTo(x + w * 0.756, y + h * 0.265);
	context.closePath();
	context.fill();

	{
		// ribbon bottom right
		context.beginPath();
		let margin = context.lineWidth * 1;
		let rise = 200 / 577;
		let startY = 0.2 * h;
		let lineHeight = 0.083 * h;
		context.moveTo(x + w - margin, y + h - startY - lineHeight);
		context.lineTo(x + w - margin, y + h - startY);
		context.lineTo(x + w - startY / rise, y + h - margin);
		context.lineTo(x + w - (startY + lineHeight) / rise, y + h - margin);
		context.closePath();
		context.fill();
	}

	context.resetTransform();
});

// nanahira picture
let imgFg = new Image();
imgFg.src = "nanahira.png";
let imgAspect = 1;
let imgSlot = reserveAnimationSlot();
function nanahiraLoaded() {
	setTimeout(function() {
		setAnimation(imgSlot, function draw(state) {
			let border = makeBorderArea();
			let bottom = border.y + border.h + 2 * vh + border.w * 0.009;
			let size = Math.min(border.w, border.h * 1.25);
			let animationProgressFg = Math.min(Math.max((state.time - state.bgOffset) / (state.max - state.bgOffset), 0), 1);
			let yFg = Math.pow(1.0 - animationProgressFg, 2) * 0.2;
			let alphaFg = Math.pow(animationProgressFg, 0.5);
			context.globalAlpha = alphaFg;
			context.drawImage(imgFg, border.x + 1 * vw, bottom - (1 - yFg) * size, size * imgAspect, size);
			context.globalAlpha = 1;
		}, function update(state, delta) {
			if (state.time < state.max)
				state.time += delta;

			if (state.time > state.max) {
				state.time = state.max;
				return false;
			} else {
				return true;
			}
		}, {
			time: 0,
			bgOffset: 70,
			max: 500
		});
	}, 200);
}
imgFg.onload = function() {
	imgAspect = imgFg.width / imgFg.height;
	nanahiraLoaded();
};

// border overlay
addObject(function draw() {
	const area = makeBorderArea();
	context.lineWidth = 2 * vh;
	context.strokeStyle = "white";
	context.resetTransform();
	context.translate(area.x + area.w / 2, area.y + area.h / 2);
	context.rotate(-2 / 180 * Math.PI);

	const x = -area.w / 2;
	const y = -area.h / 2;
	const width = area.w;
	const height = area.h;
	const radius = 5 * vh;

	context.fillStyle = pinkBG;
	context.globalCompositeOperation = "destination-out";
	context.beginPath();
	context.moveTo(x - 5 * vw, y);
	context.lineTo(x, y);
	context.lineTo(x, y + height - radius);
	context.quadraticCurveTo(x, y + height, x + radius, y + height);
	context.lineTo(x + width - radius, y + height);
	context.lineTo(x + width - radius, y + height + 20 * vh);
	context.lineTo(x - 5 * vw, y + height + 20 * vh);
	context.closePath();
	context.fill();
	context.globalCompositeOperation = "source-over";

	context.lineWidth = 2 * vh;
	context.strokeStyle = "white";

	context.beginPath();
	context.moveTo(x + width - radius, y + height);
	context.lineTo(x + radius, y + height);
	context.quadraticCurveTo(x, y + height, x, y + height - radius);
	context.lineTo(x, y + radius);
	context.quadraticCurveTo(x, y, x + radius, y);
	context.stroke();

	context.resetTransform();
});

// message box
let messageBox = reserveAnimationSlot();
setTimeout(function() {
	setAnimation(messageBox, function draw(state) {
		let vv = vh / 1080 * 1920;
		let switchRatio = 1 / 3;
		if (vw * switchRatio < vh)
			vv = vw * 2 * switchRatio;
			vv *= 1.5;
		const area = makeBorderArea();
		
		let animARaw = Math.min(state.loadIn, state.maxLoadInA) / state.maxLoadInA;
		let animBRaw = Math.max(0, state.loadIn - state.delayB) / (state.maxLoadInB - state.delayB);

		let animA = easeOutElastic(animARaw);
		let animB = easeOutElastic(animBRaw);
		
		context.translate(area.x + area.w - 50 * vv, area.y + area.h / 2 - 5 * vv + 1.7 * vv);
		context.rotate(((1 - animB) * 120) / 180 * Math.PI);
		context.scale(animB * animB, animB * animB);
		context.globalAlpha = Math.min(1, animBRaw * 4);

		context.fillStyle = "white";

		context.beginPath();
		context.moveTo(0, 1.7 * vv - 1.7 * vv);
		context.lineTo(47 * vv, 3.1 * vv - 1.7 * vv);
		context.lineTo(39.7 * vv, 11.3 * vv - 1.7 * vv);
		context.lineTo(2.9 * vv, 12.6 * vv - 1.7 * vv);
		context.closePath();
		context.fill();

		context.resetTransform();

		context.translate(area.x + area.w - 50 * vv + 1.7 * vv, area.y + area.h / 2 - 5 * vv);
		context.rotate(((1 - animA) * 120) / 180 * Math.PI);
		context.scale(animA * animA, animA * animA);
		context.globalAlpha = Math.min(1, animARaw * 4);

		context.fillStyle = messageFill;

		context.beginPath();
		context.moveTo(1.7 * vv - 1.7 * vv, 0);
		context.lineTo(44.7 * vv - 1.7 * vv, 1.4 * vv);
		context.lineTo(37.9 * vv - 1.7 * vv, 9.7 * vv);
		context.lineTo(4 * vv - 1.7 * vv, 11 * vv);
		context.closePath();
		context.fill();

		context.resetTransform();
		context.globalAlpha = 1;
	}, function update(state, delta) {
		if (state.loadIn < state.maxLoadInB)
		{
			state.loadIn += delta;
			return true;
		}
		else
		{
			state.loadIn = state.maxLoadInB;
			return false;
		}
	}, {
		loadIn: 0,
		maxLoadInA: 1000,
		delayB: 100,
		maxLoadInB: 1100,
	});
	setTimeout(function() {
		document.querySelector(".carousel-wrapper").style.opacity = 1;
	}, 400);
}, 150);
document.querySelector(".carousel-wrapper").style.transition = "0.3s ease-in opacity";
document.querySelector(".carousel-wrapper").style.opacity = 0;

let chibi = new Image();
chibi.src = "wasabi-label.png";
let chibiSlot = reserveAnimationSlot();
chibi.onload = function() {
	let chibiAspect = chibi.width / chibi.height;
	setTimeout(function() {
		setAnimation(chibiSlot, function draw(state) {
			const loadIn = state.loadIn / state.maxLoadIn;
			let vv = vh / 1080 * 1920;
			let switchRatio = 1 / 3;
			if (vw * switchRatio < vh)
				vv = vw * 2 * switchRatio;
				vv *= 1.5;
			const area = makeBorderArea();
			let messageTop = area.y + area.h / 2 - 5 * vv;
			let messageLeft = area.x + area.w - 50 * vv;

			let border = makeBorderArea();
			let size = 10 * vw;
			context.globalAlpha = loadIn;
			context.translate(messageLeft + size * 0.35, messageTop - size * 0.25);
			context.scale(easeOutBounce(loadIn), easeOutBounce(loadIn));
			context.rotate((state.flipped ? 0 : -10) / 180 * Math.PI);
			context.drawImage(chibi, -size * chibiAspect / 2, -size / 2, size * chibiAspect, size);
			context.resetTransform();
			context.globalAlpha = 1;
		}, function update(state, delta) {
			state.flipTime += delta;
			if (state.loadIn < state.maxLoadIn)
				state.loadIn += delta;
			else
				state.loadIn = state.maxLoadIn;

			if (state.flipTime > state.flipTimeMax) {
				state.flipTime %= state.flipTimeMax;
				state.flipped = !state.flipped;
			}
			return true;
		}, {
			loadIn: 0,
			maxLoadIn: 500,
			flipTime: 0,
			flipTimeMax: 600,
			flipped: false
		});
	}, 500);
};


// stars
// didn't wanna code the line intersection code, so copy paste from inkscape lol
// star dimension: 100,100 at -50,-50
const starPath = "M -16.263672 -44.339844 L -18.255859 -40.125 L -18.255859 27.939453 L -16.263672 26.845703 L -14.289062 27.929688 L -14.289062 -40.162109 L -16.263672 -44.339844 z M -10.322266 -31.769531 L -10.322266 30.107422 L -6.3554688 32.285156 L -6.3554688 -23.376953 L -10.322266 -31.769531 z M -22.222656 -31.732422 L -26.189453 -23.339844 L -26.189453 32.294922 L -22.222656 30.117188 L -22.222656 -31.732422 z M -2.3886719 -16.001953 L -2.3886719 34.462891 L 1.578125 36.640625 L 1.578125 -15.400391 L -2.3886719 -16.001953 z M -30.158203 -15.998047 L -34.125 -15.396484 L -34.125 36.650391 L -30.158203 34.472656 L -30.158203 -15.998047 z M 5.5449219 -14.796875 L 5.5449219 10.25 L 9.5117188 6.2128906 L 9.5117188 -14.195312 L 5.5449219 -14.796875 z M -38.091797 -14.794922 L -42.058594 -14.191406 L -42.058594 6.1933594 L -38.091797 10.230469 L -38.091797 -14.794922 z M 13.478516 -13.59375 L 13.478516 2.1757812 L 17.445312 -1.8613281 L 17.445312 -12.992188 L 13.478516 -13.59375 z M -46.025391 -13.589844 L -49.992188 -12.988281 L -49.992188 -1.8808594 L -46.025391 2.15625 L -46.025391 -13.589844 z M 21.412109 -12.388672 L 21.412109 -5.8984375 L 25.378906 -9.9355469 L 25.378906 -11.787109 L 21.412109 -12.388672 z M -53.958984 -12.386719 L -57.925781 -11.783203 L -57.925781 -9.9570312 L -53.958984 -5.9199219 L -53.958984 -12.386719 z M 5.5449219 11.638672 L 5.5449219 38.818359 L 9.5117188 40.996094 L 9.5117188 35.791016 L 5.5449219 11.638672 z M -38.091797 11.757812 L -42.058594 35.910156 L -42.058594 41.005859 L -38.091797 38.828125 L -38.091797 11.757812 z"
	.split(/\s+/);
function cacheBitmap(path, size, fill) {
	let canvas = document.createElement("canvas");
	canvas.width = Math.floor(size * devicePixelRatio);
	canvas.height = Math.floor(size * devicePixelRatio);
	let context = canvas.getContext("2d");
	let ret = "";
	context.fillStyle = fill;
	for (let i = 0; i < path.length; i++) {
		let x, y;
		switch (path[i]) {
			case "M":
				x = (parseFloat(path[++i]) / 100 + 0.5) * size;
				y = (parseFloat(path[++i]) / 100 + 0.5) * size;
				context.beginPath();
				context.moveTo(x, y);
				break;
			case "L":
				x = (parseFloat(path[++i]) / 100 + 0.5) * size;
				y = (parseFloat(path[++i]) / 100 + 0.5) * size;
				context.lineTo(x, y);
				break;
			case "z":
				context.fill();
				break;
			default: throw new Error("Unknown path: " + path[i]);
		}
	}
	return canvas;
}
const starBitmaps = starColors.map(c => cacheBitmap(starPath, 400, c));
const starSpeed = 0.3;
const stars = (function() {
	const numX = 5;
	const numY = 5;
	const wiggle = 0.5 / numX;
	const stars = new Array(numX * numY);
	for (let y = 0; y < numY; y++) {
		for (let x = 0; x < numX; x++) {
			let radius = Math.random() * 0.5 + 0.5;
			stars[x + y * numX] = {
				x: x / numX + (Math.random() - 0.5) * wiggle,
				y: y / numY + (Math.random() - 0.5) * wiggle,
				rotation: Math.random() * 2 * Math.PI,
				velocity: Math.random() * 0.2 + 0.8,
				color: starBitmaps[Math.floor(Math.random() * starBitmaps.length)],
				opacity: 1 - Math.pow(Math.random(), 2) * 0.5,
				radius: radius,
			};
		}
	}
	return stars;
})();
addAnimation(function draw(state) {
	for (let i = 0; i < state.stars.length; i++) {
		const star = state.stars[i];

		const vm = Math.max(vw, vh);
		const margin = star.radius * vm * 20 * 0.5;
		const fullSize = vm * (100 + star.radius * 20);

		context.globalCompositeOperation = "destination-over";

		context.translate(star.x * fullSize - margin, star.y * fullSize - margin);
		context.scale(vm * 20 * star.radius, vm * 20 * star.radius);
		context.rotate(star.rotation);
		context.globalAlpha = star.opacity;
		context.drawImage(star.color, -0.5, -0.5, 1, 1);
		context.resetTransform();

		context.globalCompositeOperation = "source-over";
	}
	context.globalAlpha = 1;
}, function update(state, delta) {
	state.time += delta;
	for (let i = 0; i < state.stars.length; i++) {
		const star = state.stars[i];
		star.x += star.velocity * delta * 0.0001 * starSpeed;
		star.y += star.velocity * delta * 0.0001 * starSpeed;
		if (star.x > 1)
			star.x %= 1;
		if (star.y > 1)
			star.y %= 1;
	}
	return true;
}, { time: 0, stars: stars });

animateNext();

(/**
 * @param {HTMLElement} carousel 
 */
function scrollMessageCarousel(carousel) {
	const animation = "0.7s cubic-bezier(.47,.22,.3,1) left";
	const animationLength = 700 - 100;

	const ui = carousel.parentElement.querySelector(".ui");

	let originalMessages = [];

	carousel.firstElementChild.style.display = "none";
	let ul = document.querySelector('ul');
	// store messages in original order for all list
	for (let i = 0; i < carousel.children.length; i++)
		originalMessages.push(carousel.children[i]);

	for (var i = originalMessages.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = originalMessages[i];
		originalMessages[i] = originalMessages[j];
		originalMessages[j] = temp;
	}

	// shuffle messages
	for (let i = carousel.children.length; i >= 0; i--)
		carousel.appendChild(carousel.children[Math.random() * i | 0]);

	carousel.firstElementChild.style.display = "";

	let scrollTimeout;
	function queueNext(fast, reverse) {
		let current = carousel.firstElementChild;
		let next = reverse ? current.parentElement.lastElementChild : current.nextElementSibling;
		next.style.transition = "";
		next.style.left = reverse ? "-120%" : "120%";
		next.style.width = carousel.getBoundingClientRect().width + "px";
		next.style.display = "";
		next.style.visibility = "hidden";
		scrollTimeout = setTimeout(showNext, (fast ? 1000 : 3000) + current.textContent.length * (fast ? 20 : 80));
	}
	function showNext(reverse) {
		clearTimeout(scrollTimeout);
		scrollTimeout = undefined;
		let current = carousel.firstElementChild;
		let next = reverse ? current.parentElement.lastElementChild : current.nextElementSibling;
		current.style.transition = animation;
		current.style.left = reverse ? "120%" : "-120%";
		current.style.width = carousel.getBoundingClientRect().width + "px";
		next.style.transition = animation;
		next.style.left = "0%";
		next.style.display = "";
		next.style.visibility = "";
		setTimeout(function() {
			current.style.display = "none";
			// move to end
			if (reverse)
				carousel.insertBefore(next, current);
			else
				carousel.appendChild(current);
			next.style.width = "";
			queueNext();
		}, animationLength);
	}
	queueNext();

	carousel.addEventListener("pointermove", function() {
		if (scrollTimeout !== undefined) {
			clearTimeout(scrollTimeout);
			queueNext();
		}
	});

	carousel.addEventListener("pointerleave", function() {
		if (scrollTimeout !== undefined) {
			clearTimeout(scrollTimeout);
			queueNext(true);
		}
	});

	function uiPrev() {
		if (scrollTimeout !== undefined) {
			clearTimeout(scrollTimeout);
			queueNext(true, true);
			setTimeout(function() {
				showNext(true);
			}, 40);
		}
	}

	function uiNext() {
		if (scrollTimeout !== undefined) {
			clearTimeout(scrollTimeout);
			queueNext(true);
			setTimeout(function() {
				showNext();
			}, 40);
		}
	}

	ui.querySelector(".prev").addEventListener("click", uiPrev);
	ui.querySelector(".next").addEventListener("click", uiNext);

	carousel.addEventListener("wheel", function(e) {
		if (scrollTimeout !== undefined) {
			/* if (e.deltaX > 0 || e.deltaY > 0)
				uiNext();
			else if (e.deltaX < 0 || e.deltaY < 0)
				uiPrev(); */
			clearTimeout(scrollTimeout);
			queueNext();
		}
	})

	let showAll;
	ui.querySelector(".all").addEventListener("click", showAll = function() {
		let allList = document.querySelector(".all-messages");
		if (!allList) {
			allList = document.createElement("div");
			allList.className = "all-messages";

			let cheri = document.createElement("a");
			cheri.className = "cheri";
			cheri.setAttribute("target", "_blank");
			cheri.href = "https://twitter.com/chelicot";
			cheri.textContent = "チェリ藻";
			allList.appendChild(cheri);
			let hinanon = document.createElement("a");
			hinanon.className = "hinanon";
			hinanon.setAttribute("target", "_blank");
			hinanon.href = "https://twitter.com/hinanon1217";
			hinanon.textContent = "ひなのすけ \ud83d\udc24";
			allList.appendChild(hinanon);

			let rain = document.createElement("div");
			rain.className = "rain";
			allList.appendChild(rain);
			rainStickers(rain);

			document.body.appendChild(allList);
			let closeButton = document.createElement("div");
			closeButton.className = "closebtn";
			closeButton.textContent = "×";
			allList.appendChild(closeButton);
			closeButton.addEventListener("click", function() {
				canvas.style.display = "";
				unpause();
				allList.style.opacity = "0";
				allList.style.pointerEvents = "none";
			});
			let loadTrigger = document.createElement("div");
			loadTrigger.style.position = "relative";
			loadTrigger.style.height = "1px";
			allList.appendChild(loadTrigger);
			let scrollFaker = document.createElement("div");
			scrollFaker.style.height = (3 * originalMessages.length) + "em";
			allList.appendChild(scrollFaker);
			let messageCounter = 0;
			let inserting = undefined;
			let intersecting = false;
			function insertNextMessage() {
				if (intersecting) {
					let clone = originalMessages[messageCounter].cloneNode(true);
					allList.insertBefore(clone, loadTrigger);
					scrollFaker.style.height = (3 * (originalMessages.length - messageCounter - 1)) + "em";
					clone.setAttribute("style", "");
					clone.style.backgroundColor = msgColors[Math.floor(msgColors.length * Math.random())];
					clone.classList.add("big");
					setTimeout(function() {
						clone.classList.add("visible");
					}, 50);
					messageCounter++;
					inserting = setTimeout(function() {
						inserting = undefined;
						insertNextMessage();
					}, 100);
				}
			}
			// insertNextMessage();
			let scrollObserver = new IntersectionObserver(function(e) {
				intersecting = e[0].isIntersecting;
				if (intersecting)
					insertNextMessage();
			}, {
				root: allList
			});
			scrollObserver.observe(loadTrigger);
		}
		setTimeout(function() {
			allList.style.opacity = "1";
			allList.style.pointerEvents = "all";
			setTimeout(function() {
				if (allList.style.opacity == "1") {
					canvas.style.display = "none";
					pause();
				}
			}, 300);
		}, 50);
	});
})(document.querySelector(".carousel"));

window.addEventListener("wheel", function(e) {
	let allList = document.querySelector(".all-messages");
	if  (allList && allList.style.opacity == "1")
		return;

	let target = e.target;
	while (target) {
		if (target.classList && (target.classList.contains("message") || target.classList.contains("credits")))
			return;
		target = target.parentElement;
	}

	if (e.deltaY > 0) {
		document.querySelector(".credits").classList.add("visible");
		e.preventDefault();
	} else if (e.deltaY < 0) {
		document.querySelector(".credits").classList.remove("visible");
		e.preventDefault();
	}
});

window.addEventListener("click", function(e) {
	if (document.querySelector(".credits").classList.contains("visible"))
	{
		let target = e.target;
		while (target) {
			if (target.classList && target.classList.contains("credits"))
				return;
			target = target.parentElement;
		}
		document.querySelector(".credits").classList.remove("visible");
		e.preventDefault();
	}
});

/**
 * @type { HTMLAudioElement }
 */
let bgm = document.querySelector(".bgm-player audio");
bgm.volume = 0.5;
bgm.loop = true;
document.querySelector(".bgm-player .play").addEventListener("click", function(e) {
	if (bgm.paused)
		bgm.play();
	else
		bgm.pause();
	document.querySelector(".bgm-player .play").className = bgm.paused ? "play muted" : "play";
});
document.querySelector(".bgm-player .volume-slider").addEventListener("input", function(e) {
	bgm.volume = document.querySelector(".bgm-player .volume-slider").value / 100;
	document.querySelector(".bgm-player .label").textContent = Math.floor(bgm.volume * 100) + "%";
})

function rainStickers(container) {
	const columnCount = 20;
	let columns = [];
	for (let i = 0; i < columnCount; i++) {
		let column = document.createElement("div");
		column.style.transform = "translateX(" + (i / columnCount * 100) + "%)";
		columns.push(column);
		container.appendChild(column);
	}

	function addSticker() {
		const count = 37;
		const w = 7;
		let i = Math.floor(Math.random() * count);
		let stickerwrap = document.createElement("div");
		stickerwrap.className = "stickerwrap";
		let scale = Math.random() * 0.3 + 0.8;
		let rot = Math.random() * 180 - 90;
		stickerwrap.style.transform = "scale(" + scale + ", " + scale + ") rotate(" + rot + "deg)";
		let sticker = document.createElement("div");
		sticker.className = "sticker row" + Math.floor(i / w) + " col" + (i % w);
		stickerwrap.appendChild(sticker);
		let column = columns[Math.floor(Math.random() * columns.length)];
		column.appendChild(stickerwrap);
		setTimeout(function() {
			stickerwrap.parentElement.removeChild(stickerwrap);
		}, 9000);
	}

	function loopSticker() {
		setTimeout(function() {
			let allList = document.querySelector(".all-messages");
			if  (allList && allList.style.opacity == "1")
				addSticker();
			loopSticker();
		}, 1500 + Math.random() * 500);
	}
	loopSticker();
}

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number|Object} [radius = 5] The corner radius.
 * @param {Object} [radius] It can also be an object 
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
*/
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof stroke === 'undefined') {
		stroke = true;
	}
	if (typeof radius === 'undefined') {
		radius = 5;
	}
	if (typeof radius === 'number') {
		radius = {tl: radius, tr: radius, br: radius, bl: radius};
	} else {
		let defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
		for (let side in defaultRadius) {
			radius[side] = radius[side] || defaultRadius[side];
		}
	}
	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius.tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y + radius.tl);
	ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	ctx.closePath();
	if (fill) {
		ctx.fill();
	}
	if (stroke) {
		ctx.stroke();
	}
}

function easeOutBounce(x) {
	const n1 = 7.5625;
	const d1 = 2.75;
	
	if (x < 1 / d1) {
		return n1 * x * x;
	} else if (x < 2 / d1) {
		return n1 * (x -= 1.5 / d1) * x + 0.75;
	} else if (x < 2.5 / d1) {
		return n1 * (x -= 2.25 / d1) * x + 0.9375;
	} else {
		return n1 * (x -= 2.625 / d1) * x + 0.984375;
	}
}

function easeOutElastic(x) {
	const c4 = (2 * Math.PI) / 3;
	
	return x === 0
	  ? 0
	  : x === 1
	  ? 1
	  : Math.pow(2, -20 * x) * Math.sin((x * 6 - 0.75) * c4) + 1;
}
