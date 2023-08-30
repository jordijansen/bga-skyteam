class PlaneManager  {

    // TEMP
    private currentApproach = 1;
    private currentAltitude = 1;

    private static readonly PLANE_AXIS_INDICATOR = 'st-plane-axis-indicator';
    private static readonly PLANE_AERODYNAMICS_ORANGE_MARKER = 'st-plane-aerodynamics-orange-marker';
    private static readonly PLANE_AERODYNAMICS_BLUE_MARKER = 'st-plane-aerodynamics-blue-marker';
    private static readonly PLANE_BRAKE_MARKER = 'st-plane-brake-marker';
    private static readonly PLANE_ALTITUDE_TRACK = 'st-altitude-track';
    private static readonly PLANE_APPROACH_TRACK = 'st-approach-track';
    private approachTokenStock: SlotStock<Card>;
    private altitudeTokenStock: SlotStock<Card>;
    private coffeeTokenStock: SlotStock<Card>;
    private rerollTokenStock: AllVisibleDeck<Card>;

    constructor(private game: SkyTeamGame) {

    }

    public setUp(data: SkyTeamGameData) {
        $(PlaneManager.PLANE_AXIS_INDICATOR).dataset.value = data.plane.axis;
        $(PlaneManager.PLANE_AERODYNAMICS_ORANGE_MARKER).dataset.value = data.plane.aerodynamicsOrange;
        $(PlaneManager.PLANE_AERODYNAMICS_BLUE_MARKER).dataset.value = data.plane.aerodynamicsBlue;
        $(PlaneManager.PLANE_BRAKE_MARKER).dataset.value = data.plane.brake;

        $(PlaneManager.PLANE_ALTITUDE_TRACK).dataset.type = data.altitude.type;
        $(PlaneManager.PLANE_APPROACH_TRACK).dataset.type = data.approach.type;

        const approachTokenStockSlots = Object.keys(data.approach.spaces).map(slotId => `st-approach-track-slot-${slotId}`).reverse();
        this.approachTokenStock = new SlotStock(this.game.tokenManager, $('st-approach-track'), {
            slotsIds: approachTokenStockSlots,
            mapCardToSlot: card => `st-approach-track-slot-${card.locationArg}`,
            gap: '1px',
            direction: 'column',
            center: false
        })
        this.approachTokenStock.addCards(Object.values(data.planeTokens).filter(card => card.location === 'approach'));

        const altitudeTokenStockSlots = Object.keys(data.altitude.spaces).map(slotId => `st-altitude-track-slot-${slotId}`).reverse();
        this.altitudeTokenStock = new SlotStock(this.game.tokenManager, $('st-altitude-track'), {
            slotsIds: altitudeTokenStockSlots,
            mapCardToSlot: card => `st-altitude-track-slot-${card.locationArg}`,
            gap: '1px',
            direction: 'column',
            center: false
        })
        this.altitudeTokenStock.addCards(Object.values(data.rerollTokens).filter(card => card.location === 'altitude'));

        this.setApproachAndAltitude(data.plane.approach, data.plane.altitude, true);

        this.coffeeTokenStock = new SlotStock(this.game.tokenManager, $('st-available-coffee'), {
            slotsIds: ['st-available-coffee-1', 'st-available-coffee-2', 'st-available-coffee-3'],
            mapCardToSlot: card => `st-available-coffee-${card.locationArg}`,
            gap: '1px',
            direction: 'column',
            center: false
        })
        this.coffeeTokenStock.addCards(Object.values(data.coffeeTokens).filter(card => card.location === 'available'));


        this.rerollTokenStock = new AllVisibleDeck(this.game.tokenManager, $('st-available-reroll'), {})
        this.rerollTokenStock.addCards(Object.values(data.rerollTokens).filter(card => card.location === 'available'));

        // TEMP
        dojo.connect($(PlaneManager.PLANE_ALTITUDE_TRACK), 'onclick', () => this.updateAltitude(this.currentAltitude + 1))
        dojo.connect($(PlaneManager.PLANE_APPROACH_TRACK), 'onclick', () => this.updateApproach(this.currentApproach + 1))
    }

    public async setApproachAndAltitude(approachValue: number, altitudeValue: number, forceInstant: boolean = false) {
        const wrapper = $('st-main-board-tracks');
        const altitude = $(PlaneManager.PLANE_ALTITUDE_TRACK);
        const approach = $(PlaneManager.PLANE_APPROACH_TRACK);

        const altitudeSize = this.game.gamedatas.altitude.size;
        const approachSize = this.game.gamedatas.approach.size;

        const altitudeHeight = altitude.offsetHeight - 22 - ((altitudeSize - altitudeValue) * 96);
        const approachHeight = approach.offsetHeight - 22 - ((approachSize - approachValue) * 96);

        altitude.style.bottom = `-${altitudeHeight}px`;
        approach.style.bottom = `-${approachHeight}px`;

        const newWrapperHeight = Math.max(altitude.offsetHeight - altitudeHeight, approach.offsetHeight - approachHeight)
        if (this.game.instantaneousMode || forceInstant) {
            wrapper.style.height = `${newWrapperHeight}px`
        } else {
            await delay(1000);
            return wrapper.style.height = `${newWrapperHeight}px`;
        }
    }

    public updateApproach(value: number) {
        this.currentApproach = value;
        return this.setApproachAndAltitude(value, this.currentAltitude);
    }

    public updateAltitude(value: number) {
        this.currentAltitude = value;
        return this.setApproachAndAltitude(this.currentApproach, value);
    }
}