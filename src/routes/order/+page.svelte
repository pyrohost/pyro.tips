<script lang="ts">
	import PyroLogo from '$lib/components/PyroLogo.svelte';
	import PyroToast from '$lib/components/PyroToast.svelte';
	import { onMount, setContext, tick } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { ChevronDownIcon, ChevronLeftIcon, CircleCheck } from 'lucide-svelte';
	import { getCaretCoordinates } from '$lib/util';
	import ChaChingParticles from '$lib/components/ChaChingParticles.svelte';
	import { loadStripe } from '@stripe/stripe-js';
	import { PaymentElement, Elements } from 'svelte-stripe';
	import { PUBLIC_STRIPE_KEY } from '$env/static/public';
	import type { Stripe, StripeElements, PaymentIntent } from '@stripe/stripe-js';
	import { blur } from '$lib/transitions';
	import Spinner from '$lib/components/Spinner.svelte';

	const { data } = $props();

	let stripe: Stripe | null = $state(null);
	let elements: StripeElements | null = $state(null);
	let stripeFinishedLoading = $state(false);

	$effect(() => {
		setContext('stripe', { stripe, elements }); // https://github.com/joshnuss/svelte-stripe/issues/122
	});

	let particleManager: ReturnType<typeof ChaChingParticles>;
	let isLoading = $state(false);
	let loadingTitle = $state('Working on it!');
	let loadingMessage = $state('Processing your order, please wait.');
	let toastTitle = $state('');
	let toastMessage = $state('');
	let toastType = $state('error');
	let isToastShown = $state(false);
	let isDropdownOpen = $state(false);
	let step = $state(1);
	let isForwardNav = $state(true);
	let isNewBelow = $state(true);

	let orderData = $state({
		amount: 0,
		email: '',
		message: ''
	});

	let sentOrderData: typeof orderData | null = $state(null);

	let dropdownMenu: HTMLDivElement | null = $state(null);

	$effect(() => {
		if (isDropdownOpen) {
			tick().then(() => {
				if (!dropdownMenu) return;
				const selected = dropdownMenu.querySelector('.bg-zinc-800');
				if (selected) {
					selected.scrollIntoView({ block: 'center' });
				}
			});
		}
	});

	let tx = $state(0);
	let ty = $state(0);

	const shake = (
		startIntensity: number
	): {
		cancel: () => void;
		setIntensity: (intensity: number) => void;
	} => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) () => {};
		let intensity = startIntensity || 1;
		let cancelled = false;
		let interval = setInterval(() => {
			tx = Math.random() * intensity - intensity / 2;
			ty = Math.random() * intensity - intensity / 2;
		}, 1000 / 60);
		return {
			cancel: () => {
				clearInterval(interval);
				tx = 0;
				ty = 0;
				cancelled = true;
			},
			setIntensity: (i: number) => {
				if (cancelled) return;
				intensity = i;
			}
		};
	};

	const shakeFor = (duration: number, intensity: number) => {
		const { cancel } = shake(intensity);
		setTimeout(cancel, duration);
	};

	let selectedRecipient = $state(data.staff.find((r) => r.user.id === '1053012491006910504')); // i wonder who put this here...

	let dumbStepId = $state('');
	// let safeToRender = $state(false);
	// let shouldRender = $state(false);

	function setStep(num: number) {
		isForwardNav = num > step;
		if (num === 2) {
			const id = crypto.randomUUID();
			dumbStepId = id;
			setTimeout(() => {
				if (dumbStepId !== id || step !== 2) return;
				elements?.getElement('payment')?.on('ready', () => {
					stripeFinishedLoading = true;
				});
			}, 500);
		}
		step = num;
		tick().then(() => {
			// scroll to top
			window.scrollTo({ top: 0, behavior: 'instant' });
		});
	}

	function selectRecipient(recipient: (typeof data.staff)[0]) {
		const oldIndex = data.staff.findIndex((r) => r.user.id === selectedRecipient?.user.id);
		const newIndex = data.staff.findIndex((r) => r.user.id === recipient.user.id);
		isNewBelow = newIndex < oldIndex;
		selectedRecipient = recipient;
		isDropdownOpen = false;
	}

	async function toPayment() {
		if (document.getElementById('whaaatttt')) return;
		// Validate order data
		if (!selectedRecipient || !orderData.amount || !orderData.email) {
			toastTitle = 'Error';
			toastMessage = 'Please fill out all fields.';
			isToastShown = true;
			return;
		}

		// Make sure we have a valid email
		if (!orderData.email.match(/\S+@\S+\.\S+/)) {
			toastTitle = 'Error';
			toastMessage = 'Please enter a valid email address.';
			return;
		}

		// Don't exceed 1000 USD
		if (orderData.amount > 1000) {
			toastTitle = 'Error';
			toastMessage = 'While we appreciate your generosity, we can only accept orders up to $1000.';
			return;
		}

		if (
			pIntent?.amount === orderData.amount * 100 &&
			sentOrderData?.amount === orderData.amount &&
			sentOrderData?.email === orderData.email &&
			sentOrderData?.message === orderData.message
		) {
			setStep(2);
			return;
		}

		const { setIntensity, cancel } = shake(1);

		let intensity = 0;

		const interval = setInterval(() => {
			if (intensity > 10) {
				intensity = 10;
			}
			intensity += 2;
			setIntensity(intensity);
		}, 16);

		const response = await fetch('/stripe/payment', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				orderData,
				recipient: selectedRecipient.user.id
			})
		});

		cancel();
		clearInterval(interval);

		if (!response.ok) {
			toastTitle = 'Error';
			toastMessage = 'An error occurred while processing your order. Please try again later.';
			toastType = 'error';
			isToastShown = true;
			return;
		}

		const data = await response.json();
		if (data.error) {
			toastTitle = 'Error';
			toastMessage = data.error;
			toastType = 'error';
			isToastShown = true;
			return;
		}
		sentOrderData = { ...orderData };
		pIntent = data;
		setStep(2);
	}

	function goToPreviousStep() {
		setStep(1);
	}

	onMount(() => {
		const click = (e: MouseEvent) => {
			if (
				isDropdownOpen &&
				!(e.target as any).closest('.dropdown-menu') &&
				!(e.target as any).closest('.dropdown-button')
			) {
				isDropdownOpen = false;
			}
		};

		document.addEventListener('click', click);
		return () => document.removeEventListener('click', click);
	});

	function validateInput(e: Event) {
		const target = e.target as HTMLInputElement;

		if (orderData.amount < 0) {
			orderData.amount = 0;
		}
		if (orderData.amount > 1000) {
			orderData.amount = 1000;
		}

		const selectionStart = target.selectionStart;
		if (selectionStart !== null) {
			const { top: localTop, left: localLeft } = getCaretCoordinates(target, selectionStart);
			// this is relative to the input element, so we need to add the input's position
			const { top, left } = target.getBoundingClientRect();
			// this is the absolute position of the caret
			const absoluteTop = top + localTop;
			const absoluteLeft = left + localLeft;
			particleManager.spawnParticle(absoluteLeft, absoluteTop + window.scrollY);
			shakeFor(100, 25);
		}
	}

	let pIntent: PaymentIntent | null = $state(null);

	const beginPayment = async () => {
		if (!stripe || !elements) return;
		const { setIntensity, cancel } = shake(1);

		let intensity = 0;

		const interval = setInterval(() => {
			if (intensity > 10) {
				intensity = 10;
			}
			intensity += 2;
			setIntensity(intensity);
		}, 50);

		const result = await stripe.confirmPayment({
			elements,
			redirect: 'if_required'
		});
		clearInterval(interval);
		cancel();
		if (result.error || result.paymentIntent?.status !== 'succeeded') {
			toastTitle = 'Error';
			toastMessage =
				result.error?.message ||
				(result.paymentIntent?.status
					? `Status is "${result.paymentIntent?.status}".`
					: undefined) ||
				'An error occurred.';
			toastType = 'error';
			isToastShown = true;
		} else {
			pIntent = result.paymentIntent;
			setStep(3);
		}
	};

	onMount(async () => {
		stripe = await loadStripe(PUBLIC_STRIPE_KEY);
	});
