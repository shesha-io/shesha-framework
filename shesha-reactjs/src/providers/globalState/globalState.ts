import { IAnyObject } from "@/interfaces";
import { GlobalStateRerenderTrigger, IGlobalState, ISetStatePayload } from "./contexts";

export class GlobalState implements IGlobalState {
  #forceUpdate: GlobalStateRerenderTrigger;

  #state: IAnyObject;

  constructor(forceUpdate: GlobalStateRerenderTrigger) {
    this.#forceUpdate = forceUpdate;
    this.#state = {};
  }

  get globalState(): IAnyObject {
    return this.#state;
  };

  setState = (payload: ISetStatePayload): void => {
    const { key, data } = payload;

    this.#state[key] = data;
    this.#forceUpdate();
  };

  clearState = (stateKey: string): void => {
    delete this.#state[stateKey];
    this.#forceUpdate();
  };

  getStateByKey = (key: string): unknown => {
    return this.#state[key];
  };
}
