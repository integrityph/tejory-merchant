<script lang="ts">
	import { goto } from "$app/navigation";
	import "../app.css";
	import Loader from "./loader.svelte";
	import { BleClient } from '@capacitor-community/bluetooth-le';

	var dateOptions = {
		weekday: "short",
		year: "numeric",
		month: "short",
		day: "numeric",
	};
	var timeOptions = { hour12: true, hour: "2-digit", minute: "2-digit" };

	function onclick() {
		goto("Exchange");
	}


	async function connectToPrinter() {
    try {
      statusMessage = 'Initializing Bluetooth...';
      // 1. Initialize the Bluetooth client
      await BleClient.initialize();

      statusMessage = 'Please select a printer...';
      // 2. Request a device. This opens the phone's native UI
      // to scan for and select a Bluetooth device.
      statusMessage = 'Please select a printer...';
			const device = await BleClient.requestDevice({});

			// --- ADD THIS LINE ---
			console.log('Device selected:', device);

			if (!device) {
				statusMessage = 'No device selected.';
				return; // Exit the function if the user cancelled
			}

			statusMessage = `Connecting to ${device.name}...`;
			await BleClient.connect(device.deviceId);

      connectedDevice = device;
      statusMessage = `Connected to ${connectedDevice.name}!`;

    } catch (error) {
      // If anything goes wrong (e.g., user cancels, connection fails)
      // the error will be caught here.
      statusMessage = `Error: ${error.message}`;
      console.error('Bluetooth Connection Error', error);
			alert(error);
    }
  }

  async function printTestReceipt() {
    if (!connectedDevice) {
      statusMessage = 'No printer connected.';
      return;
    }

    try {
      statusMessage = 'Sending data to printer...';

      // --- This is where your ESC/POS expertise comes in ---
      // You need to find the correct service and characteristic UUIDs for your printer.
      // These are like addresses for the specific "print" functionality.
      // You often find these in the printer's technical manual.
      const PRINTER_SERVICE = '000018f0-0000-1000-8000-00805f9b34fb'; // Example UUID
      const PRINTER_CHARACTERISTIC = '00002af1-0000-1000-8000-00805f9b34fb'; // Example UUID

      // Create your ESC/POS commands.
      const encoder = new TextEncoder();
			const now = new Date();
			const paymentReference = "test-1234";
			const terminalName = localStorage.getItem("terminal_name");
			let sats = "1000";
			let amountCrypto =  parseInt(sats) / 100000000;
			let currency_type = localStorage.getItem("Currency").toUpperCase();
			let amountFiat = parseFloat("583.12");
      const commands = [
        '=============================\n',
        '       Payment Receipt\n',
				'=============================\n',
        '\n\n',
				'Payment Successful\n',
				`Date: ${now.toLocaleDateString("en-US", dateOptions)}\n`,
				`Time: ${now.toLocaleTimeString("en-US", timeOptions)}\n`,
				`Reference: ${paymentReference}\n`,
				`Terminal: ${terminalName}\n`,
				`=============================\n`,
				'\n\n',
				`Currency: Bitcoin\n`,
				`Network: Lightning\n`,
				`Amount (BTC): ${amountCrypto.toFixed(8)}\n`,
				`Amount (${currency_type}): ${amountFiat.toFixed(2)}\n`,
				'\n\n',
				'\n\n',
        // ESC/POS command to cut the paper (example)
        '\x1D\x56\x41\x00' 
      ].join('');

      const dataToSend = encoder.encode(commands);

      // 4. Write the data to the printer.
      await BleClient.write(
        connectedDevice.deviceId,
        PRINTER_SERVICE,
        PRINTER_CHARACTERISTIC,
        dataToSend
      );

			// const commands2 = [
				
			// ].join('');

			// const dataToSend2 = encoder.encode(commands2);

			// // 4. Write the data to the printer.
      // await BleClient.write(
      //   connectedDevice.deviceId,
      //   PRINTER_SERVICE,
      //   PRINTER_CHARACTERISTIC,
      //   dataToSend2
      // );
      
      statusMessage = 'Print command sent successfully!';

    } catch (error) {
      statusMessage = `Error: ${error.message}`;
      console.error('Bluetooth Write Error', error);
			alert(error);
    }

		BleClient.disconnect(connectedDevice.deviceId);
  }

	let connectedDevice = null;
  let statusMessage = 'Ready to connect to a printer.';
	async function printReceipt(){
		await connectToPrinter();
		await printTestReceipt();
		// disconnect();
	}
</script>

<main class="relative h-dvh w-full bg-neutral-400">
	<Loader />
	<div
		class="absoulte bg-x flex h-dvh w-full flex-col items-end justify-end p-5 md:h-dvh"
	>
		<button
			{onclick}
			type="button"
			class="mb-5 flex w-full items-center justify-center gap-5 rounded bg-neutral-700 px-4 py-3 text-white hover:bg-neutral-600"
		>
			<svg
				width="30px"
				height="30px"
				viewBox="0 0 32 32"
				xmlns="http://www.w3.org/2000/svg"
				fill="#000000"
				><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
					id="SVGRepo_tracerCarrier"
					stroke-linecap="round"
					stroke-linejoin="round"
				></g><g id="SVGRepo_iconCarrier">
					<g fill="none" fill-rule="evenodd">
						<circle cx="16" cy="16" r="16" fill="#F7931A"></circle>
						<path
							fill="#FFF"
							fill-rule="nonzero"
							d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"
						></path>
					</g>
				</g></svg
			>
			<p class="w-36">Bitcoin Lightning</p>
		</button>

		<button
			disabled
			{onclick}
			type="button"
			class=" flex w-full items-center justify-center gap-5 rounded bg-neutral-700 px-4 py-3 text-white blur-[0.8px] hover:bg-neutral-600"
		>
			<svg
				width="30px"
				height="30px"
				viewBox="0 0 32 32"
				xmlns="http://www.w3.org/2000/svg"
				fill="#000000"
				><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
					id="SVGRepo_tracerCarrier"
					stroke-linecap="round"
					stroke-linejoin="round"
				></g><g id="SVGRepo_iconCarrier">
					<g fill="none" fill-rule="evenodd">
						<circle cx="16" cy="16" r="16" fill="#627EEA"></circle>
						<g fill="#FFF" fill-rule="nonzero">
							<path
								fill-opacity=".602"
								d="M16.498 4v8.87l7.497 3.35z"
							></path>
							<path d="M16.498 4L9 16.22l7.498-3.35z"></path>
							<path
								fill-opacity=".602"
								d="M16.498 21.968v6.027L24 17.616z"
							></path>
							<path d="M16.498 27.995v-6.028L9 17.616z"></path>
							<path
								fill-opacity=".2"
								d="M16.498 20.573l7.497-4.353-7.497-3.348z"
							></path>
							<path
								fill-opacity=".602"
								d="M9 16.22l7.498 4.353v-7.701z"
							></path>
						</g>
					</g>
				</g></svg
			>
			<p class="w-36">Ethereum</p>
		</button>
		<!-- <button
			onclick={printReceipt}
			type="button"
			class="mb-5 flex w-full items-center justify-center gap-5 rounded bg-neutral-700 px-4 py-3 text-white hover:bg-neutral-600"
			>printReceipt</button> -->
	</div>
</main>
