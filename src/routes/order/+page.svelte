<script lang="ts">
	import PyroLogo from '$lib/components/PyroLogo.svelte';
	import PyroToast from '$lib/components/PyroToast.svelte';
	import { onMount } from 'svelte';
	import type { EasingFunction, TransitionConfig } from 'svelte/transition';

	import { quintOut } from 'svelte/easing';
	import { ChevronDownIcon } from 'lucide-svelte';

	let isLoading = $state(false);
	let loadingTitle = $state('Working on it!');
	let loadingMessage = $state('Processing your order, please wait.');
	let toastTitle = $state('');
	let toastMessage = $state('');
	let toastType = $state('error');
	let isToastShown = $state(false);
	let isDropdownOpen = $state(false);
	let step = $state(1);
	let orderData = $state({
		amount: 0,
		email: '',
		message: ''
	});

	const recipients = [
		{ name: 'Sticks', profilePic: 'https://img.sticks.ovh/floppa' },
		{ name: 'Team Pyro', profilePic: '/teamPyro.png' }
	];
	let selectedRecipient = $state(recipients[0]);

	function selectRecipient(recipient: (typeof recipients)[0]) {
		selectedRecipient = recipient;
		isDropdownOpen = false;
	}

	function toPayment() {
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

		step = 2;
	}

	function goToPreviousStep() {
		step = 1;
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

	const remap = (value: number, low1: number, high1: number, low2: number, high2: number) =>
		low2 + ((value - low1) * (high2 - low2)) / (high1 - low1);

	const blur = (
		node: HTMLElement,
		config:
			| Partial<{
					blurMultiplier: number;
					duration: number;
					easing: EasingFunction;
			  }>
			| undefined
	): TransitionConfig => {
		return {
			duration: config?.duration || 300,
			css: (t, u) =>
				`filter: blur(${(1 - t) * (config?.blurMultiplier || 1)}px); opacity: ${t}; transform: scale(${remap(
					t,
					0,
					1,
					0.95,
					1
				)}; transform-origin: top center;`,
			easing: config?.easing
		};
	};

	function validateInput(e: Event) {
		const target = e.target as HTMLInputElement;
		if (orderData.amount < 0) {
			orderData.amount = 0;
		}
		if (orderData.amount > 1000) {
			orderData.amount = 1000;
		}
	}
</script>

<!-- Centered responsive form for ordering -->
<div class="flex h-screen items-center justify-center px-4">
	<PyroToast
		bind:shown={isToastShown}
		title={toastTitle}
		message={toastMessage}
		duration={5000}
		position="top-right"
		type={toastType}
	/>
	<div class="w-full max-w-md p-8 shadow-xl">
		<PyroLogo style="mx-auto mb-6 h-16 w-16" />
		{#if step === 1 && !isLoading}
			<h1 class="mb-4 text-center text-3xl font-semibold text-white">Order Meal</h1>
			<p class="mx-auto mb-6 max-w-sm text-center text-gray-200">
				Select your order details below to gift a meal to our team members.
			</p>
		{/if}
		{#if step === 2 && !isLoading}
			<h1 class="mb-4 text-center text-3xl font-semibold text-white">Pay for Order</h1>
			<p class="mx-auto mb-6 max-w-sm text-center text-gray-200">
				Enter your payment details below to complete your order. Payments our securely processed by
				Stripe.
			</p>
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
			<form class="flex flex-col space-y-4">
				<!-- Custom Recipient dropdown -->
				<div class="relative flex flex-col space-y-2">
					<label for="recipient" class="text-gray-200">Recipient</label>
					<div class="relative">
						<button
							type="button"
							class="dropdown-button flex w-full cursor-pointer items-center border border-gray-700 bg-black p-2 text-gray-200"
							onclick={() => (isDropdownOpen = !isDropdownOpen)}
						>
							{#if selectedRecipient}
								<img
									src={selectedRecipient.profilePic}
									alt={selectedRecipient.name}
									class="mr-2 h-6 w-6 rounded-full"
								/>
								<span>{selectedRecipient.name}</span>
							{:else}
								<span>Select a recipient</span>
							{/if}
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
								class="dropdown-menu absolute z-10 mt-2 w-full bg-zinc-800 shadow-lg"
							>
								{#each recipients as recipient}
									<div
										class="flex cursor-pointer items-center p-2 hover:bg-zinc-700"
										role="button"
										tabindex="0"
										onclick={() => selectRecipient(recipient)}
										onkeydown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') selectRecipient(recipient);
										}}
									>
										<img
											src={recipient.profilePic}
											alt={recipient.name}
											class="mr-2 h-6 w-6 rounded-full"
										/>
										<span class="text-gray-200">{recipient.name}</span>
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
							type="number"
							id="amount"
							name="amount"
							min="0"
							max="1000"
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
					<p class="text-sm text-gray-400">Optional: Leave a note for the gift recipient.</p>
				</div>

				<!-- Submit button -->
				<div class="mt-4">
					<button
						class="w-full bg-white py-2 text-black transition-colors duration-200 hover:text-white hover:opacity-80 focus:outline-none"
						disabled={isLoading}
						onclick={toPayment}
					>
						Continue to Payment
					</button>
				</div>
			</form>
		{/if}

		<!-- Step 2: Billing Form -->
		{#if step === 2 && !isLoading}
			<form class="flex flex-col space-y-4">
				<!-- Card number input -->
				<div class="flex flex-col space-y-2">
					<label for="cardNumber" class="text-gray-200">Card Number</label>
					<input
						type="text"
						id="cardNumber"
						name="cardNumber"
						class="w-full rounded-md border border-gray-700 bg-black p-2 text-gray-200"
						placeholder="1234 5678 9123 4567"
						maxlength="19"
					/>
				</div>

				<!-- Expiry date and CVV -->
				<div class="flex space-x-4">
					<div class="flex w-1/2 flex-col space-y-2">
						<label for="expiryDate" class="text-gray-200">Expiry Date</label>
						<input
							type="text"
							id="expiryDate"
							name="expiryDate"
							class="w-full rounded-md border border-gray-700 bg-black p-2 text-gray-200"
							placeholder="MM / YY"
							maxlength="5"
						/>
					</div>
					<div class="flex w-1/2 flex-col space-y-2">
						<label for="cvv" class="text-gray-200">CVV</label>
						<input
							type="text"
							id="cvv"
							name="cvv"
							class="w-full rounded-md border border-gray-700 bg-black p-2 text-gray-200"
							placeholder="123"
							maxlength="3"
						/>
					</div>
				</div>

				<!-- Back and Submit buttons -->
				<div class="flex justify-between">
					<button
						type="button"
						class="btn bg-white py-2 text-black transition-colors duration-200 hover:text-white hover:opacity-80 focus:outline-none"
						onclick={goToPreviousStep}
					>
						Back
					</button>
					<button
						type="submit"
						class="btn bg-white py-2 text-black transition-colors duration-200 hover:text-white hover:opacity-80 focus:outline-none"
						disabled={isLoading}
					>
						Place Order
					</button>
				</div>
			</form>
		{/if}

		{#if step === 3 && !isLoading}
			<div class="max-w-md p-10 shadow-xl">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="mx-auto mb-2 size-12 text-white"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
					/>
				</svg>

				<h1 class="mb-4 text-3xl font-semibold text-white">Great Success!</h1>
				<p class="mb-6 max-w-sm text-gray-200">
					Thank you for your support! We'll share updates as they are come. You rock :)
				</p>
			</div>
		{/if}
	</div>
</div>
