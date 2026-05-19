export default function FormField({
  field,
}: {
  field: { id: number; name: string; type: string };
}) {
  if (field.name === "Name") {
    return (
      <div>
        <label
          htmlFor={field.name.toLowerCase().replace(" ", "-")}
          className="mb-1.5"
        >
          {field.name}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="firstname"
            name="firstname"
            className="form-input"
            required
            placeholder="First name"
          />
          <input
            type="text"
            id="middlename"
            name="middlename"
            className="form-input"
            required
            placeholder="Middle name"
          />
          <input
            type="text"
            id="lastname"
            name="lastname"
            className="form-input"
            required
            placeholder="Last name"
          />
        </div>
      </div>
    );
  }
  return (
    <div>
      <label
        htmlFor={field.name.toLowerCase().replace(" ", "-")}
        className="mb-1.5"
      >
        {field.name}
      </label>
      <div>
        <input
          type={field.type}
          id={field.name.toLowerCase().replace(" ", "-")}
          name={field.name.toLowerCase().replace(" ", "-")}
          className="form-input"
          required
          placeholder={`Enter your ${field.name.toLowerCase().replace(" ", " ")}`}
        />
      </div>
    </div>
  );
}
