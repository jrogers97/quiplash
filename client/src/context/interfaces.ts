export interface IUserContext {
    socket: SocketIOClient.Socket | null,
    name: string,
    room: string,
    round: number,
    isHost: boolean,
    setName: (name: string) => void,
    setRoom: (room: string) => void,
    setRound: (round: number) => void,
    setIsHost: (isHost: boolean) => void
}

export interface UserProviderState {
    socket: SocketIOClient.Socket,
    name: string,
    room: string,
    round: number,
    isHost: boolean
}

export enum UserProviderActionType {
    SET_NAME = 'SET_NAME',
    SET_ROOM = 'SET_ROOM',
    SET_ROUND = 'SET_ROUND',
    SET_IS_HOST = 'SET_IS_HOST'
}

export type UserProviderAction = 
    { type: UserProviderActionType.SET_NAME, payload: string}
  | { type: UserProviderActionType.SET_ROOM, payload: string}
  | { type: UserProviderActionType.SET_ROUND, payload: number}
  | { type: UserProviderActionType.SET_IS_HOST, payload: boolean}
