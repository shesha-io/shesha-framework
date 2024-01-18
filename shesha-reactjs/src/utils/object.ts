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

export const setValueByPropertyName = (data: any, propertyName: string, value: any, makeCopy: boolean = false) => {
    const propName = propertyName.split('.');
    const resultData = makeCopy ? {...data} : data;

    if (Array.isArray(propName) && propName.length > 0) {
        let prop = resultData;
        propName.forEach((item, index) => {
            if (index < propName.length - 1 && item?.length > 0) {
                if (typeof prop[item] !== 'object') {
                    prop = prop[item] = {};
                } else {
                    if (makeCopy)
                        prop = prop[item] = {...prop[item]};
                    else
                        prop = prop[item];
                }
            }
        });
        if (propName[propName.length - 1]?.length > 0)
            prop[propName[propName.length - 1]] = value;
    }
    return resultData;
};