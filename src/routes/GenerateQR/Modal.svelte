<!-- src/components/Modal.svelte -->
<script>
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { BleClient } from '@capacitor-community/bluetooth-le';
	
	let {
		isOpen,
		message,
		status,
		amountCrypto,
		cryptoSymbol,
		amountFiat,
		fiatSymbol,
		paymentReference,
	} = $props();
	let now = new Date();
	var dateOptions = {
		weekday: "short",
		year: "numeric",
		month: "short",
		day: "numeric",
	};
	var timeOptions = { hour12: true, hour: "2-digit", minute: "2-digit" };
	let terminalName = $state();
	let currency_type = $state();

	onMount(() => {
		terminalName = localStorage.getItem("terminal_name");
		currency_type = localStorage.getItem("Currency").toUpperCase();
	});

	function closeModal() {
		isOpen = false;
		goto("/");
	}

	async function connectToPrinter() {
    try {
      statusMessage = 'Initializing Bluetooth...';
      // 1. Initialize the Bluetooth client
      await BleClient.initialize();

      statusMessage = 'Please select a printer...';
      // 2. Request a device. This opens the phone's native UI
      // to scan for and select a Bluetooth device.
      const device = await BleClient.requestDevice({
        // You can add services here to filter for printers,
        // but for now, we'll leave it open.
        services: [], 
      });

      statusMessage = `Connecting to ${device.name}...`;
      // 3. Connect to the selected device.
      // The gatt server is the part of the device that provides services.
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
      const commands = [
        '=============================\n',
        '       Payment Receipt\n',
				'=============================\n',
        '\n\n',
				`Payment ${status ? "Successful" : "Failed"}\n`,
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
      
      statusMessage = 'Print command sent successfully!';

    } catch (error) {
      statusMessage = `Error: ${error.message}`;
      console.error('Bluetooth Write Error', error);
			alert(error);
    }
  }

  async function disconnect() {
    if (connectedDevice) {
      await BleClient.disconnect(connectedDevice.deviceId);
      connectedDevice = null;
      statusMessage = 'Disconnected.';
    }
  }

	let connectedDevice = null;
  let statusMessage = 'Ready to connect to a printer.';
	async function printReceipt(){
		await connectToPrinter();
		await printTestReceipt();
		disconnect();
	}
</script>

{#if isOpen}
	<div class="modal-overlay">
		<div class="modal-content">
			<h2
				class={status === "success" ? "text-green-500" : "text-red-500"}
			>
				{status === "success"
					? "Payment Successful!"
					: "Payment Failed"}
			</h2>
			<p>{message}</p>
			<div
				class="my-5 w-full overflow-hidden border-b-2 p-5 text-left"
				style="font-family:'Courier New', Courier, monospace; "
			>
				<div
					class="rtj relative rounded border-1 p-2"
					style="box-shadow: 3px 7px 9px 2px rgb(0 0 0 / 37%)"
				>
					=============================<br />
					&nbsp;&nbsp;&nbsp;Tejory Payment Receipt <br />
					=============================<br />
					<br />
					{status === "success"
					? "Payment Successful!"
					: "Payment Failed"}<br />
					Date: {now.toLocaleDateString("en-US", dateOptions)}<br />
					Time: {now.toLocaleTimeString("en-US", timeOptions)}<br />
					Reference: {paymentReference}<br />
					Terminal: {terminalName}<br />
					=============================<br />
					<br />
					<br />
					Currency: Bitcoin<br />
					Network: Lightning<br />
					Amount (BTC): {amountCrypto.toFixed(8)}<br />
					Amount ({currency_type}): {amountFiat.toFixed(2)}<br />
					<br />
					<br />
					<br />
				</div>
			</div>
			<button onclick={closeModal} class="close-btn">Close</button>
			<button onclick={printReceipt} class="close-btn" style="background:#44aa44">Print</button>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.modal-content {
		background: white;
		padding: 20px;
		border-radius: 10px;
		text-align: center;
		box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
	}
	.close-btn {
		margin-top: 10px;
		padding: 8px 15px;
		background: #333;
		color: white;
		border: none;
		cursor: pointer;
		border-radius: 5px;
	}
	.rtj {
		animation: print 5s linear;
	}
	@keyframes print {
		0% {
			transform: translateY(90%);
		}
		10% {
			transform: translateY(80%);
		}
		20% {
			transform: translateY(76%);
		}
		30% {
			transform: translateY(60%);
		}
		40% {
			transform: translateY(55%);
		}

		50% {
			transform: translateY(0%);
		}
	}
</style>
