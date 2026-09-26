import { Info } from 'lucide-react';
export default function DataEmpty({ title='No data available', children, icon: Icon=Info }) {
  return <div className="data-empty" role="status"><Icon size={26} aria-hidden="true"/><h3>{title}</h3><p>{children || 'Information will appear here when it is available from the connected service.'}</p></div>;
}
