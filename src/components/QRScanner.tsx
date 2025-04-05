import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onClose: () => void;
  onScan: (data: string) => void;
}

const QRScanner = ({ onClose, onScan }: QRScannerProps) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const qrCodeRegionId = "qr-reader";

    if (scannerRef.current) {
      const qr = new Html5Qrcode(qrCodeRegionId);
      html5QrCodeRef.current = qr;

      qr.start(
        { facingMode: "environment" }, // Use rear camera
        {
          fps: 10,
          qrbox: 250,
        },
        (decodedText) => {
          qr.stop(); // Stop scanning
          onScan(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors for now
        }
      );
    }

    return () => {
      html5QrCodeRef.current?.stop().then(() => {
        html5QrCodeRef.current?.clear();
      });
    };
  }, [onScan]);

  return (
    <div className="space-y-4">
      <div id="qr-reader" ref={scannerRef} style={{ width: "100%" }}></div>
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
    </div>
  );
};

export default QRScanner;
