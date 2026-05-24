"use client";

import { Eye, EyeOff, LucideIcon } from "lucide-react";
import React from "react";

interface FieldProps {
  field: {
    id: number;
    name: string;
    fieldName: string;
    type: string;
    icon: LucideIcon | null;
  };
  values?: Record<string, string>;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export default function FormField({
  field,
  values,
  onChange,
  error,
}: FieldProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const currentValues = values || {};

  // Compound Name Handling Section
  if (field.fieldName === "nameGroup") {
    return (
      <div className="flex flex-col mb-4 w-full">
        <label className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Full Legal Name
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            type="text"
            name="firstname"
            className="w-full bg-[#121212] border border-gray-800 focus:border-[#dabc17] rounded-md px-3 py-2 text-sm outline-none transition-all"
            required
            value={currentValues.firstname || ""}
            placeholder="First name"
            onChange={onChange}
          />
          <input
            type="text"
            name="middlename"
            className="w-full bg-[#121212] border border-gray-800 focus:border-[#dabc17] rounded-md px-3 py-2 text-sm outline-none transition-all"
            value={currentValues.middlename || ""}
            placeholder="Middle name (Optional)"
            onChange={onChange}
          />
          <input
            type="text"
            name="lastname"
            className="w-full bg-[#121212] border border-gray-800 focus:border-[#dabc17] rounded-md px-3 py-2 text-sm outline-none transition-all"
            required
            value={currentValues.lastname || ""}
            placeholder="Last name"
            onChange={onChange}
          />
        </div>
      </div>
    );
  }

  const isPasswordType = field.type === "password";

  return (
    <div className="flex flex-col mb-4 w-full">
      <label
        htmlFor={field.fieldName}
        className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400"
      >
        {field.name}
      </label>

      {/* Relative structural shell preserves icon boundaries */}
      <div className="relative flex items-center w-full">
        {field.icon && (
          <div className="absolute left-3 token-icon pointer-events-none z-10 text-gray-500">
            <field.icon size={18} />
          </div>
        )}

        <input
          type={isPasswordType && showPassword ? "text" : field.type}
          id={field.fieldName}
          name={field.fieldName}
          value={currentValues[field.fieldName] || ""}
          className={`w-full bg-[#121212] border ${error ? "border-red-500" : "border-gray-800 focus:border-[#dabc17]"} rounded-md py-2.5 pr-10 text-sm outline-none transition-all ${field.icon ? "pl-10" : "px-3"}`}
          required
          placeholder={`Enter your ${field.name.toLowerCase()}`}
          onChange={onChange}
        />

        {isPasswordType && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 hover:text-white text-gray-500 transition-colors"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
    </div>
  );
}

// "use client";

// import { Eye, EyeOff, LucideIcon } from "lucide-react";
// import React from "react";

// interface FieldProps {
//   field: {
//     id: number;
//     name: string;
//     type: string;
//     icon: LucideIcon | null;
//   };
//   values?: Record<string, string>;
//   onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
// }

// export default function FormField({ field, values, onChange }: FieldProps) {
//   const [showPassword, setShowPassword] = React.useState(false);

//   const togglePasswordVisibility = () => {
//     setShowPassword((prev) => !prev);
//   };

//   const currentValues = values || {};

//   if (field.name === "Name") {
//     return (
//       <div className="flex flex-col mb-4">
//         <label
//           htmlFor="firstname"
//           className="mb-1.5 text-sm font-medium text-gray-300"
//         >
//           {field.name}
//         </label>
//         <div className="flex gap-2">
//           <input
//             type="text"
//             id="firstname"
//             name="firstname"
//             className="form-input w-full border border-gray-800 rounded-md"
//             required
//             value={currentValues.firstname || ""}
//             placeholder="First name"
//             onChange={onChange}
//           />
//           <input
//             type="text"
//             id="middlename"
//             name="middlename"
//             className="form-input w-full border border-gray-800 rounded-md"
//             required
//             value={currentValues.middlename || ""}
//             placeholder="Middle name"
//             onChange={onChange}
//           />
//           <input
//             type="text"
//             id="lastname"
//             name="lastname"
//             className="form-input w-full border border-gray-800 rounded-md"
//             required
//             value={currentValues.lastname || ""}
//             placeholder="Last name"
//             onChange={onChange}
//           />
//         </div>
//       </div>
//     );
//   }

//   const fieldId = field.name
//     .toLowerCase()
//     .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());

//   if (field.name === "Password" || field.name === "Confirm Password") {
//     return (
//       <div className="flex flex-col mb-4">
//         <label
//           htmlFor={fieldId}
//           className="mb-1.5 text-sm font-medium text-gray-300"
//         >
//           {field.name}
//         </label>
//         <div className="flex items-center border border-gray-800 rounded-md mb-3">
//           {field.icon && <field.icon className=" text-gray-400 m-2" />}
//           <div className="relative w-full">
//             <input
//               type={showPassword ? "text" : "password"}
//               id={fieldId}
//               name={fieldId}
//               className={`form-input w-full ${field.icon ? "pl-10" : "px-3"}`}
//               required
//               value={currentValues[fieldId] || ""}
//               placeholder={`Enter your ${field.name.toLowerCase()}`}
//               onChange={onChange}
//             />
//             <button
//               type="button"
//               className="absolute right-3 top-1/2 transform -translate-y-1/2"
//               onClick={togglePasswordVisibility}
//             >
//               {showPassword ? (
//                 <Eye size={20} className="text-gray-400" />
//               ) : (
//                 <EyeOff size={20} className="text-gray-400" />
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col mb-4">
//       <label
//         htmlFor={fieldId}
//         className="mb-1.5 text-sm font-medium text-gray-300"
//       >
//         {field.name}
//       </label>
//       <div className="flex items-center border border-gray-800 rounded-md mb-3">
//         {field.icon && <field.icon className=" text-gray-400 m-2" />}
//         <input
//           type={field.type}
//           id={fieldId}
//           name={fieldId}
//           value={currentValues[fieldId] || ""}
//           className={`form-input w-full ${field.icon ? "pl-10" : "px-3"}`}
//           required
//           placeholder={`Enter your ${field.name.toLowerCase()}`}
//           onChange={onChange}
//         />
//       </div>
//     </div>
//   );
// }
