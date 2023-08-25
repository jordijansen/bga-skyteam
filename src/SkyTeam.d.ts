interface Plane {
    axis: number;
    aerodynamicsBlue: number;
    aerodynamicsOrange: number,
    brake: number
}

interface SkyTeamGame extends Game {
    gamedatas: SkyTeamGameData;
    getPlayerId(): number;
    getPlayer(playerId: number): SkyTeamPlayer;
    isReadOnly(): boolean;
    setTooltipToClass(className: string, html: string): void;
    formatWithIcons(description: string): string
}

interface SkyTeamPlayer extends Player {
}

interface SkyTeamGameData extends GameData {
    plane: Plane
}

// ARGS

// NOTIFS
