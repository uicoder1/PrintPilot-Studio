const menuItems = [
  "🏠 Home",
  "🖨 Printer",
  "📝 Notes",
  "🖼 Images",
  "🏷 Labels",
  "🔲 QR Code",
  "⚙ Settings",
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 p-6">
      <h2 className="text-xl font-bold mb-8">PrintPilot</h2>

      <nav className="space-y-3">
        {menuItems.map((item) => (
          <button
            key={item}
            className="w-full text-left rounded-lg px-4 py-3 hover:bg-slate-800 transition"
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}