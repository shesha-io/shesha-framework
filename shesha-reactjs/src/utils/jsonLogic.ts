type NodeCallback = (operator: string, args: object[]) => void;
const processRecursive = (jsonLogic: object, callback: NodeCallback) => {
    if (!jsonLogic)
        return;
    for (const operator in jsonLogic) {
        if (!jsonLogic.hasOwnProperty(operator))
            continue;
        const args = jsonLogic[operator];

        callback(operator, args);

        if (Array.isArray(args)) {
            args.forEach(arg => {
                if (typeof (arg) === 'object')
                    processRecursive(arg, callback);
            });
        } else
            if (typeof (args) === 'object') // note: single arguments may be presented as objects, example: {"!!": {"var": "user.userName"}}
                processRecursive(args, callback);
    }
};

export const extractVars = (jsonLogic: object): string[] => {
    const result = [];

    if (jsonLogic)
        processRecursive(jsonLogic, (operator, args) => {
            if (operator === 'var') {
                if (result.indexOf(args) === -1)
                    result.push(args);
            }
        });

    return result;
};

export interface IArgumentEvaluationResult {
    handled: boolean;
    value?: any;
}
export type JsonLogicContainerProcessingCallback = (operator: string, args: object[], argIndex: number) => IArgumentEvaluationResult;

export const convertJsonLogicNode = (jsonLogic: object, argumentEvaluator: JsonLogicContainerProcessingCallback): object => {
    if (!jsonLogic)
        return null;

    const result = {};
    for (const operator in jsonLogic) {
        if (!jsonLogic.hasOwnProperty(operator))
            continue;

        const args = jsonLogic[operator];
        
        let convertedArgs = null;

        if (Array.isArray(args)) {
            convertedArgs = args.map((arg, argIdx) => {
                if (typeof (arg) === 'object')
                return convertJsonLogicNode(arg, argumentEvaluator);

                const evaluationResult = argumentEvaluator(operator, args, argIdx);
                return evaluationResult.handled
                    ? evaluationResult.value
                    : arg;
            });
        } else {
            // note: single arguments may be presented as objects, example: {"!!": {"var": "user.userName"}}
            if (typeof (args) === 'object') {
                convertedArgs = convertJsonLogicNode(args, argumentEvaluator);
            } else {
                const evaluationResult = argumentEvaluator(operator, [args], 0);
                convertedArgs = evaluationResult.handled
                    ? evaluationResult.value
                    : args;
            }                
        }
        result[operator] = convertedArgs;
    }
    return result;
};