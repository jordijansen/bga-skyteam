/**
 * Framework interfaces
 */
interface Game {
    instantaneousMode: boolean;
    setup: (gamedatas: any) => void;
    onEnteringState: (stateName: string, args: any) => void;
    onLeavingState: (stateName: string ) => void;
    onUpdateActionButtons: (stateName: string, args: any) => void;
    setupNotifications: () => void;
    format_string_recursive: (log: string, args: any) => void;
    prefs?: {[prefId: number]: {value: number}}
}

interface Notif<T> {
    args: T;
    log: string;
    move_id: number;
    table_id: string;
    time: number;
    type: string;
    uid: string;
}

interface GameData {
    current_player_id: string;
    decision: {decision_type: string};
    game_result_neutralized: string;
    gamestate: Gamestate;
    gamestates: { [gamestateId: number]: Gamestate };
    neutralized_player_id: string;
    notifications: {last_packet_id: string, move_nbr: string}
    playerorder: (string | number)[];
    players: { [playerId: number]: SkyTeamPlayer };
    tablespeed: string
    instantaneousMode: boolean
}

/* TODO repace Function by (..params) => void */
interface Dojo {
    place: (html: string | any, node: string | HTMLElement, pos?: string | number) => void;
    empty: (node: string | HTMLElement) => void;
    style: Function;
    hitch: Function;
    hasClass: (node: string | HTMLElement, className: string) => boolean;
    addClass: (node: string | HTMLElement, className: string) => void;
    removeClass: (node: string | HTMLElement, className?: string) => void;
    toggleClass: (node: string | HTMLElement, className: string, forceValue?: boolean) => void;
    connect: (element: HTMLElement, event: string, handler: (e) => void) => void;
    disconnect: (clickHandler) => void;
    query: (query: string) => any; //HTMLElement[]; with some more functions
    forEach: Function;
    subscribe: Function;
    string: any;
    fx: {
        slideTo: (params: {
            node: HTMLElement;
            top: number;
            left: number;
            delay: number;
            duration: number;
            unit: string;
        }) => any;
    };
    animateProperty: (params: {
        node: string;
        properties: any;
    }) => any;
    marginBox: Function;
    fadeIn: Function;
    trim: Function;
    stopEvent: (evt) => void;
    destroy: (node: string | HTMLElement) => void;
    position: (obj: HTMLElement, includeScroll?: boolean) => { w: number; h: number; x: number; y: number; };

}

type Gamestate = any; // TODO

interface Player {
    beginner: boolean;
    color: string;
    color_back: any | null;
    eliminated: number;
    id: string;
    is_ai: string;
    name: string;
    score: string;
    zombie: number;
}

interface AdditionalAction {
    id: string, type: string, additionalArgs: any[], optional: boolean, canBeUndone: boolean
}