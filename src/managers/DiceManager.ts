class DiceManager  {

    private static readonly PLAYER_AREA = 'st-player-dice';
    constructor(private game: SkyTeamGame) {

    }

    public setUp(data: SkyTeamGameData) {
        const player = data.players[this.game.getPlayerId()];
        this.createDice(player.dice);
    }

    public createDie(die: Dice) {
        const element = `<div id="st-dice-${die.id}" class="st-dice" data-type="${die.typeArg}" data-side="${die.side}">
                    <div class="side" data-side="1"></div>
                    <div class="side" data-side="2"></div>
                    <div class="side" data-side="3"></div>
                    <div class="side" data-side="4"></div>
                    <div class="side" data-side="5"></div>
                    <div class="side" data-side="6"></div>
                </div>`;

        if (die.location === 'player') {
            dojo.place(element, DiceManager.PLAYER_AREA)
        }
    }

    public createDice(dice: Dice[]) {
        dice.forEach(die => this.createDie(die));
    }
}