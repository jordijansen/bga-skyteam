interface Plane {
    axis: number;
    aerodynamicsBlue: number;
    aerodynamicsOrange: number,
    brake: number
}

interface SkyTeamGame extends Game {
    playerRoleManager: PlayerRoleManager;
    animationManager: AnimationManager,
    gamedatas: SkyTeamGameData;
    getPlayerId(): number;
    getPlayer(playerId: number): SkyTeamPlayer;
    isReadOnly(): boolean;
    setTooltipToClass(className: string, html: string): void;
    formatWithIcons(description: string): string
}

interface SkyTeamPlayer extends Player {
    role: 'pilot'|'co-pilot'
}

interface SkyTeamGameData extends GameData {
    plane: Plane
}

// ARGS

// NOTIFS
interface NotifPlayerRoleAssigned {
    playerId: number,
    roleColor: string;
    role: string;
}
