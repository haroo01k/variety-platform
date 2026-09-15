interface Option {
  value: string;
  label: string;
}

interface ConditionSelectProps {
  id: string;
  icon: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

/**
 * 농업인 조건 입력 화면에서 쓰는 드롭다운 한 줄(아이콘 + 라벨 + select).
 * 네이티브 <select>를 사용해 키보드(Tab, 방향키, Enter)로도 선택할 수 있습니다.
 */
export function ConditionSelect({ id, icon, label, value, onChange, options }: ConditionSelectProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
      <span className="text-xl" aria-hidden="true">
        {icon}
      </span>
      <label htmlFor={id} className="w-20 shrink-0 text-sm font-semibold text-slate-600">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 rounded-md bg-transparent text-right text-sm font-medium text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-green"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className="text-slate-400">
        ⌄
      </span>
    </div>
  );
}
