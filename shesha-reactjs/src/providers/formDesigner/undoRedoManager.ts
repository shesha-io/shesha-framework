import { BaseHistoryItem } from "./models";

type StateWithDescription<T> = BaseHistoryItem & {
  state: T;
};

export interface IUndoRedoManager<T> {
  undo(): boolean;
  redo(): boolean;
  getState(): T;
  executeChange(change: (state: T) => T, description: string): void;
  setState(state: T): void;
  canUndo: boolean;
  canRedo: boolean;
  past: StateWithDescription<T>[];
  future: StateWithDescription<T>[];
  history: StateWithDescription<T>[];
  index: number;
}

export class UndoRedoManager<T> implements IUndoRedoManager<T> {
  private state: T;

  history: StateWithDescription<T>[] = [];

  get index(): number {
    return this.currentIndex;
  }

  private currentIndex: number = -1;

  private maxHistorySize: number = 100;

  constructor(initialState: T) {
    this.state = initialState;
    this.saveState(initialState, "Initial state");
  }

  get past(): StateWithDescription<T>[] {
    return this.history.slice(0, this.currentIndex);
  }

  get future(): StateWithDescription<T>[] {
    return this.history.slice(this.currentIndex + 1);
  }

  setState(state: T): void {
    this.history = [];
    this.currentIndex = -1;
    this.state = state;
    this.saveState(state, "State reset");
    // this.saveState("State reset");
  }

  // For simple state changes
  executeChange(change: (state: T) => T, description: string): void {
    const newState = change(this.state);
    if (newState === this.state)
      return;

    this.saveState(newState, description);
    this.state = newState;
  }

  /*
  // For complex operations that need their own undo logic
  executeCommand(command: {
    execute(state: T): void;
    undo(state: T): void;
    description: string;
  }): void {
    command.execute(this.state);
    this.saveState(command.description);
  }
  */

  private saveState(state: T, description: string): void {
    // Remove any future states if we're not at the end
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new state
    this.history.push({
      state: this.cloneState(state),
      description,
      time: new Date(),
    });

    this.currentIndex = this.history.length - 1;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  getHistoryAt = (index: number): StateWithDescription<T> => {
    const result = this.history[index];
    if (!result)
      throw new Error('Index out of bounds');
    return result;
  };

  undo(): boolean {
    if (this.currentIndex > 0) {
      const index = this.currentIndex - 1;
      const historyItem = this.getHistoryAt(index);
      this.currentIndex = index;
      this.state = this.cloneState(historyItem.state);
      return true;
    }
    return false;
  }

  redo(): boolean {
    if (this.currentIndex < this.history.length - 1) {
      const index = this.currentIndex + 1;
      const historyItem = this.getHistoryAt(index);
      this.currentIndex = index;
      this.state = this.cloneState(historyItem.state);
      return true;
    }
    return false;
  }

  getState(): T {
    return this.state;
  }

  getHistory(): { description: string; canUndo: boolean; canRedo: boolean } {
    return {
      description: this.history[this.currentIndex]?.description || "",
      canUndo: this.currentIndex > 0,
      canRedo: this.currentIndex < this.history.length - 1,
    };
  }

  get canUndo(): boolean {
    return this.currentIndex > 0 && this.currentIndex <= this.history.length - 1;
  }

  get canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  private cloneState(state: T): T {
    // Use a more robust cloning method for complex objects
    return typeof (structuredClone) === 'function'
      ? structuredClone(state)
      : JSON.parse(JSON.stringify(state));
  }
}
