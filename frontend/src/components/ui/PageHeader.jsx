import { isValidElement } from 'react';
export default function PageHeader({ badge, title, subtitle, action, icon: Icon }) {
  return <div className="page-heading"><div>{badge && <span className="eyebrow">{Icon && (isValidElement(Icon)?Icon:<Icon size={15}/>)}{badge}</span>}<h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action && <div className="page-heading-action">{action}</div>}</div>;
}
