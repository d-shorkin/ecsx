import {IEventEmitter} from "@ecsx/core";

export interface IPayload<T> {
  getType(): string;
  getPayload(): T;
}

export interface ClientEvents {
  onMessage(payload: IPayload<any>): void;
}

export interface Client extends IEventEmitter<ClientEvents> {
  send(payload: IPayload<any>): void;
}