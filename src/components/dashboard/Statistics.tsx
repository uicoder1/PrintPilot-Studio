import {
  Printer,
  FileText,
  Image,
  TrendingUp,
} from "lucide-react";

export default function Statistics() {
  const stats = [
    {
      title: "Total Prints",
      value: "248",
      icon: Printer,
      color: "text-sky-400",
    },
    {
      title: "Documents",
      value: "96",
      icon: FileText,
      color: "text-green-400",
    },
    {
      title: "Images",
      value: "152",
      icon: Image,
      color: "text-purple-400",
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

      <div className="flex items-center justify-between">

        <h2 className="text-xl font-bold text-white">
          Statistics
        </h2>

        <TrendingUp className="text-green-400" size={22} />

      </div>

      <div className="mt-6 space-y-4">

        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-center justify-between rounded-2xl bg-slate-800 p-4"
            >
              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700">
                  <Icon className={item.color} size={22} />
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    {item.title}
                  </p>

                  <h3 className="text-lg font-semibold text-white">
                    {item.value}
                  </h3>
                </div>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}