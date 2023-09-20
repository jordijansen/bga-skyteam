class SpecialAbilityCardManager  extends CardManager<SpecialAbilityCard> {

    constructor(public game: SkyTeamGame) {
        super(game, {
            getId: (card) => `st-special-ability-card-${card.id}`,
            setupDiv: (card: SpecialAbilityCard, div: HTMLElement) => {
                div.classList.add('st-special-ability-card')
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
            },
            cardWidth: 240,
            cardHeight: 158
        })
    }
}