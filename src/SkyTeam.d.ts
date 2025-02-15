interface Plane {
    altitude: number;
    approach: number;
    axis: number;
    aerodynamicsBlue: number;
    aerodynamicsOrange: number,
    brake: number,
    kerosene: number,
    wind: number,
    windModifier: string,
    switches: {[id: string]: PlaneSwitch}
}

interface PlaneSwitch {
    id: string,
    value: boolean
}

interface SkyTeamGame extends Game {
    planeManager: PlaneManager;
    helpDialogManager: HelpDialogManager;
    diceManager: DiceManager;
    tokenManager: TokenManager;
    playerRoleManager: PlayerRoleManager;
    animationManager: AnimationManager,
    specialAbilityCardManager: SpecialAbilityCardManager,
    gamedatas: SkyTeamGameData;
    getPlayerId(): number;
    getPlayer(playerId: number): SkyTeamPlayer;
    isReadOnly(): boolean;
    setTooltipToClass(className: string, html: string): void;
    formatWithIcons(description: string): string
    delay(ANIMATION_MS: number): Promise<void>;
    getFailureReasonTitle(failureReason: string): string;
    getFailureReasonText(failureReason: string): string;
    tokenIcon(plane: string, size?: string): string;
}

interface Dice {
    id: number,
    type: 'player' | 'weather' | 'traffic',
    typeArg: 'pilot' | 'co-pilot',
    side: number,
    value: number,
    location: string,
    locationArg: string
}

interface SpecialAbilityCard {
    id: number,
    type: number,
    location: string,
    locationArg: number,
    name: string,
    description: string
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
    type: string
}

interface SkyTeamPlayer extends Player {
    role: 'pilot'|'co-pilot',
    dice: Dice[],
    flightLog: {[scenarioId: number]: number[]}
}

interface VictoryCondition {
    letter: string,
    description: string,
    status: 'success' | 'pending' | 'failed'
}

interface SkyTeamGameData extends GameData {
    failureReason?: string;
    planeDice: Dice[];
    trafficDice: Dice[];
    internDice: Dice[];
    round: number,
    phase: 'setup' | 'strategy' | 'diceplacement',
    actionSpaces: {[actionSpaceId: string]: ActionSpace}
    rerollTokens: { [id: number]: Card };
    planeTokens: { [id: number]: Card };
    coffeeTokens: { [id: number]: Card };
    plane: Plane,
    approach: ApproachTrack,
    altitude: AltitudeTrack,
    finalRound: boolean,
    isLanded: boolean,
    victoryConditions: {[conditionLetter: string]: VictoryCondition},
    scenario: {id: number, nrOfSpecialAbilities?: number, modules: 'traffic' | 'turns'}
    chosenSpecialAbilities: SpecialAbilityCard[],
    rolesThatUsedAdaptation: string[],
    realTimeSecondsRemaining?: number,
    timerNeedsClearing: boolean,
    timerSeconds: number,
    scenarioData: {[scenarioId: number]: {approach: number, altitude: number, modules: string[], tags: string[], nrOfSpecialAbilities?: number}}
    approachTrackData: {[approachTrackId: number]: {category: string, name: string}}
    flightLog: {[scenarioId: number]: number[]}
    alarmTokens: AlarmToken[],
    alarmTokenData: {[typeArg: number]: {name: string}}
}

interface AlarmToken extends Card {
    isActive: boolean
}

// ARGS
interface DicePlacementSelectArgs {
    nrOfRerollAvailable: number;
    nrOfCoffeeAvailable: number;
    availableActionSpaces: {[actionSpaceId: string]: ActionSpace};
    canActivateAdaptation: boolean;
    canActivateWorkingTogether: boolean;
}

interface PlaceInternArgs {
    availableActionSpaces: {[actionSpaceId: string]: ActionSpace};
    internDie: Dice[];
}

interface PlayerSetupArgs {
    nrOfSpecialAbilitiesToSelect: number,
    specialAbilities: SpecialAbilityCard[]
}

interface RerollDiceArgs {
    maxNumberOfDice: number
}

interface SwapDiceArgs {
    firstDie: Dice
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

interface NotifSpecialAbilitiesSelected {
    cards: SpecialAbilityCard[]
}

interface NotifTokenReceived {
    token: Card;
}

interface NotifDiceRolled {
    playerId: number,
    dice: Dice[],
}

interface NotifPlayerUsedAdaptation {
    rolesThatUsedAdaptation?: string[]
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

interface NotifCoffeeUsed {
    tokens: Card[]
}

interface NotifRerollTokenUsed {
    token: Card
}

interface NotifPlaneAltitudeChanged {
    altitude: number;
}

interface NotifDiceReturnedToPlayer {
    playerId: number,
    dice: Dice[]
}

interface NotifDicePutAside {
    dice: Dice[]
}

interface NotifVictoryConditionsUpdated {
    victoryConditions: {[conditionLetter: string]: VictoryCondition}
}

interface NotifPlaneLanded {
    failure: boolean,
    victoryConditions: {[conditionLetter: string]: VictoryCondition}
    score: number
}

interface NotifNewRoundStarted {
    finalRound: boolean
}

interface NotifTrafficDieRolled {
    trafficDie: Dice,
    planeToken: Card
}

interface NotifPlaneKeroseneChanged {
    kerosene: number;
}

interface NotifDiceRemoved {
    dice: Dice[]
}

interface NotifWindChanged {
    wind: number;
    windModifier: string;
}

interface NotifInternTrained {
    playerId: number,
    die: Dice
}

interface NotifDieSkipped {
    playerId: number,
    die: Dice
}

interface NotifFlightLogUpdated {
    team: {[scenarioId: number]: number[]},
    players: {[playerId: number]: {[scenarioId: number]: number[]}},
}

interface NotifAlarmActivated {
    alarmToken: AlarmToken
}