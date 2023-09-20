class PlayerSetup {

    private roleCardsElementId = 'st-player-setup-role-cards';
    private specialAbilityCardsElementId = 'st-player-setup-special-abilities';

    public selectedRole = null;
    public selectedSpecialAbilities = [];
    private specialAbilityCardsStock: LineStock<SpecialAbilityCard>;

    constructor(private game: SkyTeamGame, private elementId: string,) {

    }

    public destroy() {
        dojo.empty($(this.elementId))
    }

    public setUp(args: PlayerSetupArgs) {
        dojo.place(`<h2>${_('Select Role')}</h2>`, this.elementId)
        dojo.place(`<div id="${this.roleCardsElementId}"></div>`, this.elementId)

        this.createRoleCard('pilot');
        this.createRoleCard('co-pilot');

        if (args.specialAbilities && args.specialAbilities.length > 0) {
            dojo.place(`<h2>${dojo.string.substitute(_('Select ${nr} Special Ability Card(s)'), { nr: args.nrOfSpecialAbilitiesToSelect })}</h2>`, this.elementId)
            dojo.place(`<div id="${this.specialAbilityCardsElementId}"></div>`, this.elementId)

            this.specialAbilityCardsStock = new LineStock(this.game.specialAbilityCardManager, $(this.specialAbilityCardsElementId), {wrap: 'wrap', gap: '18px'});
            this.specialAbilityCardsStock.addCards(args.specialAbilities);

            if ((this.game as any).isCurrentPlayerActive()) {
                this.specialAbilityCardsStock.setSelectionMode('multiple');
                this.specialAbilityCardsStock.onSelectionChange = (selection) => {
                    if (selection.length == args.nrOfSpecialAbilitiesToSelect) {
                        this.specialAbilityCardsStock.setSelectableCards(selection);
                    } else {
                        this.specialAbilityCardsStock.setSelectableCards(this.specialAbilityCardsStock.getCards());
                    }
                    this.selectedSpecialAbilities = selection;
                }
            }
        }
    }

    private createRoleCard(role: string) {
        dojo.place(this.game.playerRoleManager.createRoleCard(role), this.roleCardsElementId)

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