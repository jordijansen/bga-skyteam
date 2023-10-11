class DiceManager extends CardManager<Dice> {

    private static readonly PLAYER_AREA = 'st-player-dice';
    private static readonly OTHER_PLAYER_AREA = 'st-other-player-dice';
    public static readonly TRAFFIC_DICE = 'st-traffic-dice-stock';

    public playerDiceStock: LineStock<Dice>;
    public otherPlayerDiceStock: VoidStock<Dice>;
    public trafficDiceStock: LineStock<Dice>;

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
            cardWidth: 58,
            cardHeight: 58
        })
    }

    public setUp(data: SkyTeamGameData) {
        const element = $(DiceManager.PLAYER_AREA);

        this.playerDiceStock = new LineStock(this, element, { center: true, gap: '16px'})
        dojo.place(`<div id="${DiceManager.OTHER_PLAYER_AREA}"></div>`, `player_board_${Object.keys(this.game.gamedatas.players).find(playerId => Number(playerId) !== Number(this.game.getPlayerId()))}`)
        this.otherPlayerDiceStock = new VoidStock<Dice>(this, $(DiceManager.OTHER_PLAYER_AREA))
        this.trafficDiceStock = new LineStock<Dice>(this, $(DiceManager.TRAFFIC_DICE), {})

        this.trafficDiceStock.addCards(data.trafficDice);

        const player = data.players[this.game.getPlayerId()];
        if (player) {
            if (player.dice) {
                this.playerDiceStock.addCards(player.dice);
            }
        }
    }

    public updateDieValue(die: Dice): void {
        const dieElementId = this.getId(die);
        const dieElement = $(dieElementId);
        if (dieElement) {
            dieElement.dataset['value'] = String(die.side);
        }
        const stock = this.getCardStock(die);
        if (stock) {
            this.updateCardInformations(die);
        }
    }

    public setSelectionMode(selectionMode, onSelectedActionSpaceChanged?: (selection: Dice[]) => void, allowedValues?: number[], allowedDieTypes?: string[]) {
        if (this.playerDiceStock) {
            let  selectableDice = this.playerDiceStock.getCards();
            if (allowedValues && allowedValues.length > 0) {
                selectableDice = selectableDice.filter(die => allowedValues.includes(die.value))
            }
            if (allowedDieTypes && allowedDieTypes.length > 0) {
                selectableDice = selectableDice.filter(die => allowedDieTypes.includes(die.type))
            }
            this.playerDiceStock.setSelectionMode(selectionMode, selectableDice);
            this.playerDiceStock.onSelectionChange = onSelectedActionSpaceChanged

            if (selectableDice.length === 1) {
                this.playerDiceStock.selectCard(selectableDice[0]);
            }
        }
    }

    public toggleShowPlayerDice(show: boolean) {
        $(DiceManager.PLAYER_AREA).style.display = show ? 'flex' : 'none';
    }
}