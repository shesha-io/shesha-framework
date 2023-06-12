import { Reducer } from "react";
import { createAction } from "redux-actions";

export interface IUndoableOptions {
    limit?: number;
    includeAction?: (actionName: string) => boolean;
}

export interface StateWithHistory<State> {
    past: State[];
    present: State;
    future: State[];
    _latestUnfiltered?: State;
}

export interface Action {
    type: string;
}

export enum UndoableActionEnums {
    UNDO = '@undoable/UNDO',
    REDO = '@undoable/REDO',
    CLEAR_HISTORY = '@undoable/CLEAR_HISTORY',
}

export const UndoableActionCreators = {
    undo: createAction<void, void>(UndoableActionEnums.UNDO, (p) => p),
    redo: createAction<void, void>(UndoableActionEnums.REDO, (p) => p),
    clearHistory: createAction<void, void>(UndoableActionEnums.CLEAR_HISTORY, (p) => p),
};

export default function undoable<State>(reducer: Reducer<State, Action>, options: IUndoableOptions): Reducer<StateWithHistory<State>, Action> {
    const includeAction = options.includeAction ?? (() => true);

    const applyLimit = (items: State[], limit?: number): State[] => {
        return !limit || items.length <= limit
            ? items
            : items.slice(-limit);
    };

    let initialState: State = undefined;

    // Return a reducer that handles undo and redo
    return function (state /*= initialState*/, action) {
        const { past, present, future } = state;

        if (initialState === undefined) {
            // save current state if it was not set before, we'll use it for the first undoable action
            initialState = state.present;
        }

        switch (action.type) {
            case UndoableActionEnums.CLEAR_HISTORY: {
                initialState = undefined;

                return {
                    past: [],
                    present: present,
                    future: [],
                    _latestUnfiltered: present,
                };
            }
            case UndoableActionEnums.UNDO:
                const previous = past[past.length - 1];
                const newPast = past.slice(0, past.length - 1);
                return {
                    past: newPast,
                    present: previous,
                    future: [present, ...future],
                    _latestUnfiltered: previous,
                };
            case UndoableActionEnums.REDO:
                const next = future[0];
                const newFuture = future.slice(1);
                return {
                    past: [...past, present],
                    present: next,
                    future: newFuture,
                    _latestUnfiltered: next,
                };
            default:
                // Delegate handling the action to the passed reducer
                const newPresent = reducer(present, action);
                if (present === newPresent) {
                    return state;
                }

                if (includeAction(action.type)) {
                    // `state._latestUnfiltered` is not available during the recording of the first undoable action
                    const lastSavedState = state._latestUnfiltered ?? initialState;
                    return {
                        past: lastSavedState
                            ? applyLimit([...past, lastSavedState], options.limit)
                            : [],
                        present: newPresent,
                        future: [],
                        _latestUnfiltered: newPresent,
                    };
                } else
                    return {
                        past: state.past,
                        present: newPresent,
                        future: [],
                        _latestUnfiltered: state._latestUnfiltered,
                    };
        }
    };
};