import { IAnnotation } from "./model";


function canSubmit(data: IAnnotation[], minPoints: number) {

    const numberOfPoints = data?.filter(({ comment }) => !!comment)?.length;

    if (numberOfPoints < minPoints) {
        return false;
    }
    return true;
}
function parseIntOrDefault(input: any, defaultValue: number = 0): number {
    const parsed = parseInt(input, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}
function sortAnnotationData(data: IAnnotation[]) {

    let annotationLength = data?.length;
    const arrangedComments = data
        ?.filter(mark => !!mark?.comment)
        ?.sort((a, b) => {
            const order = [...a.comment?.split('.'), ...b.comment?.split('.')];
            return parseInt(order[0], 10) - parseInt(order[2], 10);
        })
        ?.map(({ comment, ...rest }, index) => {

            const [, commt] = comment?.split('.');
            return {
                ...rest,
                comment: `${index + 1}.${commt}`,
            };
        });

    if (data[annotationLength - 1]) {
        if (!data[annotationLength - 1]?.comment) {
            arrangedComments.push(data[annotationLength - 1]);
        }
    }

    return arrangedComments;

};
function getViewData(data: IAnnotation[], allowAddingNotes = false) {
    let viewData = data?.map((mrk, index) => {
        return {
            ...mrk,
            comment: allowAddingNotes ? `${index + 1}.` : `${index + 1}.X`,
        };
    });

    return viewData;
}




function getCustomEnabled(customVisibility: string, name: string, data = {}, globalState = {}, formMode) {
    if (customVisibility) {
        const customVisibilityExecutor = new Function('value, data, globalState, formMode', customVisibility);

        return customVisibilityExecutor(data?.[name], data, globalState, formMode);

    } else {
        return true;
    }


}


export { parseIntOrDefault, sortAnnotationData, getViewData, canSubmit, getCustomEnabled };

