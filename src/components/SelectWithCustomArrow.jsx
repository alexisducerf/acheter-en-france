const SelectWithCustomArrow = ({
  id,
  name,
  value,
  onChange,
  disabled,
  required,
  placeholder,
  className = '',
  children
}) => (
  <div className="relative">
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={`field appearance-none truncate pr-10 ${className}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
    <svg
      className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-muted"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
    </svg>
  </div>
);

export default SelectWithCustomArrow;
