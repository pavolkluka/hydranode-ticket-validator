const videoElement = document.getElementById("qr-video");
const startScanButton = document.getElementById("start-scan");
const stopScanButton = document.getElementById("stop-scan");

let scanner = new ZXing.BrowserQRCodeReader();
let scanning = false;

startScanButton.addEventListener("click", () => {
    scanning = true;
    scanner.decodeOnceFromVideoDevice(undefined, videoElement)
        .then((scanResult) => {
            if (scanning) {
                handleScannedCode(scanResult.text);
            }
        })
        .catch(err => console.error(err));
});

stopScanButton.addEventListener("click", () => {
    scanning = false;
    scanner.reset();
});