interface Plane {
    altitude: number;
    approach: number;
    axis: number;
    aerodynamicsBlue: number;
    aerodynamicsOrange: number,
    brake: number,
    switches: {[id: string]: PlaneSwitch}
}

interface PlaneSwitch {
    id: string,
    value: boolean
}

interface SkyTeamGame extends Game {
    diceManager: DiceManager;
    tokenManager: TokenManager;
    playerRoleManager: PlayerRoleManager;
    animationManager: AnimationManager,
    gamedatas: SkyTeamGameData;
    getPlayerId(): number;
    getPlayer(playerId: number): SkyTeamPlayer;
    isReadOnly(): boolean;
    setTooltipToClass(className: string, html: string): void;
    formatWithIcons(description: string): string
    delay(ANIMATION_MS: number): Promise<void>;
}

interface Dice {
    id: number,
    type: 'player' | 'weather',
    typeArg: 'pilot' | 'co-pilot',
    side: number,
    location: string,
    locationArg: string
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

interface ActionSpace {
    allowedValues?: number[],
    allowedRoles: SkyTeamPlayer['role'][],
    mandatory: boolean,
    type: 'axis'
}

interface SkyTeamPlayer extends Player {
    role: 'pilot'|'co-pilot',
    dice: Dice[]
}

interface SkyTeamGameData extends GameData {
    failureReason?: string;
    planeDice: Dice[];
    round: number,
    phase: 'setup' | 'strategy' | 'diceplacement',
    actionSpaces: {[actionSpaceId: string]: ActionSpace}
    rerollTokens: { [id: number]: Card };
    planeTokens: { [id: number]: Card };
    coffeeTokens: { [id: number]: Card };
    plane: Plane,
    approach: ApproachTrack,
    altitude: AltitudeTrack
}

// ARGS
interface DicePlacementSelectArgs {
    availableActionSpaces: {[actionSpaceId: string]: ActionSpace}
}

interface PlaneFailureArgs {
    failureReason: string
}

// NOTIFS
interface NotifNewPhaseStarted {
    newPhase: SkyTeamGameData['phase']
}
interface NotifPlayerRoleAssigned {
    playerId: number,
    roleColor: string;
    role: string;
    dice: Dice[]
}

interface NotifTokenReceived {
    token: Card;
}

interface NotifDiceRolled {
    playerId: number,
    dice: Dice[];
}

interface NotifDiePlaced {
    playerId: number,
    die: Dice
}

interface NotifPlaneAxisChanged {
    axis: number;
}

interface NotifPlaneFailure {
    failureReason: string
}

interface NotifPlaneApproachChanged {
    approach: number
}

interface NotifPlaneTokenRemoved {
    plane?: Card
}

interface NotifPlaneSwitchChanged {
    planeSwitch: PlaneSwitch;
}

interface NotifPlaneAerodynamicsChanged {
    aerodynamicsBlue?: number,
    aerodynamicsOrange?: number
}

interface NotifPlaneBrakeChanged {
    brake: number;
}