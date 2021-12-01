import {IElementsState, IHandler} from "./contract";

export abstract class AbstractHandler implements IHandler
{
  private nextHandler: IHandler | null = null;

  setNext(handler: IHandler): IHandler {
    this.nextHandler = handler;
    return handler;
  }

  handle(state: IElementsState): IElementsState {
    if (this.nextHandler) {
      return this.nextHandler.handle(state);
    }
    return state;
  }
}