class AlarmTokenManager  extends CardManager<AlarmToken> {

    constructor(public game: SkyTeamGame) {
        super(game, {
            getId: (token) => `st-token-${token.id}`,
            setupDiv: (token: AlarmToken, div: HTMLElement) => {
                div.classList.add('token')
                div.classList.add('st-alarm-token')
            },
            setupFrontDiv: (token: AlarmToken, div: HTMLElement) => {
                div.classList.add('st-alarm-token-art')
                div.dataset.type = token.typeArg + '';
            },
            setupBackDiv: (token: AlarmToken, div: HTMLElement) => {
                div.classList.add('st-alarm-token-art')
                div.dataset.type = 'back';
            },
            isCardVisible: (token: AlarmToken) => token.isActive,
            cardWidth: 137,
            cardHeight: 72
        })
    }
}