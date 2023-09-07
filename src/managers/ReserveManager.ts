class ReserveManager  {
    private static readonly TOKEN_RESERVE_COFFEE = 'st-token-reserve-coffee';
    private static readonly TOKEN_RESERVE_PLANE = 'st-token-reserve-coffee';
    private static readonly TOKEN_RESERVE_REROLL = 'st-token-reserve-coffee';
    public reserveCoffeeStock: LineStock<Card>;
    public reserveRerollStock: VoidStock<Card>;
    public reservePlaneStock: VoidStock<Card>;
    constructor(private game: SkyTeamGame) {

    }

    public setUp(data: SkyTeamGameData) {
        this.reserveCoffeeStock = new LineStock(this.game.tokenManager, $(ReserveManager.TOKEN_RESERVE_COFFEE), {center: true, direction: 'column'})
        this.reserveRerollStock = new VoidStock(this.game.tokenManager, $(ReserveManager.TOKEN_RESERVE_REROLL))
        this.reservePlaneStock = new VoidStock(this.game.tokenManager, $(ReserveManager.TOKEN_RESERVE_PLANE))

        this.reserveCoffeeStock.addCards(Object.values(data.coffeeTokens).filter(card => card.location === 'reserve'));
        this.reserveRerollStock.addCards(Object.values(data.rerollTokens).filter(card => card.location === 'reserve'));
        this.reservePlaneStock.addCards(Object.values(data.planeTokens).filter(card => card.location === 'reserve'));
    }
}