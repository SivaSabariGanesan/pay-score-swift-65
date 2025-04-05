
// QRScanner.tsx
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface QRScannerProps {
  onClose: () => void;
  onScan: (data: string) => void;
}

const QRScanner = ({ onClose, onScan }: QRScannerProps) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isCameraPermissionDenied, setCameraPermissionDenied] = useState(false);

  useEffect(() => {
    const qrCodeRegionId = "qr-reader";
    let isUnmounted = false;

    if (scannerRef.current) {
      const qr = new Html5Qrcode(qrCodeRegionId);
      html5QrCodeRef.current = qr;

      qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (isUnmounted) return;
          
          // Stop scanning on successful scan
          qr.stop().then(() => {
            if (!isUnmounted) {
              onScan(decodedText);
            }
          });
        },
        (errorMessage) => {
          console.log("QR Scanner error:", errorMessage);
          
          // Only handle permission errors, ignore scanning errors
          if (
            errorMessage.indexOf("Permission denied") >= 0 ||
            errorMessage.indexOf("NotAllowedError") >= 0
          ) {
            setCameraPermissionDenied(true);
            setHasError(true);
          }
        }
      ).catch((err) => {
        console.error("Failed to start scanner:", err);
        setHasError(true);
        
        if (
          err.toString().indexOf("Permission denied") >= 0 ||
          err.toString().indexOf("NotAllowedError") >= 0
        ) {
          setCameraPermissionDenied(true);
        }
      });
    }

    return () => {
      isUnmounted = true;
      html5QrCodeRef.current?.stop().then(() => {
        html5QrCodeRef.current?.clear();
      }).catch(err => console.error("Error stopping scanner:", err));
    };
  }, [onScan]);

  if (hasError) {
    return (
      <div className="text-center space-y-4 p-6 border rounded-lg">
        <div className="text-xl font-semibold text-red-500">
          {isCameraPermissionDenied 
            ? "Camera access denied" 
            : "Failed to start QR scanner"}
        </div>
        <p className="text-muted-foreground">
          {isCameraPermissionDenied 
            ? "Please allow camera access to scan QR codes." 
            : "There was a problem starting the QR scanner."}
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-square max-w-full border rounded-lg overflow-hidden shadow-sm">
        <div id="qr-reader" ref={scannerRef} style={{ width: "100%", height: "100%" }}></div>
      </div>
      <Button variant="outline" onClick={onClose} className="w-full">
        Cancel
      </Button>
    </div>
  );
};

export default QRScanner;
