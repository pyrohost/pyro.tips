<script lang="ts">
	let isLoading = $state(false);
	let isDropdownOpen = $state(false);
	let step = $state(1);

	const recipients = [
		{ name: 'Sticks', profilePic: 'https://img.sticks.ovh/floppa' },
		{ name: 'Team Pryo', profilePic: '/teamPyro.png' }
	];
	let selectedRecipient = $state(recipients[0]);

	function selectRecipient(recipient: (typeof recipients)[0]) {
		selectedRecipient = recipient;
		isDropdownOpen = false;
	}

	function goToPreviousStep() {
		step -= 1;
	}
</script>

<!-- Centered responsive form for ordering -->
<div class="flex h-screen items-center justify-center px-4">
	<div class="w-full max-w-md bg-zinc-900 p-8 shadow-xl">
		<svg
			class="mx-auto mb-2 size-12"
			width="512"
			height="512"
			viewBox="0 0 512 512"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M214.015 391.852C214.015 384.205 214.015 380.38 214.655 377.201C217.286 364.142 227.626 353.935 240.852 351.338C244.074 350.705 247.947 350.705 255.694 350.705C263.441 350.705 267.314 350.705 270.534 351.338C283.762 353.935 294.102 364.142 296.732 377.201C297.373 380.38 297.373 384.205 297.373 391.852V405.568C297.373 415.822 297.373 420.95 295.139 424.769C293.676 427.272 291.571 429.349 289.037 430.794C285.168 432.999 279.975 432.999 269.586 432.999H241.801C231.413 432.999 226.219 432.999 222.351 430.794C219.816 429.349 217.712 427.272 216.248 424.769C214.015 420.95 214.015 415.822 214.015 405.568V391.852Z"
				fill="white"
			/>
			<path
				d="M151.57 432.999H180.132C183.366 432.999 184.983 432.999 185.817 431.984C186.651 430.97 186.302 429.333 185.603 426.06C158.099 297.217 285.284 326.182 303.698 237.038C313.096 191.542 286.344 130.476 287.924 88.0451C288.121 82.7268 288.22 80.0677 286.764 79.2435C285.307 78.4193 283.203 79.7417 278.995 82.3863C219.545 119.744 176.221 191.157 192.054 234.972C194.475 241.671 195.685 245.019 194.154 246.242C192.624 247.466 190.034 245.888 184.854 242.735C176.431 237.609 166.422 229.215 159.463 215.99C157.422 212.11 156.401 210.17 154.903 210.024C153.405 209.877 152.119 211.459 149.545 214.621C74.7421 306.535 105.055 398.323 148.258 431.894C148.948 432.429 149.292 432.698 149.734 432.849C150.176 432.999 150.641 432.999 151.57 432.999Z"
				fill="white"
			/>
			<path
				d="M337.915 224.025C341.744 266.252 316.007 295.136 286.61 315.144C281.477 318.637 278.911 320.384 279.133 322.047C279.355 323.711 282.422 324.789 288.556 326.944C327.753 340.716 329.534 380.192 326.288 427.099C326.097 429.872 326 431.259 326.825 432.129C327.648 433 329.049 433 331.849 433H356.333C357.075 433 357.446 433 357.805 432.903C358.165 432.806 358.483 432.621 359.12 432.25C446.892 381.14 399.768 259.05 346.221 218.749C342.318 215.811 340.366 214.343 338.779 215.207C337.194 216.072 337.434 218.723 337.915 224.025Z"
				fill="white"
			/>
		</svg>
		<h1 class="mb-4 text-center text-3xl font-semibold text-white">Order Meal</h1>
		<p class="mx-auto mb-6 max-w-sm text-center text-gray-200">
			Select your order details below to gift a meal to our team members.
		</p>

		{#if step === 1}
			<form class="flex flex-col space-y-4">
				<!-- Custom Recipient dropdown -->
				<div class="relative flex flex-col space-y-2">
					<label for="recipient" class="text-gray-200">Recipient</label>
					<div class="relative">
						<button
							type="button"
							class="flex w-full cursor-pointer items-center border border-gray-700 bg-black p-2 text-gray-200"
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
							<span class="ml-auto text-gray-400">&#x25BC;</span>
						</button>

						{#if isDropdownOpen}
							<div class="absolute z-10 mt-2 w-full bg-zinc-800 shadow-lg">
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
					<div class="flex items-center border border-gray-700 bg-black p-2">
						<span class="mr-2 text-gray-400">$</span>
						<input
							type="number"
							id="amount"
							name="amount"
							class="flex-grow border-none bg-black text-gray-200 outline-none"
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
					/>
					<p class="text-sm text-gray-400">Enter your email for updates on your order.</p>
				</div>

				<!-- Message field -->
				<div class="flex flex-col space-y-2">
					<label for="message" class="text-gray-200">Message</label>
					<textarea id="message" name="message" class="input border-gray-700 bg-black text-gray-200"
					></textarea>
					<p class="text-sm text-gray-400">Optional: Leave a note for the gift recipient.</p>
				</div>

				<!-- Submit button -->
				<div class="mt-4">
					<button
						class="w-full bg-white py-2 text-black transition-colors duration-200 hover:text-white hover:opacity-80 focus:outline-none"
						disabled={isLoading}
						onclick={() => (step += 1)}
					>
						{isLoading ? 'Loading...' : 'Submit'}
					</button>
				</div>
			</form>
		{/if}

		<!-- Step 2: Billing Form -->
		{#if step === 2}
			<form class="flex flex-col space-y-4">
				<h2 class="text-center text-xl font-semibold text-white">Billing Information</h2>
				<p class="text-center text-gray-200">
					Enter your payment details below to complete your order. We accept any card stripe
					supports.
				</p>

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
						{isLoading ? 'Loading...' : 'Place Order'}
					</button>
				</div>
			</form>
		{/if}
	</div>
</div>
