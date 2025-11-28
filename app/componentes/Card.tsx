// components_Card.jsx
export default function Card({ children, className = '' }) {
  return (
    <div className={`card ${className}`.trim()} role="region" aria-live="polite">
      {children}
    </div>
  );
}
