class TokenManager  extends CardManager<Card> {

    private static readonly COFFEE_RESERVE = 'st-coffee-reserve';
    constructor(public game: SkyTeamGame) {
        super(game, {
            getId: (token) => `st-token-${token.id}`,
            setupDiv: (token: Card, div: HTMLElement) => {
                div.classList.add('token')
                div.classList.add('st-token')
                div.dataset.type = token.type
            },
            setupFrontDiv: (token: Card, div: HTMLElement) => {
            },
            cardWidth: 50,
            cardHeight: 50
        })
    }
}