</script>

<div style="transform: translate({tx}px, {ty}px)" class="absolute left-0 top-0 z-[9999]">
	<ChaChingParticles bind:this={particleManager} />
</div>

<!-- Centered responsive form for ordering -->
<div class="flex h-screen items-center justify-center sm:h-[calc(100vh-48px)]">
	<PyroToast
		bind:shown={isToastShown}
		title={toastTitle}
		message={toastMessage}
		duration={5000}
		position="top-right"
		type={toastType}
	/>
	<div
		class="mb-auto mt-auto max-h-full w-full max-w-md bg-black shadow-xl"
		style="transform: translate({tx}px, {ty}px)"
	>
		<div class="grid grid-cols-1 grid-rows-1 place-items-center pb-16 pt-16">
			{#key step}
				<div
					in:blur={{
						duration: 500,
						easing: quintOut,
						blurMultiplier: 3,
						x: {
							start: isForwardNav ? 100 : -100,
							end: 0
						}
					}}
					out:blur={{
						duration: 500,
						easing: quintOut,
						blurMultiplier: 3,
						x: {
							start: 0,
							end: isForwardNav ? -100 : 100
						}
					}}
					class="col-start-1 row-start-1"
				>
					<PyroLogo style="mx-auto mb-6 h-16 w-16" />

					{#if !isLoading}
						{#if step === 1}
							<h1 class="mb-4 text-center text-3xl font-semibold text-white">Send a donation</h1>
							<p class="mx-auto mb-6 max-w-sm text-center text-gray-200">
								Select your order details below to gift a donation to our team members.
							</p>
						{:else if step === 2}
							<h1 class="mb-4 text-center text-3xl font-semibold text-white">Pay for Order</h1>
							<p class="mx-auto mb-6 max-w-sm text-center text-gray-200">
								Enter your payment details below to complete your order. Payments are securely
								processed by Stripe.
							</p>
						{/if}
					{/if}

					{#if isLoading}
						<div class="flex flex-col items-center justify-center">
							<svg
								aria-hidden="true"
								class="inline size-10 animate-spin fill-gray-600 text-gray-200 dark:fill-gray-300 dark:text-gray-600"
								viewBox="0 0 100 101"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
									fill="currentColor"
								/>
								<path
									d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
									fill="currentFill"
								/>
							</svg>
							<p class="mt-2 text-center text-gray-200">{loadingTitle}</p>
							<p class="mt-1 text-center text-gray-400">{loadingMessage}</p>
						</div>
					{/if}

					{#if step === 1 && !isLoading}
						{@const translateAmount = 25}
						<form class="flex flex-col space-y-4" onsubmit={(e) => e.preventDefault()}>
							<!-- Custom Recipient dropdown -->
							<div class="relative flex flex-col space-y-2">
								<label for="recipient" class="text-gray-200">Recipient</label>
								<div class="relative">
									<button
										type="button"
										class="dropdown-button relative flex w-full cursor-pointer items-center overflow-hidden border border-gray-700 bg-black p-4 text-gray-200"
										onclick={() => (isDropdownOpen = !isDropdownOpen)}
									>
										{#key selectedRecipient?.user.id}
											<div
												out:blur={{
													blurMultiplier: 3,
													duration: 500,
													easing: quintOut,
													y: {
														start: 0,
														end: isNewBelow ? translateAmount : -translateAmount
													}
												}}
												in:blur={{
													blurMultiplier: 3,
													duration: 500,
													easing: quintOut,
													y: {
														start: isNewBelow ? -translateAmount : translateAmount,
														end: 0
													}
												}}
												class="absolute left-3 flex items-center"
											>
												{#if selectedRecipient}
													<img
														src="https://cdn.discordapp.com/avatars/{selectedRecipient.user
															.id}/{selectedRecipient.user.avatar}.webp?size=32"
														alt={selectedRecipient.nick ||
															selectedRecipient.user.global_name ||
															selectedRecipient.user.username}
														class="mr-2.5 h-6 w-6 rounded-full"
													/>
													<span
														>{selectedRecipient.nick ||
															selectedRecipient.user.global_name ||
															selectedRecipient.user.username}</span
													>
												{:else}
													<span>Select a recipient</span>
												{/if}
											</div>
										{/key}
										<span class="ml-auto text-gray-400">
											<ChevronDownIcon
												size={16}
												style="transition: 200ms transform cubic-bezier(0.22, 1, 0.36, 1); transform: rotate({isDropdownOpen
													? 180
													: 0}deg)"
											/>
										</span>
									</button>

									{#if isDropdownOpen}
										<div
											transition:blur={{
												blurMultiplier: 4,
												duration: 300,
												easing: quintOut
											}}
											class="dropdown-menu absolute z-10 mt-2 max-h-96 w-full overflow-y-auto bg-zinc-900 shadow-lg"
											bind:this={dropdownMenu}
										>
											{#each data.staff as recipient}
												<div
													class="flex cursor-pointer items-center px-3 py-3 hover:bg-zinc-800 {selectedRecipient
														?.user.id === recipient.user.id
														? 'bg-zinc-800'
														: ''}"
													role="button"
													tabindex="0"
													onclick={() => selectRecipient(recipient)}
													onkeydown={(e) => {
														if (e.key === 'Enter' || e.key === ' ') selectRecipient(recipient);
													}}
												>
													<!-- <img
														src={recipient.avatar}
														alt={recipient.username}
														class="mr-3 h-6 w-6 rounded-full"
													/> -->
													<div class="mr-3 h-6 w-6 rounded-full bg-zinc-950">
														<img
															src="https://cdn.discordapp.com/avatars/{recipient.user.id}/{recipient
																.user.avatar}.webp?size=32"
															alt={recipient.nick ||
																recipient.user.global_name ||
																recipient.user.username}
															class="h-6 w-6 rounded-full"
														/>
													</div>
													<span class="text-gray-200"
														>{recipient.nick ||
															recipient.user.global_name ||
															recipient.user.username}</span
													>
												</div>
											{/each}
										</div>
									{/if}
								</div>
								<p class="text-sm text-gray-400">Choose the recipient for this order.</p>
							</div>

							<!-- Amount input with USD prefix -->
							<div class="flex flex-col space-y-2">
								<label for="amount" class="text-gray-200">Amount (USD)</label>
								<div
									class="flex items-center border border-gray-700 bg-black p-2 focus-within:ring-2 focus-within:ring-blue-600"
								>
									<span class="mr-2 text-gray-400">$</span>
									<input
										type="text"
										id="amount"
										name="amount"
										min="0"
										max="1000"
										maxlength="7"
										autocomplete="off"
										class="flex-grow border-none bg-black text-gray-200 outline-none [appearance:textfield] focus:!ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
										bind:value={orderData.amount}
										oninput={validateInput}
										pattern="\d+"
									/>
								</div>
								<p class="text-sm text-gray-400">Specify the amount in USD.</p>
							</div>

							<!-- Email input -->
							<div class="flex flex-col space-y-2">
								<label for="email" class="text-gray-200">Email</label>
								<input
									type="email"
									id="email"
									name="email"
									class="input border-gray-700 bg-black text-gray-200"
									bind:value={orderData.email}
								/>
								<p class="text-sm text-gray-400">Enter your email for updates on your order.</p>
							</div>

							<!-- Message field -->
							<div class="flex flex-col space-y-2">
								<label for="message" class="text-gray-200">Message</label>
								<textarea
									id="message"
									name="message"
									class="input border-gray-700 bg-black text-gray-200"
									bind:value={orderData.message}
								></textarea>
								<p class="text-sm text-gray-400">
									Optional: Leave a note for the gift recipient (maybe a product link or a thank
									you!).
								</p>
							</div>

							<!-- Submit button -->
							<div class="mt-4 flex gap-4">
								<a
									class="btn !w-fit !min-w-0 flex-shrink-0 bg-white !px-3 py-2 text-black transition-colors duration-200 hover:text-white hover:opacity-80 focus:outline-none"
									href="/"
								>
									<ChevronLeftIcon />
								</a>
								<button
									class="btn primary w-full flex-grow"
									disabled={isLoading}
									onclick={toPayment}
								>
									Continue to Payment
								</button>
							</div>
						</form>
					{/if}

					<!-- Step 2: Billing Form -->
					{#if step === 2 && !isLoading && pIntent}
						{@const transition = '600ms cubic-bezier(0.22, 1, 0.36, 1)'}
						<div class="grid grid-cols-1 grid-rows-1">
							<div
								class="col-start-1 row-start-1"
								id="whaaatttt"
								style="transform: scale({stripeFinishedLoading
									? 1
									: 0.95}); opacity: {stripeFinishedLoading
									? 1
									: 0}; filter: blur({stripeFinishedLoading
									? 0
									: 8}px); transition: transform {transition}, filter {transition}, opacity {transition};"
							>
								<div style="height: {stripeFinishedLoading ? 'fit' : '236px'}">
									<Elements
										bind:elements
										variables={{
											fontFamily: "'IBM Plex Sans', monospace",
											fontSizeSm: '14px',
											colorBackground: 'black',
											borderRadius: '0'
										}}
										rules={{
											'.Input': {
												border: '1px solid #374151'
											}
										}}
										theme="night"
										{stripe}
										clientSecret={pIntent.client_secret}
									>
										{#if elements}
											<PaymentElement options={{}} />
										{/if}
									</Elements>
								</div>
								<div class="mt-4 flex gap-4">
									<button
										type="button"
										class="btn !w-fit !min-w-0 flex-shrink-0 bg-white !px-3 py-2 text-black transition-colors duration-200 hover:text-white hover:opacity-80 focus:outline-none"
										onclick={goToPreviousStep}
									>
										<ChevronLeftIcon />
									</button>
									<button
										onclick={beginPayment}
										type="submit"
										class="btn primary flex-grow"
										disabled={isLoading}
									>
										Place Order
									</button>
								</div>
							</div>
							{#if !stripeFinishedLoading}
								<div
									class="col-start-1 row-start-1 flex h-full w-full items-center justify-center"
									out:blur={{
										blurMultiplier: 2,
										duration: 500,
										easing: quintOut,
										scale: {
											start: 1,
											end: 1.25
										}
									}}
								>
									<div class="h-16 w-16">
										<Spinner thickness={6} />
									</div>
								</div>
							{/if}
						</div>
					{/if}

					{#if step === 3 && !isLoading}
						<div class="px-4">
							<div class="w-full max-w-[512px] shadow-xl">
								<CircleCheck class="mx-auto mb-8 h-12 w-12" />
								<h1 class="mb-4 text-center text-3xl font-semibold text-white">Success!</h1>
								<p class="mb-6 w-full text-center text-gray-200">
									You just sent ${orderData.amount} to {selectedRecipient?.nick ||
										selectedRecipient?.user.global_name ||
										selectedRecipient?.user.username}! If you gave a product description or a meal
									or something similar to be bought for them, they'll send you an email with a
									picture and a thank you note.
								</p>
								<a class="btn primary w-full" href="/"> Back to Home </a>
							</div>
						</div>
					{/if}
				</div>
			{/key}
		</div>
	</div>
</div>
