/**
 * 복수 선택 칩(ChoiceChip)의 선택 상태를 갱신하는 순수 함수.
 * exclusiveValue(예: "특별히 없음", "없음")를 선택하면 다른 선택을 모두 해제하고,
 * 반대로 다른 항목을 선택하면 exclusiveValue는 자동으로 해제됩니다.
 */
export function toggleMultiSelect(current: string[], value: string, exclusiveValue?: string): string[] {
  if (exclusiveValue && value === exclusiveValue) {
    return current.includes(value) ? [] : [value];
  }

  const withoutExclusive = exclusiveValue ? current.filter((v) => v !== exclusiveValue) : current;

  return withoutExclusive.includes(value)
    ? withoutExclusive.filter((v) => v !== value)
    : [...withoutExclusive, value];
}
