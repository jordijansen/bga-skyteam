class SpendCoffee {

    private static readonly ELEMENT_ID = 'st-spend-coffee';

    public currentDie = null;
    private originalValue = 0;
    private minValue = 0;
    private maxValue = 0;
    constructor(private game: SkyTeamGame, private parentId: string) {
        dojo.place(`<div id="${SpendCoffee.ELEMENT_ID}"></div>`, $(this.parentId))
    }

    public initiate(die: Dice, nrOfCoffeeTokens: number, onCoffeeSpend: (die: Dice) => void) {
        const element = $(SpendCoffee.ELEMENT_ID);
        this.destroy();

        if (this.currentDie) {
            this.currentDie.side = this.originalValue;
            this.game.diceManager.updateCardInformations(this.currentDie);
        }

        if (nrOfCoffeeTokens > 0) {
            this.currentDie = die;
            this.originalValue = die.side;
            this.minValue = Math.max(die.side - nrOfCoffeeTokens, 1);
            this.maxValue = Math.min(die.side + nrOfCoffeeTokens, 6);

            let content = '';

            content += `<a id="st-spend-coffee-decrease" class="bgabutton bgabutton_blue">-1</a>`;
            content += `<a id="st-spend-coffee-total-cost" class="bgabutton bgabutton_gray disabled"></a>`;
            content += `<a id="st-spend-coffee-increase" class="bgabutton bgabutton_blue">+1</a>`;

            dojo.place(content, element);

            this.updateButtonsDisabledState(die);
            this.updateTotalCost();

            const decreaseButton = $('st-spend-coffee-decrease');
            dojo.connect(decreaseButton, 'onclick', (event) => {
                dojo.stopEvent(event);
                die.side = die.side - 1;
                this.updateButtonsDisabledState(die);
                this.updateTotalCost();
                this.game.diceManager.updateCardInformations(die);
                onCoffeeSpend(die);
            })

            const increaseButton = $('st-spend-coffee-increase');
            dojo.connect(increaseButton, 'onclick', (event) => {
                dojo.stopEvent(event);
                die.side = die.side + 1;
                this.updateButtonsDisabledState(die);
                this.updateTotalCost();
                this.game.diceManager.updateCardInformations(die);
                onCoffeeSpend(die);
            })
        }
    }

    public destroy() {
        const element = $(SpendCoffee.ELEMENT_ID);
        dojo.empty(element);
    }

    public getCoffeeSpend() {
        return -Math.abs(this.currentDie.side - this.originalValue);
    }

    private updateTotalCost() {
        const totalCost = $('st-spend-coffee-total-cost');
        dojo.empty(totalCost);
        dojo.place(`<span>${dojo.string.substitute(_("Cost: ${totalCost}"), { totalCost: this.getCoffeeSpend() })} <span class="st-token small token" data-type="coffee"></span></span>`, totalCost)
    }

    private updateButtonsDisabledState(die: Dice) {
        const increaseButton = $('st-spend-coffee-increase');
        const decreaseButton = $('st-spend-coffee-decrease');
        increaseButton.classList.remove('disabled');
        decreaseButton.classList.remove('disabled');

        if (die.side == this.minValue) {
            decreaseButton.classList.add('disabled');
        }
        if (die.side == this.maxValue) {
            increaseButton.classList.add('disabled');
        }
    }
}