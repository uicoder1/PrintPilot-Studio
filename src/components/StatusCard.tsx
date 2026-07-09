export default function StatusCard() {
  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">
        Printer Status
      </h2>

      <p className="text-red-400 mb-6">
        ● Disconnected
      </p>

      <button className="bg-green-600 hover:bg-green-700 rounded-lg px-5 py-3">
        Scan for Printer
      </button>
    </div>
  );
}