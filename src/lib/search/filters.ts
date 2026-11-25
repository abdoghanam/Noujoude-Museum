// Search filters — Noujoude
// Builds filter conditions for search queries.

export interface FilterCondition {
  readonly field: string;
  readonly operator: "equals" | "contains" | "in" | "gte" | "lte";
  readonly value: string | number | string[];
}

export function buildFilterConditions(
  filters: Record<string, string | number | string[] | undefined>,
): FilterCondition[] {
  const conditions: FilterCondition[] = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;

    if (Array.isArray(value)) {
      conditions.push({ field: key, operator: "in", value });
    } else if (typeof value === "number") {
      conditions.push({ field: key, operator: "equals", value });
    } else {
      conditions.push({ field: key, operator: "contains", value });
    }
  }

  return conditions;
}

export function applyFilters<T extends Record<string, unknown>>(
  items: T[],
  conditions: FilterCondition[],
): T[] {
  return items.filter((item) => {
    return conditions.every((condition) => {
      const fieldValue = item[condition.field];

      switch (condition.operator) {
        case "equals":
          return fieldValue === condition.value;
        case "contains":
          return String(fieldValue ?? "")
            .toLowerCase()
            .includes(String(condition.value).toLowerCase());
        case "in":
          return Array.isArray(condition.value) && condition.value.includes(String(fieldValue));
        case "gte":
          return Number(fieldValue) >= Number(condition.value);
        case "lte":
          return Number(fieldValue) <= Number(condition.value);
        default:
          return true;
      }
    });
  });
}