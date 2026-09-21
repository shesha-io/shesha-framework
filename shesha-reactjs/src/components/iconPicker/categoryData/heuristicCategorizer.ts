// Fallback categorizer (keyword match) for families with no published category data; order matters, first match wins.
const HEURISTIC_CATEGORIES: { label: string; keywords: string[] }[] = [
  { label: 'Navigation', keywords: ['arrow', 'chevron', 'caret', 'angle', 'compass', 'direction', 'up', 'down', 'left', 'right', 'expand', 'collapse', 'menu', 'hamburger'] },
  { label: 'Communication', keywords: ['chat', 'message', 'mail', 'email', 'envelope', 'phone', 'call', 'comment', 'send', 'inbox', 'sms'] },
  { label: 'Social', keywords: ['share', 'like', 'heart', 'star', 'thumbs', 'follow', 'user', 'people', 'person', 'group', 'team', 'profile', 'avatar'] },
  { label: 'Media', keywords: ['play', 'pause', 'stop', 'video', 'music', 'camera', 'photo', 'film', 'volume', 'mic', 'microphone', 'record', 'audio'] },
  { label: 'Files & Folders', keywords: ['file', 'folder', 'document', 'page', 'clip', 'download', 'upload', 'save', 'archive', 'zip'] },
  { label: 'Commerce', keywords: ['cart', 'shop', 'bag', 'money', 'dollar', 'coin', 'payment', 'credit', 'card', 'wallet', 'tag', 'price', 'receipt', 'gift'] },
  { label: 'Devices & Tech', keywords: ['laptop', 'computer', 'desktop', 'mobile', 'tablet', 'wifi', 'bluetooth', 'battery', 'plug', 'chip', 'server', 'database', 'cloud', 'code'] },
  { label: 'Time & Calendar', keywords: ['clock', 'time', 'calendar', 'alarm', 'watch', 'timer', 'history', 'schedule'] },
  { label: 'Security', keywords: ['lock', 'unlock', 'shield', 'key', 'password', 'fingerprint', 'security'] },
  { label: 'Settings & Tools', keywords: ['settings', 'gear', 'cog', 'wrench', 'tool', 'filter', 'adjust', 'slider'] },
  { label: 'Home & Building', keywords: ['home', 'house', 'building', 'office', 'store', 'bed', 'kitchen', 'door', 'window'] },
  { label: 'Weather & Nature', keywords: ['sun', 'moon', 'cloud', 'rain', 'snow', 'wind', 'tree', 'leaf', 'flower', 'fire', 'water', 'weather'] },
  { label: 'Health', keywords: ['medical', 'hospital', 'pill', 'health', 'pulse', 'heartbeat', 'thermometer', 'bandage'] },
  { label: 'Text & Editor', keywords: ['bold', 'italic', 'underline', 'align', 'text', 'font', 'edit', 'pen', 'pencil', 'highlight', 'paragraph'] },
  { label: 'Shapes', keywords: ['circle', 'square', 'triangle', 'box', 'shape', 'grid', 'dot', 'line', 'hexagon'] },
];

export const heuristicCategoryFor = (exportName: string, commonPrefix: string): string | undefined => {
  const rest = exportName.slice(commonPrefix.length).toLowerCase();
  for (const category of HEURISTIC_CATEGORIES) {
    if (category.keywords.some((keyword) => rest.includes(keyword))) return category.label;
  }
  return undefined;
};
