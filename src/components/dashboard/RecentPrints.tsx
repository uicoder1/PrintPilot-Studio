import {
  Image,
  FileText,
  Tag,
  Clock3,
} from "lucide-react";

const prints = [
  {
    name: "Invoice.pdf",
    type: "Document",
    time: "2 min ago",
    icon: FileText,
  },
  {
    name: "Product Label",
    type: "Label",
    time: "8 min ago",
    icon: Tag,
  },
  {
    name: "Vacation.jpg",
    type: "Image",
    time: "20 min ago",
    icon: Image,
  },
];

export default function RecentPrints() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

      <div className="flex items-center justify-between">

        <h2 className="text-xl font-bold text-white">
          Recent Prints
        </h2>

        <Clock3 className="text-slate-400" size={20} />

      </div>

      <div className="mt-6 space-y-4">

        {prints.map((print) => {
          const Icon = print.icon;

          return (
            <div
              key={print.name}
              className="flex items-center justify-between rounded-2xl bg-slate-800 p-4 hover:bg-slate-700 transition"
            >
              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/15">
                  <Icon className="text-sky-400" size={20} />
                </div>

                <div>

                  <h3 className="font-medium text-white">
                    {print.name}
                  </h3>

                  <p className="text-sm text-slate-400">
                    {print.type}
                  </p>

                </div>

              </div>

              <span className="text-sm text-slate-500">
                {print.time}
              </span>

            </div>
          );
        })}

      </div>

    </div>
  );
}