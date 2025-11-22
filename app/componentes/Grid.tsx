// components_Grid.jsx
export default function Grid({ children, className = '' }) {
  return <div className={`grid ${className}`.trim()}>{children}</div>;
}
