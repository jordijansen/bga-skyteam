class PlayerRoleManager  {
    constructor(private game: SkyTeamGame) {

    }

    public setUp(data: SkyTeamGameData) {


        Object.keys(data.players).forEach(playerId => {
            dojo.place(`<div id="st-role-card-wrapper-${playerId}" class="st-role-card-wrapper"></div>`, `player_board_${playerId}`)
            const player = data.players[playerId];
            if (player.role) {
                dojo.place(this.createRoleCard(player.role), `st-role-card-wrapper-${playerId}`);
            }
        });
    }

    public createRoleCard(role: string) {
        return `<div id="st-role-card-${role}" class="st-role-card" data-type="${role}"><p>${_(role)}</p></div>`;
    }

    public setRole(playerId: number, role: string, roleColor: string) {
        this.game.gamedatas.players[playerId].color = roleColor;
        this.game.gamedatas.players[playerId].role = role as any;

        const element = document.querySelector(`#player_name_${playerId} a`) as HTMLElement;
        element.style.color = `#${roleColor}`;

        dojo.place(this.createRoleCard(role), `st-role-card-${role}`, 'replace');

        return this.game.animationManager.play( new BgaAttachWithAnimation({
            animation: new BgaSlideAnimation({ element: $(`st-role-card-${role}`), transitionTimingFunction: 'ease-out' }),
            attachElement: document.getElementById(`st-role-card-wrapper-${playerId}`)
        }))
    }
}