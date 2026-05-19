import Logo from "@/components/Logo";

export default function RegistrationPage() {
  return (
    <div className="flex justify-center items-center h-screen p-3 bg-black text-white">
      <div>
        {/* header */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <Logo />
          <h2 className="font-bold">
            <span className="text-[#e9ce39]">BNB</span> Investment Trade
          </h2>
          <p>Secure . Reliable . Trusted</p>
        </div>
        <div className="border border-[#e9cf393a] p-4 rounded-md">
          <a
            href="/login"
            className="hover:underline text-gray-400 text-sm mb-2 block"
          >
            &larr; Back to Login
          </a>
          <h3 className="font-semibold mb-1">Create Account</h3>
          <p className="text-[12px] mb-5">
            Fill in your details to get started
          </p>

          <form>
            <label htmlFor="username">Username</label>
            <div>
              <span></span>
              <input type="text" id="username" name="username" required />
            </div>

            <label>Name</label>
            <div className="flex">
              <input
                type="firstname"
                id="firstname"
                name="firstname"
                required
              />
              <input
                type="middlename"
                id="middlename"
                name="middlename"
                required
              />
              <input type="lastname" id="lastname" name="lastname" required />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
