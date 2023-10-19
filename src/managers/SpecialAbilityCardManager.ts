class SpecialAbilityCardManager  extends CardManager<SpecialAbilityCard> {

    constructor(public game: SkyTeamGame) {
        super(game, {
            getId: (card) => `st-special-ability-card-${card.id}`,
            setupDiv: (card: SpecialAbilityCard, div: HTMLElement) => {
                div.classList.add('st-special-ability-card');

            },
            setupFrontDiv: (card: SpecialAbilityCard, div: HTMLElement) => {
                div.classList.add('st-special-ability')
                div.dataset.type = card.type + '';
                dojo.empty(div)

                const name = document.createElement('h1');
                name.textContent = _(card.name);
                div.appendChild(name);

                const description = document.createElement('p');
                description.innerHTML = _(card.description);
                div.appendChild(description);

                (this.game as any).setTooltip(div.id, this.getTooltipHtml(card));
            },
            cardWidth: 240,
            cardHeight: 158
        })
    }

    public updateRolesThatUsedCard(card: SpecialAbilityCard, rolesThatUsedCard: string[]) {
        if (card && card.type === 2) {
            const cardElement = this.getCardElement(card);
            const frontDiv = cardElement.querySelector('.st-special-ability');
            frontDiv.querySelectorAll('.fa-check-circle').forEach(checkMark => checkMark.remove());
            rolesThatUsedCard.forEach(role => frontDiv.insertAdjacentHTML('beforeend', `<i class="fa fa-check-circle ${role}" aria-hidden="true"></i>`))
        }
    }

    private getTooltipHtml(card) {
        return `
            <div>
                <p><b>${_(card.name)}</b></p>
                <p>${_(card.description)}</p>
            </div>
        `
    }
}