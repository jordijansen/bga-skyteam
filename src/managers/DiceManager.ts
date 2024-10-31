class DiceManager extends CardManager<Dice> {

    private static readonly PLAYER_AREA = 'st-player-dice';
    private static readonly OTHER_PLAYER_AREA = 'st-other-player-dice';
    public static readonly TRAFFIC_DICE = 'st-traffic-dice-stock';
    public static readonly INTERN_DICE = 'st-intern-dice-stock';

    public playerDiceStock: LineStock<Dice>;
    public otherPlayerDiceStock: VoidStock<Dice>;
    public trafficDiceStock: LineStock<Dice>;
    public internDiceStock: SlotStock<Dice>;

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

        this.playerDiceStock = new LineStock(this, element, { center: true, gap: '16px', sort: sortFunction('type')})
        dojo.place(`<div id="${DiceManager.OTHER_PLAYER_AREA}"></div>`, `player_board_${Object.keys(this.game.gamedatas.players).find(playerId => Number(playerId) !== Number(this.game.getPlayerId()))}`)
        this.otherPlayerDiceStock = new VoidStock<Dice>(this, $(DiceManager.OTHER_PLAYER_AREA))
        this.trafficDiceStock = new LineStock<Dice>(this, $(DiceManager.TRAFFIC_DICE), { wrap: 'nowrap'})
        this.trafficDiceStock.addCards(data.trafficDice);

        const internDiceSlots = [0,1,2,3,4,5].map(slotId => `st-intern-slot-${slotId}`);
        this.internDiceStock = new SlotStock<Dice>(this, $(DiceManager.INTERN_DICE), {
            slotsIds: internDiceSlots,
            mapCardToSlot: card => `st-intern-slot-${card.locationArg}`,
            gap: '22.5px',
            direction: 'row',
            center: false
        })
        this.internDiceStock.addCards(data.internDice);

        const player = data.players[this.game.getPlayerId()];
        if (player) {
            if (player.dice) {
                this.playerDiceStock.addCards(player.dice);
            }
        }
    }

    public updateDieValue(die: Dice, silent = false): void {
        if (!silent) {
            const dieElementId = this.getId(die);
            const dieElement = $(dieElementId);
            if (dieElement) {
                dieElement.dataset['value'] = String(die.side);
            }
        }

        const stock = this.getCardStock(die);
        if (stock) {
            this.updateCardInformations(die);
        }
    }

    updateDieValueVisual(die: Dice): void {
        const dieElementId = this.getId(die);
        const dieElement = $(dieElementId);
        if (dieElement) {
            dieElement.dataset['value'] = String(die.side);
        }

    }

    public setSelectionMode(selectionMode, onSelectedActionSpaceChanged?: (selection: Dice[]) => void, allowedValues?: number[], allowedDieTypes?: string[], autoSelectIfOnly1Die: boolean = true) {
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

            if (autoSelectIfOnly1Die && selectableDice.length === 1) {
                this.playerDiceStock.selectCard(selectableDice[0]);
            }
        }
    }

    public toggleShowPlayerDice(show: boolean) {
        $(DiceManager.PLAYER_AREA).style.display = show ? 'flex' : 'none';
    }
}