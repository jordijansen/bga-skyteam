class PlaneManager  {

    private currentApproach = 1;
    private currentAltitude = 1;

    private static readonly PLANE_AXIS_INDICATOR = 'st-plane-axis-indicator';
    private static readonly PLANE_AERODYNAMICS_ORANGE_MARKER = 'st-plane-aerodynamics-orange-marker';
    private static readonly PLANE_AERODYNAMICS_BLUE_MARKER = 'st-plane-aerodynamics-blue-marker';
    private static readonly PLANE_BRAKE_MARKER = 'st-plane-brake-marker';
    private static readonly PLANE_ALTITUDE_TRACK = 'st-altitude-track';
    private static readonly PLANE_APPROACH_TRACK = 'st-approach-track';
    public approachTokenStock: SlotStock<Card>;
    private altitudeTokenStock: SlotStock<Card>;
    public coffeeTokenStock: SlotStock<Card>;
    public rerollTokenStock: AllVisibleDeck<Card>;

    constructor(private game: SkyTeamGame) {

    }

    public setUp(data: SkyTeamGameData) {
        $(PlaneManager.PLANE_AXIS_INDICATOR).dataset.value = data.plane.axis;
        $(PlaneManager.PLANE_AERODYNAMICS_ORANGE_MARKER).dataset.value = data.plane.aerodynamicsOrange;
        $(PlaneManager.PLANE_AERODYNAMICS_BLUE_MARKER).dataset.value = data.plane.aerodynamicsBlue;
        $(PlaneManager.PLANE_BRAKE_MARKER).dataset.value = data.plane.brake;
        $(PlaneManager.PLANE_ALTITUDE_TRACK).dataset.type = data.altitude.type;
        $(PlaneManager.PLANE_APPROACH_TRACK).dataset.type = data.approach.type;

        this.currentApproach = data.plane.approach;
        this.currentAltitude = data.plane.altitude;

        Object.values(data.plane.switches).forEach((planeSwitch) => {
            dojo.place(`<div id="plane-switch-${planeSwitch.id}" class="st-plane-switch-wrapper" data-value="${planeSwitch.value}"><div class="st-plane-switch token"></div></div>`, $('st-plane-switches'))
        })

        const approachTokenStockSlots = Object.keys(data.approach.spaces).map(slotId => `st-approach-track-slot-${slotId}`).reverse();
        this.approachTokenStock = new SlotStock(this.game.tokenManager, $('st-approach-track'), {
            slotsIds: approachTokenStockSlots,
            mapCardToSlot: card => `st-approach-track-slot-${card.locationArg}`,
            gap: '1px',
            direction: 'column',
            center: false,
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

    }

    public setApproachAndAltitude(approachValue: number, altitudeValue: number, forceInstant: boolean = false) {
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
            return this.game.delay(ANIMATION_MS).then(() => {
                wrapper.style.height = `${newWrapperHeight}px`;
            });
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

    public updateAxis(axis: number) {
        $(PlaneManager.PLANE_AXIS_INDICATOR).dataset.value = axis;
        return this.game.delay(ANIMATION_MS);
    }

    public updateSwitch(planeSwitch: PlaneSwitch) {
        $(`plane-switch-${planeSwitch.id}`).dataset.value = planeSwitch.value;
        return this.game.delay(ANIMATION_MS);
    }

    public updateAerodynamicsBlue(aerodynamicsBlue: number) {
        $(PlaneManager.PLANE_AERODYNAMICS_BLUE_MARKER).dataset.value = aerodynamicsBlue;
        return this.game.delay(ANIMATION_MS);
    }

    public updateAerodynamicsOrange(aerodynamicsOrange: number) {
        $(PlaneManager.PLANE_AERODYNAMICS_ORANGE_MARKER).dataset.value = aerodynamicsOrange;
        return this.game.delay(ANIMATION_MS);
    }

    public updateBrake(brake: number) {
        $(PlaneManager.PLANE_BRAKE_MARKER).dataset.value = brake;
        return this.game.delay(ANIMATION_MS);
    }
}