export const formatNaturalLanguageList = (items: string[]): string => {
    if (items.length === 0) {
      return "";
    } else if (items.length === 1) {
      return items[0];
    } else if (items.length === 2) {
      return `${items[0]} and ${items[1]}`;
    } else {
      return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
    }
  }
