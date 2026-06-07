"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import FormField from "@/components/forms/FormField";
import { registrationConstants } from "@/constants/auth";
import AuthService from "@/services/auth";
import { useForm } from "react-hook-form";
import { registerSchema, RegisterSchemaInput } from "@/libs/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function RegistrationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchemaInput>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: async (formData: RegisterSchemaInput) => {
      // 1. Core user registration with Supabase Auth
      const userData = await AuthService.registerUser(formData);

      if (!userData?.user) {
        throw new Error(
          "Initialization vectors failed to assign account profiles.",
        );
      }

      // 2. 🚀 Sequential Cascade Chain: Trigger your backend Resend/OTP system route automatically
      const apiResponse = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.user.id,
          email: userData.user.email,
          firstName:
            formData.firstname ||
            userData.user.user_metadata?.first_name ||
            "Investor",
        }),
      });

      const apiResult = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(
          apiResult.details ||
            "Failed to establish ledger security parameters.",
        );
      }

      return userData;
    },
    onMutate: () => {
      return toast.loading("Processing validation records...");
    },
    onSuccess: async (data, variables, contextToastId) => {
      toast.dismiss(contextToastId);
      toast.success(
        "Security profile initialized! Please request your access token from your manager.",
      );

      // 3. Populate TanStack Query cache values immediately so your input page can read user info
      queryClient.setQueryData(["auth-user"], {
        id: data.user?.id,
        email: data.user?.email,
        username: data.user?.user_metadata?.username || "Investor",
        firstName:
          data.user?.user_metadata?.first_name || variables.firstname || "",
        lastName:
          data.user?.user_metadata?.last_name || variables.lastname || "",
        isVerified: false,
        isOtpVerified: false,
      });

      // 4. Redirect cleanly directly to your OTP entry screen
      router.push("/auth/verify-otp");
    },
    onError: (error: any, variables, contextToastId) => {
      toast.dismiss(contextToastId);
      toast.error(
        error.message ||
          "Registration sequence failed. Please verify credentials.",
      );
    },
  });

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-black text-white antialiased">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center gap-2 mb-6">
          <Logo />
          <h2 className="text-2xl font-tracking-tight">
            <span className="text-[#e9ce39] font-bold">BNB</span> Investment
            Trade
          </h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            Secure &bull; Reliable &bull; Trusted
          </p>
        </div>

        <div className="border border-gray-900 bg-[#050505] p-8 rounded-xl shadow-2xl">
          <Link
            href="/auth/login"
            className="hover:text-white text-gray-500 text-xs transition-colors mb-4 inline-block"
          >
            &larr; Return to Secure Gateway
          </Link>
          <h3 className="font-bold text-2xl tracking-tight text-white mb-1">
            Create Institutional Account
          </h3>
          <p className="text-xs text-gray-400 mb-6">
            Verify your compliance parameters to access active ledgers.
          </p>

          <form
            onSubmit={handleSubmit((data) => {
              registerMutation.mutate(data);
            })}
            className="space-y-1"
          >
            {registrationConstants.map((field) => {
              const fieldError =
                errors[field.fieldName as keyof RegisterSchemaInput]?.message;

              let nameGroupError = undefined;
              if (field.fieldName === "nameGroup") {
                nameGroupError =
                  errors.firstname?.message ||
                  errors.middlename?.message ||
                  errors.lastname?.message;
              }
              return (
                <FormField
                  key={field.id}
                  field={field}
                  register={register}
                  error={fieldError || nameGroupError}
                />
              );
            })}

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className={`w-full bg-[#dabc17] text-black font-bold py-3 rounded-md mt-6 text-sm transition-all tracking-wide ${registerMutation.isPending ? "opacity-50 cursor-not-allowed scale-[0.99]" : "hover:bg-[#ebd026] active:scale-[0.98]"}`}
            >
              {registerMutation.isPending
                ? "Encrypting Account Profile..."
                : "Establish Secure Profile"}
            </button>
          </form>

          <p className="text-gray-400 text-xs text-center mt-5">
            By creating an account, you agree to our{" "}
            <span className="hover:underline text-brand cursor-pointer">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="hover:underline text-brand cursor-pointer">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import Logo from "@/components/Logo";
