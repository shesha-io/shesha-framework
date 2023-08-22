import { Ace } from 'ace-builds';
import { getCompletions, ICodeTreeLevel } from './utils';

export const contextCodeCompleter =
{
    identifierRegexps: [/[a-zA-Z_0-9.$-u00A2-uFFFF]/],
    getCompletions: (
        // @ts-ignore
        editor: Ace.Editor,
        _session: Ace.EditSession,
        _pos: Ace.Point,
        prefix: string,
        callback: Ace.CompleterCallback
    ): void => {
        getCompletions(editor["shaContext"] as ICodeTreeLevel, prefix, callback);

    },
};

export default contextCodeCompleter;