export const Select = ({ onValueChange, value, children }) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  );
  
  export const SelectItem = ({ value, children }) => (
    <option value={value}>{children}</option>
  );
  