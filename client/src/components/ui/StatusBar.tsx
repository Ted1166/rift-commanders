interface StatusBarProps {
  label: string;
  value: string | number;
  color?: 'green' | 'red' | 'blue' | 'yellow';
}

export function StatusBar({ label, value, color = 'green' }: StatusBarProps) {
  const colors = {
    green: 'text-tactical-green',
    red: 'text-accent-red',
    blue: 'text-accent-blue',
    yellow: 'text-accent-yellow',
  };

  return (
    <div className="flex items-center justify-between font-mono text-sm">
      <span className="text-tactical-green/60 uppercase tracking-wider">{label}:</span>
      <span className={`font-bold ${colors[color]}`}>{value}</span>
    </div>
  );
}