<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let particles = $state<
		{
			x: number;
			y: number;
			size: number;
			rotation: number;
			color: number;
			xVel: number;
			yVel: number;
			opacity: number;
		}[]
	>([]);

	onMount(() => {
		const onResize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		onResize();
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});

	export function spawnParticle(x: number, y: number) {
		for (let i = 0; i < 5; i++) {
			particles = [
				...particles,
				{
					// x,
					// y,
					// randomiz the x and y by 5 pixels
					x: x + Math.random() * 10 - 5,
					y: y + Math.random() * 10,
					size: Math.random() * 10 + 5,
					rotation: Math.random() * 360,
					color: Math.random(),
					xVel: Math.random() * 2 - 1,
					yVel: Math.random() * 2 - 3,
					opacity: 0.75
				}
			];
		}
	}

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let frame: number;
		let lastTime = 0;

		const draw = (time: number) => {
			if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

			// Calculate deltaTime in seconds
			const deltaTime = (time - lastTime) / 1000;
			lastTime = time;

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const particlesToRemove: (typeof particles)[0][] = [];

			particles.forEach((particle) => {
				if (particle.opacity <= 0) {
					particlesToRemove.push(particle);
					ctx.globalAlpha = 0;
					return;
				}

				const intendedFramerate = 160;

				// Update particle properties with deltaTime
				particle.opacity -= 0.01 * (deltaTime * intendedFramerate);
				particle.x += particle.xVel * deltaTime * intendedFramerate;
				particle.y += particle.yVel * deltaTime * intendedFramerate;
				particle.yVel += 0.05 * deltaTime * intendedFramerate;
				particle.rotation += 0.1 * deltaTime * intendedFramerate;

				// draw dollar sign
				ctx.save();
				ctx.globalAlpha = particle.opacity;
				ctx.translate(particle.x, particle.y);
				ctx.rotate(particle.rotation);
				ctx.fillStyle = `hsl(120, 100%, ${particle.color * 50 + 50}%)`;

				ctx.font = `${particle.size + 16}px 'IBM Plex Mono', monospace`;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText('$', 0, 0);
				ctx.restore();
			});

			particles = particles.filter((p) => !particlesToRemove.includes(p));

			frame = requestAnimationFrame(draw);
		};

		frame = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(frame);
	});
</script>

<canvas bind:this={canvas} class="pointer-events-none fixed left-0 top-0 z-[9999] h-screen w-screen"
></canvas>
