export const getEntityFilterByIds = (ids: string[]): string => {
    const expression = { in: [{ var: 'Id' }, ids] };
    return JSON.stringify(expression);
}
