class SpendCoffee {

    private static readonly ELEMENT_ID = 'st-spend-coffee';

    public currentDie = null;
    private originalSide = 0;
    private originalValue = 0;
    private minValue = 0;
    private maxValue = 0;
    constructor(private game: SkyTeamGame, private parentId: string) {
        dojo.place(`<div id="${SpendCoffee.ELEMENT_ID}"></div>`, $(this.parentId))
    }

    public initiate(die: Dice, nrOfCoffeeTokens: number, onCoffeeSpend: (die: Dice) => void) {
        const element = $(SpendCoffee.ELEMENT_ID);
        dojo.empty(element);

        if (this.currentDie) {
            this.currentDie.side = this.originalSide;
            this.currentDie.value = this.originalValue;
            this.game.diceManager.updateCardInformations(this.currentDie);
        }

        if (nrOfCoffeeTokens > 0) {
            this.currentDie = die;
            this.originalSide = die.side;
            this.originalValue = die.value;
            this.minValue = Math.max(die.value - nrOfCoffeeTokens, die.type === 'traffic' ? 2 : 1);
            this.maxValue = Math.min(die.value + nrOfCoffeeTokens,  die.type === 'traffic' ? 5 : 6);

            let content = '';

            content += `<a id="st-spend-coffee-decrease" class="bgabutton bgabutton_blue"> <i class="fa fa-minus" aria-hidden="true"></i> </a>`;
            content += `<a id="st-spend-coffee-total-cost" class="bgabutton bgabutton_gray disabled"></a>`;
            content += `<a id="st-spend-coffee-increase" class="bgabutton bgabutton_blue"> <i class="fa fa-plus" aria-hidden="true"></i> </a>`;

            dojo.place(content, element);

            this.updateButtonsDisabledState(die);
            this.updateTotalCost();

            const decreaseButton = $('st-spend-coffee-decrease');
            dojo.connect(decreaseButton, 'onclick', (event) => {
                dojo.stopEvent(event);
                die.value = die.value - 1;
                die.side = this.determineNewSide(die);
                this.updateButtonsDisabledState(die);
                this.updateTotalCost();
                this.game.diceManager.updateCardInformations(die);
                onCoffeeSpend(die);
            })

            const increaseButton = $('st-spend-coffee-increase');
            dojo.connect(increaseButton, 'onclick', (event) => {
                dojo.stopEvent(event);
                die.value = die.value + 1;
                die.side = this.determineNewSide(die);
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

        this.currentDie = null;
    }

    public getCoffeeSpend() {
        return Math.abs(this.currentDie.value - this.originalValue);
    }

    private updateTotalCost() {
        const totalCost = $('st-spend-coffee-total-cost');
        dojo.empty(totalCost);
        dojo.place(`<span>${dojo.string.substitute(_("Use: ${totalCost}"), { totalCost: this.getCoffeeSpend() })} <span class="st-token small token" data-type="coffee"></span></span>`, totalCost)
    }

    private updateButtonsDisabledState(die: Dice) {
        const increaseButton = $('st-spend-coffee-increase');
        const decreaseButton = $('st-spend-coffee-decrease');
        increaseButton.classList.remove('disabled');
        decreaseButton.classList.remove('disabled');

        if (die.value == this.minValue) {
            decreaseButton.classList.add('disabled');
        }
        if (die.value == this.maxValue) {
            increaseButton.classList.add('disabled');
        }
    }

    private determineNewSide(die: Dice) {
        if (die.type !== "traffic") {
            return die.value;
        } else {
            if (die.value === 2) {
                return 1;
            } else if (die.value === 3) {
                return 2;
            } else if (die.value === 4) {
                return 4;
            } else if (die.value === 5) {
                return 6;
            }
        }
    }
}