// import FormField from "@/components/forms/FormField";
// import { registrationConstants } from "@/constants/auth";
// import AuthService from "@/services/auth";
// import { useForm } from "react-hook-form";
// import { registerSchema, RegisterSchemaInput } from "@/libs/validations/auth";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation, useQueryClient } from "@tanstack/react-query";

// export default function RegistrationPage() {
//   const router = useRouter();
//   const queryClient = useQueryClient();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<RegisterSchemaInput>({
//     resolver: zodResolver(registerSchema),
//   });

//   const registerMutation = useMutation({
//     mutationFn: async (data: RegisterSchemaInput) => {
//       const userData = await AuthService.registerUser(data);
//       if (userData?.user) {
//         router.push("/auth/verify-email");
//       }
//       return userData;
//     },
//     onMutate: () => {
//       return toast.loading("Processing validation records...");
//     },
//     onSuccess: async (data, variables, contextToastId) => {
//       if (!data?.user) {
//         toast.dismiss(contextToastId);
//         toast.error("Registration failed. Please try again.");
//         return;
//       }
//       toast.success(
//         "Security profile initialized! Check your email to verify authorization.",
//       );

//       queryClient.setQueryData(["auth-user"], {
//         id: data.user.id,
//         email: data.user.email,
//         username: data.user.user_metadata?.username || "Investor",
//         firstName: data.user.user_metadata?.first_name || "",
//         lastName: data.user.user_metadata?.last_name || "",
//         isVerified: false,
//         isOtpVerified: false,
//       });
//     },
//   });

//   return (
//     <div className="flex justify-center items-center min-h-screen p-4 bg-black text-white antialiased">
//       <div className="w-full max-w-xl">
//         <div className="flex flex-col items-center gap-2 mb-6">
//           <Logo />
//           <h2 className="text-2xl font-tracking-tight">
//             <span className="text-[#e9ce39] font-bold">BNB</span> Investment
//             Trade
//           </h2>
//           <p className="text-xs text-gray-500 uppercase tracking-widest">
//             Secure &bull; Reliable &bull; Trusted
//           </p>
//         </div>

//         <div className="border border-gray-900 bg-[#050505] p-8 rounded-xl shadow-2xl">
//           <Link
//             href="/auth/login"
//             className="hover:text-white text-gray-500 text-xs transition-colors mb-4 inline-block"
//           >
//             &larr; Return to Secure Gateway
//           </Link>
//           <h3 className="font-bold text-2xl tracking-tight text-white mb-1">
//             Create Institutional Account
//           </h3>
//           <p className="text-xs text-gray-400 mb-6">
//             Verify your compliance parameters to access active ledgers.
//           </p>

//           <form
//             onSubmit={handleSubmit((data) => {
//               registerMutation.mutate(data);
//             })}
//             className="space-y-1"
//           >
//             {registrationConstants.map((field) => {
//               const fieldError =
//                 errors[field.fieldName as keyof RegisterSchemaInput]?.message;

//               let nameGroupError = undefined;
//               if (field.fieldName === "nameGroup") {
//                 nameGroupError =
//                   errors.firstname?.message ||
//                   errors.middlename?.message ||
//                   errors.lastname?.message;
//               }
//               return (
//                 <FormField
//                   key={field.id}
//                   field={field}
//                   register={register}
//                   error={fieldError || nameGroupError}
//                 />
//               );
//             })}

//             <button
//               type="submit"
//               disabled={registerMutation.isPending}
//               className={`w-full bg-[#dabc17] text-black font-bold py-3 rounded-md mt-6 text-sm transition-all tracking-wide ${registerMutation.isPending ? "opacity-50 cursor-not-allowed scale-[0.99]" : "hover:bg-[#ebd026] active:scale-[0.98]"}`}
//             >
//               {registerMutation.isPending
//                 ? "Encrypting Account Profile..."
//                 : "Establish Secure Profile"}
//             </button>
//           </form>

//           <p className="text-gray-400 text-xs text-center mt-5">
//             By creating an account, you agree to our{" "}
//             <span className="hover:underline text-brand cursor-pointer">
//               Terms of Service
//             </span>{" "}
//             and{" "}
//             <span className="hover:underline text-brand cursor-pointer">
//               Privacy Policy
//             </span>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
