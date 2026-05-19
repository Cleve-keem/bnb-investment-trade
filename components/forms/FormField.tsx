// "use client";

// import { LucideIcon } from "lucide-react";

// export default function FormField({
//   field,
// }: {
//   field: { id: number; name: string; type: string; icon: LucideIcon };
// }) {
//   if (field.name === "Name") {
//     return (
//       <div>
//         <label
//           htmlFor={field.name.toLowerCase().replace(" ", "-")}
//           className="mb-1.5"
//         >
//           {field.name}
//         </label>
//         <div className="flex gap-2">
//           <input
//             type="text"
//             id="firstname"
//             name="firstname"
//             className="form-input"
//             required
//             placeholder="First name"
//           />
//           <input
//             type="text"
//             id="middlename"
//             name="middlename"
//             className="form-input"
//             required
//             placeholder="Middle name"
//           />
//           <input
//             type="text"
//             id="lastname"
//             name="lastname"
//             className="form-input"
//             required
//             placeholder="Last name"
//           />
//         </div>
//       </div>
//     );
//   }
//   return (
//     <div>
//       <label
//         htmlFor={field.name.toLowerCase().replace(" ", "-")}
//         className="mb-1.5"
//       >
//         {field.name}
//       </label>
//       <div className="flex">
//         <span className="block">
//           {field?.icon && (
//             <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//           )}
//         </span>
//         <input
//           type={field.type}
//           id={field.name.toLowerCase().replace(" ", "-")}
//           name={field.name.toLowerCase().replace(" ", "-")}
//           className="form-input"
//           required
//           placeholder={`Enter your ${field.name.toLowerCase().replace(" ", " ")}`}
//         />
//       </div>
//     </div>
//   );
// }

"use client";

import { LucideIcon } from "lucide-react";

// 1. Updated the type definition here to accept null or make it optional
interface FieldProps {
  field: {
    id: number;
    name: string;
    type: string;
    icon: LucideIcon | null; // Allows null explicitly
  };
}

export default function FormField({ field }: FieldProps) {
  if (field.name === "Name") {
    return (
      <div className="flex flex-col mb-4">
        <label
          htmlFor="firstname"
          className="mb-1.5 text-sm font-medium text-gray-300"
        >
          {field.name}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="firstname"
            name="firstname"
            className="form-input w-full border border-gray-800 rounded-md"
            required
            placeholder="First name"
          />
          <input
            type="text"
            id="middlename"
            name="middlename"
            className="form-input w-full border border-gray-800 rounded-md"
            required
            placeholder="Middle name"
          />
          <input
            type="text"
            id="lastname"
            name="lastname"
            className="form-input w-full border border-gray-800 rounded-md"
            required
            placeholder="Last name"
          />
        </div>
      </div>
    );
  }

  const fieldId = field.name.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col mb-4">
      <label
        htmlFor={fieldId}
        className="mb-1.5 text-sm font-medium text-gray-300"
      >
        {field.name}
      </label>
      <div className="flex items-center border border-gray-800 rounded-md mb-3">
        {field.icon && <field.icon className=" text-gray-400 m-2" />}
        <input
          type={field.type}
          id={fieldId}
          name={fieldId}
          className={`form-input w-full ${field.icon ? "pl-10" : "px-3"}`}
          required
          placeholder={`Enter your ${field.name.toLowerCase()}`}
        />
      </div>
    </div>
  );
}
