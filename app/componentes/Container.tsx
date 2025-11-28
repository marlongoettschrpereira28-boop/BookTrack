// components_Container.jsx
export default function Container({ children, className = '' }) {
  return <div className={`container ${className}`.trim()}>{children}</div>;
}
