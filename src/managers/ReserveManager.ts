class ReserveManager  {
    private static readonly TOKEN_RESERVE_COFFEE = 'st-token-reserve-coffee';
    private static readonly TOKEN_RESERVE_PLANE = 'st-token-reserve-coffee';
    private static readonly TOKEN_RESERVE_REROLL = 'st-token-reserve-coffee';
    public reserveCoffeeStock: LineStock<Card>;
    public reserveRerollStock: LineStock<Card>;
    public reservePlaneStock: LineStock<Card>;
    constructor(private game: SkyTeamGame) {

    }

    public setUp(data: SkyTeamGameData) {
        this.reserveCoffeeStock = new LineStock(this.game.tokenManager, $(ReserveManager.TOKEN_RESERVE_COFFEE), {center: true})
        this.reserveRerollStock = new LineStock(this.game.tokenManager, $(ReserveManager.TOKEN_RESERVE_REROLL), {center: true})
        this.reservePlaneStock = new LineStock(this.game.tokenManager, $(ReserveManager.TOKEN_RESERVE_PLANE), {center: true})

        this.reserveCoffeeStock.addCards(Object.values(data.coffeeTokens).filter(card => card.location === 'reserve'));
        this.reserveRerollStock.addCards(Object.values(data.rerollTokens).filter(card => card.location === 'reserve'));
        this.reservePlaneStock.addCards(Object.values(data.planeTokens).filter(card => card.location === 'reserve'));
    }
}