class PlayerSetup {

    public selectedRole = null;

    constructor(private game: SkyTeamGame, private elementId: string) {

    }

    public setUp() {
        this.createRoleCard('pilot');
        this.createRoleCard('co-pilot');


    }

    private createRoleCard(role: string) {
        dojo.place(this.game.playerRoleManager.createRoleCard(role), this.elementId)

        if ((this.game as any).isCurrentPlayerActive()) {
            const element = document.getElementById(`st-role-card-${role}`);
            element.classList.add('selectable');
            dojo.connect(element, 'onclick', () => { this.roleCardClicked(role)})
        }
    }

    private roleCardClicked(role: string) {
        const currentPlayer = this.game.getPlayer(this.game.getPlayerId())
        const otherPlayer = Object.keys(this.game.gamedatas.players)
            .filter(playerId => Number(playerId) !== this.game.getPlayerId())
            .map(playerId => this.game.gamedatas.players[playerId])[0];

        const clickedElement = document.getElementById(`st-role-card-${role}`);
        const otherElement = document.getElementById(`st-role-card-${role === 'pilot' ? 'co-pilot' : 'pilot'}`);

        clickedElement.classList.add('selected');
        clickedElement.classList.remove('selectable');
        dojo.destroy(`st-role-card-playername-${currentPlayer.id}`)
        dojo.place(`<p id="st-role-card-playername-${currentPlayer.id}">${currentPlayer.name}</p>`, clickedElement)

        otherElement.classList.add('selectable');
        otherElement.classList.remove('selected');
        dojo.destroy(`st-role-card-playername-${otherPlayer.id}`)
        dojo.place(`<p id="st-role-card-playername-${otherPlayer.id}">${otherPlayer.name}</p>`, otherElement)




        this.selectedRole = role;
    }
}