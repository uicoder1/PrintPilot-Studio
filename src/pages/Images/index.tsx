import { useState } from "react";
import toast from "react-hot-toast";
import { invoke } from "@tauri-apps/api/core";
import { RotateCw, Minus, Plus, Printer as PrinterIcon } from "lucide-react";
import { useImage } from "../../hooks/useImage";
import { useApp } from "../../context/AppContext";

// This printer's vertical resolution (dots per inch), used to turn the
// rasterized image height back into a physical print length. Matches the
// printer profile this protocol was built against.
const PRINTER_DPI = 200;
const PRINTER_WIDTH_PX = 384;

export default function ImagesPage() {
  const {
    originalImage,
    workingImage,
    isThermal,
    fileName,
    fileSize,
    imgWidth,
    imgHeight,
    rotateDeg,
    rotateImage,
    qualityMode,
    setQualityMode,
    copies,
    setCopies,
    inputRef,
    pickImage,
    onSelectImage,
    removeImage,
    convertToThermal,
  } = useImage();

  const { connectedPrinterId, connectedPrinterName } = useApp();
  const [printing, setPrinting] = useState(false);

  const swapped = rotateDeg % 180 !== 0;
  const effWidth = swapped ? imgHeight : imgWidth;
  const effHeight = swapped ? imgWidth : imgHeight;
  const outputHeightPx =
    effWidth > 0 ? Math.round((PRINTER_WIDTH_PX * effHeight) / effWidth) : 0;
  const lengthCm = ((outputHeightPx / PRINTER_DPI) * 2.54).toFixed(1);

  const printImage = async () => {
    if (!isThermal) {
      toast.error("Convert the image first");
      return;
    }

    if (!connectedPrinterId) {
      toast.error("Connect a printer first");
      return;
    }

    setPrinting(true);

    try {
      toast.loading(
        copies > 1 ? `Printing ${copies} copies...` : "Printing image...",
        { id: "print" }
      );

      for (let i = 0; i < copies; i++) {
        await invoke("print_image", {
          id: connectedPrinterId,
          image: workingImage,
        });
      }

      toast.success(
        copies > 1 ? `${copies} copies printed` : "Image printed successfully",
        { id: "print" }
      );
    } catch (err) {
      console.error(err);
      toast.error(String(err), { id: "print" });
    } finally {
      setPrinting(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onSelectImage}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Image Printing</h1>
            <p className="mt-1 text-slate-400">
              Print photos with your Bluetooth thermal printer.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 text-right">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Printer Status
            </p>
            <p
              className={`mt-1 font-semibold ${
                connectedPrinterId ? "text-green-400" : "text-red-400"
              }`}
            >
              {connectedPrinterId ? "🟢 Connected" : "🔴 Not Connected"}
            </p>
            {connectedPrinterId && connectedPrinterName && (
              <p className="text-xs text-slate-500">{connectedPrinterName}</p>
            )}
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Preview */}
          <div className="col-span-8">
            <div className="flex flex-col items-center">
              <PrinterCanvas
                src={workingImage}
                rotateDeg={rotateDeg}
                onClick={pickImage}
              />

              {workingImage && (
                <div className="mt-5 flex items-center gap-6 text-slate-300">
                  <span className="text-sm">
                    Length:{" "}
                    <span className="font-semibold text-white">
                      {lengthCm} cm
                    </span>
                  </span>

                  <button
                    onClick={rotateImage}
                    title="Rotate 90°"
                    className="flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                  >
                    <RotateCw size={16} />
                    Rotate 90°
                  </button>
                </div>
              )}
            </div>

            {workingImage && (
              <div className="mt-6 rounded-xl bg-slate-800 px-6 py-4">
  <div className="grid grid-cols-3 gap-8">
    <div>
      <p className="text-xs uppercase tracking-wider text-slate-500">
        File Name
      </p>
      <p className="mt-2 truncate text-base text-white">
        {fileName}
      </p>
    </div>

    <div>
      <p className="text-xs uppercase tracking-wider text-slate-500">
        Size
      </p>
      <p className="mt-2 text-base text-white">
        {fileSize}
      </p>
    </div>

    <div>
      <p className="text-xs uppercase tracking-wider text-slate-500">
        Resolution
      </p>
      <p className="mt-2 text-base text-white">
        {imgWidth} × {imgHeight}
      </p>
    </div>
  </div>
</div>
            )}
          </div>

          {/* Right Control Panel */}
          <div className="col-span-4 flex flex-col rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div>
              <h2 className="text-xl font-bold text-white">Image Controls</h2>
              <p className="mt-1 text-sm text-slate-400">
                Configure your print settings
              </p>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Printer</span>
                <span className="font-medium text-white">
                  {connectedPrinterId ? "Connected" : "Not Connected"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Paper Width</span>
                <span className="text-white">57 mm</span>
              </div>

              {/* Quality mode - functional, drives the actual dithering
                  algorithm used in the browser conversion step. */}
              <div>
                <span className="text-slate-400">Quality</span>
                <div className="mt-3 space-y-2">
                  <QualityOption
                    label="High speed"
                    description="Plain threshold, faster, crisper lines"
                    checked={qualityMode === "speed"}
                    onSelect={() => setQualityMode("speed")}
                  />
                  <QualityOption
                    label="High definition"
                    description="Dithered, better for photos/gradients"
                    checked={qualityMode === "hd"}
                    onSelect={() => setQualityMode("hd")}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={pickImage}
                className="h-12 w-full rounded-xl bg-sky-600 font-semibold text-white transition hover:bg-sky-500"
              >
                📁 Choose Image
              </button>

              <button
                onClick={convertToThermal}
                disabled={!workingImage}
                className="h-12 w-full rounded-xl bg-slate-800 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ⚡ Convert to Thermal
              </button>

              <button
                onClick={removeImage}
                disabled={!workingImage}
                className="h-12 w-full rounded-xl bg-red-600 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                🗑 Remove Image
              </button>
            </div>

            {/* Bottom summary + print bar, styled after Tiny Print's
                depth/copies/print row. Copies is real (loops the actual
                print call); mode reflects the real quality setting above. */}
            <div className="mt-auto pt-6">
              <div className="flex items-center justify-between rounded-2xl bg-slate-800 px-4 py-3">
                <div className="text-sm text-slate-400">
                  Image ・{" "}
                  {qualityMode === "hd" ? "High definition" : "High speed"} ・{" "}
                  <span className="inline-flex items-center gap-2 align-middle">
                    <button
                      onClick={() => setCopies(Math.max(1, copies - 1))}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-white hover:bg-slate-600"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-white">
                      {copies}
                    </span>
                    <button
                      onClick={() => setCopies(Math.min(20, copies + 1))}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-white hover:bg-slate-600"
                    >
                      <Plus size={12} />
                    </button>
                  </span>{" "}
                  {copies === 1 ? "copy" : "copies"}
                </div>

                <button
                  onClick={printImage}
                  disabled={!isThermal || !connectedPrinterId || printing}
                  className="flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-5 font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <PrinterIcon size={16} />
                  {printing ? "Printing..." : "Print"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PrinterCanvas({
  src,
  rotateDeg,
  onClick,
}: {
  src: string | null;
  rotateDeg: number;
  onClick: () => void;
}) {
  // 57mm paper preview
  const paperWidth = 340;
  const paperHeight = 420;

  return (
    <div className="flex flex-col items-center">

      {/* Top Tear */}
      <div
        style={{
          width: paperWidth,
          height: 12,
          background:
            "repeating-linear-gradient(-45deg,#d7d7d7 0 6px,#ffffff 6px 12px)",
        }}
      />

      {/* Paper */}
      <div
        onClick={onClick}
        className="cursor-pointer bg-white shadow-2xl"
        style={{
          width: paperWidth,
          height: paperHeight,
          overflow: "hidden",
          borderLeft: "1px solid #ddd",
          borderRight: "1px solid #ddd",
        }}
      >
        {src ? (
          <img
            src={src}
            alt="Print Preview"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              objectFit: "unset",
              
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#999",
              fontSize: 15,
            }}
          >
            Click to choose image
          </div>
        )}
      </div>

      {/* Bottom Tear */}
      <div
        style={{
          width: paperWidth,
          height: 12,
          background:
            "repeating-linear-gradient(45deg,#d7d7d7 0 6px,#ffffff 6px 12px)",
        }}
      />
    </div>
  );
}

function QualityOption({
  label,
  description,
  checked,
  onSelect,
}: {
  label: string;
  description: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="flex w-full items-start gap-3 rounded-xl bg-slate-900/60 px-3 py-2 text-left transition hover:bg-slate-900"
    >
      <span
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition ${
          checked
            ? "border-teal-400 bg-teal-400 text-slate-900"
            : "border-slate-600 bg-transparent"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M6.5 11.5 3 8l1.06-1.06L6.5 9.38l5.44-5.44L13 5l-6.5 6.5Z" />
          </svg>
        )}
      </span>

      <span>
        <span className="block text-sm font-medium text-white">
          {label}
        </span>

        <span className="block text-xs text-slate-500">
          {description}
        </span>
      </span>
    </button>
  );
}