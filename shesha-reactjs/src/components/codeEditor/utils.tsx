import { Ace } from 'ace-builds';
import { toCamelCase } from '@/utils/string';

/**
 * Gets token at current cursor posistion. Returns null if none
 */
// @ts-ignore
/*
function getCurrentToken(editor) {
    try {
        const pos = editor.getSelectionRange().end;
        return editor.session.getTokenAt(pos.row, pos.column);
    } catch (ex) {
        console.error(ex);
    }
}
*/

export interface CompletionModel {
    caption: string;
    description?: string;
    snippet?: string;
    meta: string;
    type: string;
    value?: string;
    parent?: string;
    docHTML?: string;
    inputParameters?: { [name: string]: string };
  }

export interface ICodeTreeItem {
    value: string;
    caption?: string;
    meta?: string;

    loaded: boolean;
    childRefresh?: (resolve: (data: ICodeTreeLevel) => void) => void;

    childs?: ICodeTreeLevel;
}

export interface ICodeTreeLevel {
    [key: string]: ICodeTreeItem;
}
const treeLevel2Completions = (level: ICodeTreeLevel, prefix: string = ''): Ace.Completion[] => {
    const completions: Ace.Completion[] = [];
    for (const key in level) {
        if (level.hasOwnProperty(key)) {
            const item = level[key];
            completions.push({
                caption: prefix + toCamelCase(item.value),
                value: prefix + toCamelCase(item.value),
                meta: item.caption,
                score: 0,
            });
        }
    }

    return completions;
};

export const getCompletions = (
    // @ts-ignore
    metadata: ICodeTreeLevel,
    prefix: string,
    callback: Ace.CompleterCallback
): void => {
    if (!metadata)
        return;

    if (prefix && prefix.endsWith('.')) {
        const parts = prefix.split('.')
            .map(item => item.endsWith('?') ? item.replace('?', '') : item);

        let currentLevel: ICodeTreeLevel = metadata;

        let currentItem: ICodeTreeItem = null;
        do {
            const part = parts.shift();
            if (part === '' && parts.length === 0)
                break;
            currentItem = currentLevel
                ? currentLevel[part]
                : null;
            if (currentItem) {
                if (!currentItem.loaded && currentItem.childRefresh) {
                    currentItem.childRefresh((res) => {
                        const completions = treeLevel2Completions(res, prefix);
                        callback(null, completions);
                    });
                    break;
                }
                currentLevel = currentItem.childs;
            }
            // todo: load if chlids are not loaded yet
        } while (parts.length > 0 && currentItem);

        if (Boolean(currentLevel) && parts.length === 0) {
            const completions = treeLevel2Completions(currentLevel, prefix);

            //console.log({ completions });
            callback(null, completions);
        }
    } else {
        const completions = treeLevel2Completions(metadata);
        //console.log(completions);
        callback(null, completions);
    }
};