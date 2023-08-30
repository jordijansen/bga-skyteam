interface Plane {
    altitude: number;
    approach: number;
    axis: number;
    aerodynamicsBlue: number;
    aerodynamicsOrange: number,
    brake: number
}

interface SkyTeamGame extends Game {
    tokenManager: TokenManager;
    playerRoleManager: PlayerRoleManager;
    animationManager: AnimationManager,
    gamedatas: SkyTeamGameData;
    getPlayerId(): number;
    getPlayer(playerId: number): SkyTeamPlayer;
    isReadOnly(): boolean;
    setTooltipToClass(className: string, html: string): void;
    formatWithIcons(description: string): string
}

interface Dice {
    id: number,
    type: 'player' | 'weather',
    typeArg: 'pilot' | 'co-pilot',
    side: number,
    location: string
}

interface ApproachTrack {
    type: number,
    size: number,
    name: string,
    category: string
    spaces: {[space: number]: {plane?: number}}
}

interface AltitudeTrack {
    type: number,
    size: number,
    categories: string[]
    spaces: {[space: number]: {startPlayer: 'pilot' | 'co-pilot', reroll?: number}}
}

interface SkyTeamPlayer extends Player {
    role: 'pilot'|'co-pilot',
    dice: Dice[]
}

interface SkyTeamGameData extends GameData {
    rerollTokens: { [id: number]: Card };
    planeTokens: { [id: number]: Card };
    coffeeTokens: { [id: number]: Card };
    plane: Plane,
    approach: ApproachTrack,
    altitude: AltitudeTrack
}

// ARGS

// NOTIFS
interface NotifPlayerRoleAssigned {
    playerId: number,
    roleColor: string;
    role: string;
    dice: Dice[]
}
