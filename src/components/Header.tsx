export default function Header() {
  return (
    <header className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold">
          PrintPilot Studio
        </h1>

        <p className="text-slate-400">
          Professional Thermal Printer Software
        </p>
      </div>

      <button className="bg-blue-600 hover:bg-blue-700 rounded-lg px-5 py-3">
        Scan Printer
      </button>
    </header>
  );
}