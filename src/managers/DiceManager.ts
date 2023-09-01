class DiceManager extends CardManager<Dice> {

    private static readonly PLAYER_AREA = 'st-player-dice';
    public playerDiceStock: LineStock<Dice>;
    constructor(public game: SkyTeamGame) {
        super(game, {
            getId: (die) => `st-dice-${die.id}`,
            setupDiv: (die: Dice, div: HTMLElement) => {
                div.classList.add('st-dice')
                div.dataset['type'] = die.typeArg;
                div.dataset['value'] = String(die.side);

                [1,2,3,4,5,6].forEach(side => {
                    const sideDiv = document.createElement('div');
                    sideDiv.classList.add('side');
                    sideDiv.dataset['side'] = String(side);
                    div.appendChild(sideDiv);
                });
            },
            cardWidth: 50,
            cardHeight: 50
        })
    }

    public setUp(data: SkyTeamGameData) {
        this.playerDiceStock = new LineStock(this, $(DiceManager.PLAYER_AREA), {})

        const player = data.players[this.game.getPlayerId()];
        if (player && player.dice) {
            this.playerDiceStock.addCards(player.dice);
        }
    }

    public override updateCardInformations(die: Dice, settings?: Omit<FlipCardSettings, 'updateData'>): void {
        super.updateCardInformations(die, settings);
        const cardElement = this.getCardElement(die);
        cardElement.dataset['value'] = String(die.side);
        console.log(die.side);
    }

    public setSelectionMode(selectionMode, onSelectedActionSpaceChanged?: (selection: Dice[]) => void, allowedValues?: number[]) {
        if (this.playerDiceStock) {
            let  selectableDice = this.playerDiceStock.getCards();
            if (allowedValues && allowedValues.length > 0) {
                selectableDice = selectableDice.filter(die => allowedValues.includes(die.side))
            }
            this.playerDiceStock.setSelectionMode(selectionMode, selectableDice);
            this.playerDiceStock.onSelectionChange = onSelectedActionSpaceChanged
        }
    }
}