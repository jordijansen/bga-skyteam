class PlaneManager  {

    public currentApproach = 1;
    private currentAltitude = 1;
    public currentAxis = 1;
    private currentWindModifier = 0;
    private currentSpeedMode = 'engines';

    private static readonly PLANE_AXIS_INDICATOR = 'st-plane-axis-indicator';
    private static readonly PLANE_AERODYNAMICS_ORANGE_MARKER = 'st-plane-aerodynamics-orange-marker';
    private static readonly PLANE_AERODYNAMICS_BLUE_MARKER = 'st-plane-aerodynamics-blue-marker';
    private static readonly PLANE_SPEED_GREEN_MARKER = 'st-plane-speed-green-marker';
    private static readonly PLANE_BRAKE_MARKER = 'st-plane-brake-marker';
    private static readonly KEROSENE_MARKER = 'st-kerosene-marker';
    private static readonly WINDS_PLANE = 'st-winds-plane';
    private static readonly PLANE_ALTITUDE_TRACK = 'st-altitude-track';
    private static readonly PLANE_APPROACH_TRACK = 'st-approach-track';
    public approachTokenStock: SlotStock<Card>;
    private altitudeTokenStock: SlotStock<Card>;
    public coffeeTokenStock: SlotStock<Card>;
    public rerollTokenStock: AllVisibleDeck<Card>;
    public specialAbilityCardStock: LineStock<SpecialAbilityCard>
    public alarmTokenStock: SlotStock<Card>;


    constructor(private game: SkyTeam) {

    }

    public setUp(data: SkyTeamGameData) {
        $(PlaneManager.PLANE_AXIS_INDICATOR).dataset.value = data.plane.axis;
        $(PlaneManager.PLANE_AERODYNAMICS_ORANGE_MARKER).dataset.value = data.plane.aerodynamicsOrange;
        $(PlaneManager.PLANE_AERODYNAMICS_BLUE_MARKER).dataset.value = data.plane.aerodynamicsBlue;
        $(PlaneManager.PLANE_BRAKE_MARKER).dataset.value = data.plane.brake;
        $(PlaneManager.KEROSENE_MARKER).dataset.value = data.plane.kerosene;
        $(PlaneManager.WINDS_PLANE).dataset.value = data.plane.wind;
        $(PlaneManager.PLANE_ALTITUDE_TRACK).dataset.type = data.altitude.type;
        $(PlaneManager.PLANE_ALTITUDE_TRACK).style.left = this.calculateLeftOffsetForTrack(data, 332);
        $(PlaneManager.PLANE_APPROACH_TRACK).dataset.type = data.approach.type;
        $(PlaneManager.PLANE_APPROACH_TRACK).style.left = this.calculateLeftOffsetForTrack(data, 103);
        $('st-main-board-wrapper').style.width = this.calculatePlaneWidth(data) + 'px';

        this.currentApproach = data.plane.approach;
        this.currentAltitude = data.plane.altitude;
        this.currentAxis = data.plane.axis;
        this.currentWindModifier = Number(data.plane.windModifier);

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

        this.rerollTokenStock = new AllVisibleDeck(this.game.tokenManager, $('st-available-reroll'), {verticalShift: '-10px', horizontalShift: '0px'})
        this.rerollTokenStock.addCards(Object.values(data.rerollTokens).filter(card => card.location === 'available'));

        this.specialAbilityCardStock = new LineStock(this.game.specialAbilityCardManager, $('st-main-board-special-abilities'), {direction: 'column'})
        this.specialAbilityCardStock.addCards(data.chosenSpecialAbilities);
        this.game.specialAbilityCardManager.updateRolesThatUsedCard(data.chosenSpecialAbilities.find(card => card.type === 2), data.rolesThatUsedAdaptation)

        this.alarmTokenStock = new SlotStock<Card>(this.game.alarmTokenManager, $('st-alarm-tokens-stock'), {
            slotsIds: [1, 2, 3, 4, 5, 6],
            mapCardToSlot: (card) => card.typeArg,
            gap: '10.4px',
            direction: 'column'
        })
        this.alarmTokenStock.addCards(data.alarmTokens);

        dojo.connect($('st-approach-help'), 'onclick', (event)=>this.game.helpDialogManager.showApproachHelp(event));
        dojo.connect($('st-altitude-help'), 'onclick', (event)=>this.game.helpDialogManager.showAltitudeHelp(event));

        console.log(data.scenario.modules);
        if(!data.scenario.modules.includes('kerosene') && !data.scenario.modules.includes('kerosene-leak')) {
            $('st-kerosene-board').style.display = 'none';
        }
        if (data.scenario.modules.includes('kerosene')) {
            $('st-kerosene-leak-marker').style.display = 'none';
        }
        if (data.scenario.modules.includes('kerosene-leak')) {
            dojo.connect($(`st-kerosene-leak-help`), 'onclick', (event) => this.game.helpDialogManager.showModuleHelp(event, 'kerosene-leak'))
        }

        if(!data.scenario.modules.includes('winds') && !data.scenario.modules.includes('winds-headon')) {
            $('st-winds-board').style.display = 'none';
        } else {
            const module = data.scenario.modules.includes('winds') ? 'winds' : 'winds-headon';
            $('st-winds-board').classList.add(module)
            dojo.connect($(`st-winds-help`), 'onclick', (event) => this.game.helpDialogManager.showModuleHelp(event, module))
        }
        if(!data.scenario.modules.includes('intern')) {
            $('st-intern-board').style.display = 'none';
        }
        if(!data.scenario.modules.includes('ice-brakes')) {
            $('st-ice-brakes-board').style.display = 'none';
        }
        if(!data.scenario.modules.includes('alarms')) {
            $('st-alarms-board').style.display = 'none';
        }
        if(data.scenario.modules.includes('ice-brakes')) {
            $(PlaneManager.PLANE_BRAKE_MARKER).classList.add('ice-brakes');
        }

        if (!data.scenario.modules.includes('engine-loss')) {
            $('st-engine-loss-marker-1').style.display = 'none';
            $('st-engine-loss-marker-2').style.display = 'none';
        } else {
            dojo.connect($(`st-engine-loss-help-1`), 'onclick', (event) => this.game.helpDialogManager.showModuleHelp(event, 'engine-loss'))
            dojo.connect($(`st-engine-loss-help-2`), 'onclick', (event) => this.game.helpDialogManager.showModuleHelp(event, 'engine-loss'))
        }

        if (!data.scenario.modules.includes('stuck-landing-gear')) {
            $('st-stuck-landing-gear-marker-1').style.display = 'none';
            $('st-stuck-landing-gear-marker-2').style.display = 'none';
            $('st-stuck-landing-gear-marker-3').style.display = 'none';
        } else {
            dojo.connect($(`st-stuck-landing-gear-help-1`), 'onclick', (event) => this.game.helpDialogManager.showModuleHelp(event, 'stuck-landing-gear'))
            dojo.connect($(`st-stuck-landing-gear-help-2`), 'onclick', (event) => this.game.helpDialogManager.showModuleHelp(event, 'stuck-landing-gear'))
            dojo.connect($(`st-stuck-landing-gear-help-3`), 'onclick', (event) => this.game.helpDialogManager.showModuleHelp(event, 'stuck-landing-gear'))
        }

        this.updateSpeedMarker();
    }

    public calculatePlaneWidth(data) {
        let result = 607; // Main board

        // LEFT SIDE
        if (data.scenario.modules.includes('kerosene') || data.scenario.modules.includes('kerosene-leak')) {
            result += 118;
        }
        if (data.scenario.modules.includes('alarms')) {
            result += 155;
        }
        if (!data.scenario.modules.includes('kerosene') && !data.scenario.modules.includes('kerosene-leak') && !data.scenario.modules.includes('alarms')) {
            result += 55;
        }
        // RIGHT SIDE
        if (data.scenario.modules.includes('special-abilities')) {
            result += 288;
        } else if (data.scenario.modules.includes('winds') || data.scenario.modules.includes('winds-headon')) {
            result += 278;
        } else {
            result += 0;
        }

        return result;
    }

    private calculateLeftOffsetForTrack(data, baseOffset = 0) {
        let result = baseOffset;
        if (data.scenario.modules.includes('kerosene') || data.scenario.modules.includes('kerosene-leak')) {
            result += 118;
        }
        if (data.scenario.modules.includes('alarms')) {
            result += 155;
        }
        if (!data.scenario.modules.includes('kerosene') && !data.scenario.modules.includes('kerosene-leak') && !data.scenario.modules.includes('alarms')) {
            result += 55;
        }

        return `${result}px`;
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
        return this.game.delay(ANIMATION_MS).then(() => {
            wrapper.style.height = `${newWrapperHeight}px`;
        });
    }

    public updateSpeedMarker(extra: number = 0) {
        const element = $(PlaneManager.PLANE_SPEED_GREEN_MARKER);
        element.dataset['mode'] = this.currentSpeedMode;
        if (this.game.gamedatas.scenario.modules.includes('ice-brakes')) {
            element.classList.add('ice-brakes')
        }

        let speed = this.currentWindModifier + extra;

        const die1 = this.game.actionSpaceManager.getDieInLocation('engines-1')
        if (die1) {
            speed += die1.value;
        }

        const die2 = this.game.actionSpaceManager.getDieInLocation('engines-2')
        if (die2) {
            speed += die2.value;
        }

        element.dataset['value'] = speed;
        element.innerText = speed;
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
        this.currentAxis = axis;
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

    public updateKerosene(kerosene: number) {
        $(PlaneManager.KEROSENE_MARKER).dataset.value = kerosene;
        return this.game.delay(ANIMATION_MS);
    }

    public updateWind(wind: number, windModifier: string) {
        this.currentWindModifier = Number(windModifier);
        $(PlaneManager.WINDS_PLANE).dataset.value = wind;
        this.updateSpeedMarker();
        return this.game.delay(ANIMATION_MS);
    }

    public highlightApproachSlot(offset: number) {
        const slotElement = $('st-approach-overlay-track-slot');
        const remainingOffset = this.game.gamedatas.approach.size - this.currentApproach + 1;
        if (offset <= remainingOffset) {
            if (slotElement) {
                slotElement.classList.add('st-approach-overlay-track-slot-highlighted');
                slotElement.style.bottom = (95 * (offset - 1)) + 'px';
            }
        }
    }

    public hightlightAxis(value: number) {
        dojo.place(`<div id="st-plane-axis-indicator-highlight" class="st-plane-axis-indicator" data-value="${value}"></div>`, $('st-main-board'))
    }

    public unhighlightPlane() {
        document.getElementById('st-approach-overlay-track-slot').classList.remove('st-approach-overlay-track-slot-highlighted');
        document.getElementById('st-plane-axis-indicator-highlight')?.remove();
    }


    public setSpeedMode(speedMode: string) {
        this.currentSpeedMode = speedMode;
        this.updateSpeedMarker();
    }
}