import { useState } from "react";
import { ChevronDown } from "lucide-react";


const personalidades = [
  { label: "Médico Professor", icon: "🧑‍🤝‍🧑" },
  { label: "Médico especialista", icon: "📗" },
  { label: "Médico emergencista", icon: "🩺" },
  { label: "Médico estudante", icon: "🔗" },
  { label: "Soporte Tecnico de IAtros", icon: "💜" },
  { label: "Diretor de IAtros", icon: "😄" },
];


export default function PersonalidadesDropdown() {

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(personalidades[0]);

  return (
    <div className="flex flex-col items-center mt-4">
    <div className="relative">
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#fafafa] border text-gray-700 shadow-sm text-xs"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="mr-2 text-xs">
          {selected.icon} {selected.label}
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 bg-white border rounded-xl shadow-lg z-10">
          <ul className="py-2">
            {personalidades.map((p) => (
              <li
                key={p.label}
                className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-xs ${
                  selected.label === p.label ? "bg-gray-100 font-semibold" : ""
                }`}
                onClick={() => {
                  setSelected(p);
                  setOpen(false);
                }}
              >
                <span className="text-xs">{p.icon}</span>
                <span>{p.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
  );
}