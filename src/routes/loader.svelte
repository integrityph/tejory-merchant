<script>
	import { onMount } from "svelte";
	import QRCode from "qrcode-generator";

	let initialized = $state(false);
	let loading = $state(true);
	let tempToken = null;
	let qrCodeDataUrl = $state();
	let remoteToken = $state('');

  // Function to handle the token submission
  function handleLinkWithToken() {
    if (!remoteToken.trim()) return; // Simple validation
    
		let tokenParts = remoteToken.split(":");

		if (tokenParts.length != 3){
			console.log("tokenParts.length is not 3", tokenParts.length);
			return;
		}

    localStorage.setItem("pubkey", tokenParts[0]);
		localStorage.setItem("terminal_name", tokenParts[2]);
		localStorage.setItem("token", tokenParts[1]);
		initialized = true;
		setTimeout(() => {
			loading = false;
		}, 1000);
    
    // Clear input after submission
    remoteToken = '';
  }

	function buf2hex(buffer) {
		// buffer is an ArrayBuffer
		return [...new Uint8Array(buffer)]
			.map((x) => x.toString(16).padStart(2, "0"))
			.join("");
	}

	// Simulate a loading delay (remove this in actual use)
	onMount(() => {
		let pubkey = localStorage.getItem("pubkey");
		let token = localStorage.getItem("token");
		if (pubkey == null || token == null) {
			const qr = QRCode(0, "L"); // Type number 0 (auto) and error correction level 'L'
			tempToken = new Uint8Array(32);
			window.crypto.getRandomValues(tempToken);
			qr.addData("ff" + buf2hex(tempToken.buffer));
			console.log("ff" + buf2hex(tempToken.buffer));
			qr.make();
			qrCodeDataUrl = qr.createDataURL(12, 0); // Scale 8, margin 0

			let conn = new WebSocket(
				`wss://ln.tejory.io/streamevents?auth=ff${buf2hex(tempToken.buffer)}`,
			);
			conn.onclose = function (evt) {
				// if websocket fails, try to get the tx status from another API
			};
			conn.onmessage = function (evt) {
				var messages = evt.data.split("\n");
				for (var i = 0; i < messages.length; i++) {
					let obj = JSON.parse(messages[i]);
					if (
						obj["pubkey"] != undefined &&
						obj["terminal_name"] != undefined &&
						obj["token"] != undefined
					) {
						localStorage.setItem("pubkey", obj["pubkey"]);
						localStorage.setItem("terminal_name", obj["terminal_name"]);
						localStorage.setItem("token", obj["token"]);
						conn.close();
						initialized = true;
						setTimeout(() => {
							loading = false;
						}, 1000);
					}
				}
			};
		} else {
			initialized = true;
			setTimeout(() => {
				loading = false;
			}, 3000);
		}
	});
</script>

{#if loading}
	<div
		class="loader item-center absolute z-10 flex h-dvh w-full items-center justify-center bg-white"
		style="background-image:url(pattern.png);"
	>
		<div
			style="opacity:0.9"
			class="loader item-center absolute z-10 flex h-dvh w-full items-center justify-center bg-neutral-500"
		></div>
		<div
			style="background-image: linear-gradient(to bottom, rgba(255, 0, 0, 0), rgb(0 0 0));"
			class="loader item-center absolute z-10 flex h-dvh w-full items-center justify-center"
		>
			{#if initialized}
				<p class="blinks text-[70px] font-bold">TEJ</p>
				<div class="loads">
					<div class="spinner">
						<img src="loader.png" alt="" />
					</div>
				</div>

				<p class="blinks text-[70px] font-bold">RY</p>
			{:else}
				<div style="display: block" class="px-3">
					<h2 class="rounded bg-white p-2 text-center font-bold">
						Activate Your Terminal
					</h2>
					<div>
						{#if qrCodeDataUrl}
							<img
								src={qrCodeDataUrl}
								alt="QR Code"
								class="w-full rounded-md border-15 border-white shadow-2xl shadow-black"
							/>
						{/if}
					</div>
					<div class="my-4 rounded bg-[#ffffffa9] p-4 text-gray-800 shadow">
						<p class="text-sm font-semibold mb-2">To link via QR Code:</p>
						<ul class="list-inside list-disc space-y-1">
							<li>Go to "Settings" in Tejory Wallet</li>
							<li>Click "Link Terminal"</li>
							<li>Scan the QR code to activate this terminal</li>
						</ul>

						<div class="relative flex items-center my-2">
							<div class="flex-grow border-t border-gray-300"></div>
							<span class="flex-shrink mx-4 text-sm text-gray-500">OR</span>
							<div class="flex-grow border-t border-gray-300"></div>
						</div>

						<div>
							<label for="token-input" class="block text-sm font-semibold mb-2">
								Paste your initialization token here:
							</label>
							<div class="flex space-x-2">
								<input
									id="token-input"
									type="text"
									bind:value={remoteToken}
									placeholder="e.g., 021234..."
									class="flex-grow w-full rounded border border-gray-300 bg-white/80 p-2 font-mono focus:ring-blue-500 focus:border-blue-500"
								/>
								<button
									onclick={handleLinkWithToken}
									disabled={!remoteToken.trim()}
									class="px-4 py-2 font-semibold text-white bg-blue-600 rounded shadow hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
								>
									Link
								</button>
							</div>
						</div>
					</div>

					
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	@font-face {
		font-family: "Nexa";
		font-style: normal;
		font-weight: 300;
		src:
			local("Nexa"),
			url("https://fonts.cdnfonts.com/s/16221/NexaLight.woff") format("woff");
	}
	@font-face {
		font-family: "Nexa";
		font-style: normal;
		font-weight: 700;
		src:
			local("Nexa"),
			url("https://fonts.cdnfonts.com/s/16221/NexaBold.woff") format("woff");
	}

	* {
		font-family: "Nexa";
	}
	.loads {
		transform: translateY(-10px);
	}

	.spinner {
		background-image: url("/loader.png");
		width: 65px;
		height: 65px;
		animation: spin 8s linear infinite;
	}
	.blinks {
		animation: blink 2s;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	@keyframes blink {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>
