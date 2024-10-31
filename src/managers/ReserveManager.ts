class ReserveManager  {
    private static readonly TOKEN_RESERVE_COFFEE = 'st-token-reserve-coffee';
    private static readonly TOKEN_RESERVE_PLANE = 'st-token-reserve-plane';
    private static readonly TOKEN_RESERVE_REROLL = 'st-token-reserve-reroll';
    public reserveCoffeeStock: CardStock<Card>;
    public reserveRerollStock: CardStock<Card>;
    public reservePlaneStock: CardStock<Card>;
    constructor(private game: SkyTeamGame) {

    }

    public setUp(data: SkyTeamGameData) {
        this.reserveCoffeeStock = new AllVisibleDeck(this.game.tokenManager, $(ReserveManager.TOKEN_RESERVE_COFFEE), { counter: {show: true}, shift: '1' })
        this.reserveRerollStock = new AllVisibleDeck(this.game.tokenManager, $(ReserveManager.TOKEN_RESERVE_REROLL), {counter: {show: true}, shift: '1'})
        this.reservePlaneStock = new AllVisibleDeck(this.game.tokenManager, $(ReserveManager.TOKEN_RESERVE_PLANE), {counter: {show: true}, shift: '1'})

        this.reserveCoffeeStock.addCards(Object.values(data.coffeeTokens).filter(card => card.location === 'reserve'));
        this.reserveRerollStock.addCards(Object.values(data.rerollTokens).filter(card => card.location === 'reserve'));
        this.reservePlaneStock.addCards (Object.values(data.planeTokens).filter(card => card.location === 'reserve'));

        if (data.scenario.modules.includes('penguins')) {
            (this.game as any).setTooltip(ReserveManager.TOKEN_RESERVE_PLANE, this.getTooltipHtml('Penguin token reserve', '<b>This scenario uses Penguins instead of Plane tokens. We know very well that Penguins don\'t fly... but look at how CUTE they are!!</b><br/>Shows the number of Penguin tokens in the reserve. During the scenario set-up a number of Penguin tokens are added to the approach track. Additional Penguin tokens can be added to the approach track when playing with the `Traffic` module. If the Penguin token reserve is depleted, no Penguin tokens can be added to the Approach track. Total number of Penguin tokens: 12.'));
        } else {
            (this.game as any).setTooltip(ReserveManager.TOKEN_RESERVE_PLANE, this.getTooltipHtml('Plane token reserve', 'Shows the number of Plane tokens in the reserve. During the scenario set-up a number of plane tokens are added to the approach track. Additional plane tokens can be added to the approach track when playing with the `Traffic` module. If the Plane token reserve is depleted, no Plane tokens can be added to the Approach track. Total number of Plane tokens: 12.'));
        }
        (this.game as any).setTooltip(ReserveManager.TOKEN_RESERVE_REROLL, this.getTooltipHtml('Re-roll token reserve', 'Shows the number of Re-roll tokens in the reserve. You can gain re-roll tokens by reaching certain altitude levels on the altitude track or by using the `Mastery` Special Ability (only in advanced scenarios). You can not gain more Re-roll tokens if the reserve is depleted. Total number of Re-roll tokens: 3.'));
        (this.game as any).setTooltip(ReserveManager.TOKEN_RESERVE_COFFEE, this.getTooltipHtml('Coffee reserve', 'Shows the number of Coffee tokens in the reserve. You can gain Coffee tokens by placing dice on the the `Concentration` action spaces or by using the `Control` Special Ability (only in advanced scenarios). You can not gain more Coffee tokens if the reserve is depleted. Total number of Coffee tokens: 3.'));
    }

    private getTooltipHtml(title, description) {
        return `
            <div>
                <p><b>${_(title)}</b></p>
                <p>${_(description)}</p>
            </div>
        `
    }
}