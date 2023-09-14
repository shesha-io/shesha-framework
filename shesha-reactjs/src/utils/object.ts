export const getValueByPropertyName = (data: any, propertyName: string): any => {
    if (!!data) {
        const path = propertyName.split('.');
        if (Array.isArray(path) && path.length > 0) {
          let value = data[path[0]];
          path.forEach((item, index) => {
            if (index > 0)
              value = typeof value === 'object' ? value[item] : undefined;
          });
          return value;
        }
    }
    return undefined;
};

export const setValueByPropertyName = (data: any, propertyName: string, value: any) => {
    const propName = propertyName.split('.');

    if (Array.isArray(propName) && propName.length > 0) {
        let prop = data;
        propName.forEach((item, index) => {
            if (index < propName.length - 1) {
                prop[item] = {};
                prop = prop[item];
            }
        });
        prop[propName[propName.length - 1]] = value;
    }
    return data;
};