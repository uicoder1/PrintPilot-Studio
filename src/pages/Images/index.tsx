import toast from "react-hot-toast";
import { useImage } from "../../hooks/useImage";
import { invoke } from "@tauri-apps/api/core";
import { useApp } from "../../context/AppContext";

export default function ImagesPage() {
  const {
  image,
  thermalImage,
  fileName,
  fileSize,
  resolution,
  inputRef,
  pickImage,
  onSelectImage,
  removeImage,
  convertToThermal,
} = useImage();

const { connectedPrinterId } = useApp();
const printImage = async () => {
  if (!thermalImage) {
    toast.error("Convert the image first");
    return;
  }

  if (!connectedPrinterId) {
    toast.error("Connect a printer first");
    return;
  }

  try {
  toast.loading("Printing image...", {
    id: "print",
  });

  await invoke("print_image", {
    id: connectedPrinterId,
    image: thermalImage,
  });

  toast.success("Image printed successfully", {
    id: "print",
  });
} catch (err) {
  console.error(err);

  toast.error(String(err), {
    id: "print",
  });
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

      <div>
        <h1 className="text-3xl font-bold text-white">
          Image Printing
        </h1>

        <p className="text-slate-400 mt-1">
          Select an image and print it.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6">

        <div className="col-span-3 rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <div
            className="flex h-[550px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 transition hover:border-sky-500 hover:bg-slate-800/40"
            onClick={pickImage}
          >

            {image ? (
              <img
              src={thermalImage || image}
              alt="Preview"
              className="max-h-full max-w-full rounded-xl object-contain"
            />
            ) : (
              <div className="text-center">

               <div className="text-6xl mb-4">
                🖼️
              </div>

              <h2 className="text-2xl font-semibold text-white">
                Drop Image Here
              </h2>

              <p className="mt-2 text-slate-400">
                Click anywhere to choose an image
              </p>

              <p className="mt-1 text-sm text-slate-500">
                PNG • JPG • JPEG • WEBP
              </p>

            </div>
            )}

          </div>

          {image && (
  <div className="mt-4 rounded-2xl bg-slate-800 p-4 space-y-3">

    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">
        File Name
      </p>

      <p className="mt-1 truncate text-white font-medium">
        {fileName}
      </p>
    </div>

    <div className="grid grid-cols-3 gap-4">

  <div>
    <p className="text-xs uppercase tracking-wide text-slate-500">
      Size
    </p>

    <p className="text-white">
      {fileSize}
    </p>
  </div>

  <div>
    <p className="text-xs uppercase tracking-wide text-slate-500">
      Resolution
    </p>

    <p className="text-white">
      {resolution}
    </p>
  </div>

  <div>
    <p className="text-xs uppercase tracking-wide text-slate-500">
      Status
    </p>

    <p className="text-green-400 font-medium">
      Ready
    </p>
  </div>

</div>

  </div>
)}

        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <button
            onClick={pickImage}
            className="w-full rounded-xl bg-sky-600 py-3 font-semibold text-white hover:bg-sky-500"
          >
            Choose Image
          </button>

          <button
            onClick={convertToThermal}
            disabled={!image}
            className="mt-4 w-full rounded-xl bg-slate-800 py-3 text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Convert to Thermal
          </button>

          <button
            onClick={printImage}
            disabled={!thermalImage || !connectedPrinterId}
            className="mt-4 w-full rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Print
          </button>

          <button
            onClick={removeImage}
            className="mt-4 w-full rounded-xl bg-red-600 py-3 text-white hover:bg-red-500"
          >
            Remove
          </button>

        </div>

      </div>

    </div>
  </>
);
}