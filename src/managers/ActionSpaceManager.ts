class ActionSpaceManager {


    public selectedActionSpaceId: string = null;
    private actionSpaces: {[id: string]: LineStock<Dice>} = {}
    private onSelectedActionSpaceChanged: (spaceId: string) => void
    public activeAlarms = [];

    constructor(private game: SkyTeamGame) {

    }

    public setUp(data: SkyTeamGameData) {
        Object.entries(data.actionSpaces).forEach(([id, space]) => {
            let warningPlacement = 'bottom';
            if (id === 'engines-1') {
                warningPlacement = 'left';
            } else if (id === 'engines-2') {
                warningPlacement = 'right';
            }
            let helpPlacement = 'top';
            if (space.type === 'landing-gear' || id === 'axis-1' || id === 'radio-1' || space.type === 'alarms') {
                helpPlacement = 'left';
            } else if (space.type === 'flaps' || space.type === 'concentration' || id === 'axis-2' || id === 'radio-2' || id === 'radio-3') {
                helpPlacement = 'right';
            } else if (id.startsWith('ice-brakes-2')) {
                helpPlacement = 'bottom';
            }
            dojo.place(`<div id="${id}" class="st-action-space" data-kerosene-board-active="${data.scenario.modules.includes('kerosene') || data.scenario.modules.includes('kerosene-leak') ? 'true' : 'false'}">
                                ${space.mandatory ? `<span class="st-action-space-mandatory-warning ${warningPlacement}"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i></span>` : ''}
                                <span id="${id}-help" class="st-action-space-help ${helpPlacement}"><i class="fa fa-question-circle" aria-hidden="true"></i></span>
                             </div>`, $('st-action-spaces'))
            this.actionSpaces[id] = new LineStock<Dice>(this.game.diceManager, $(id), {});
            dojo.connect($(id), 'onclick', (event) => this.actionSpaceClicked(id, event))
            dojo.connect($(`${id}-help`), 'onclick', (event) => this.game.helpDialogManager.showActionSpaceHelp(event, id, space))
        });

        data.planeDice.forEach(die => this.moveDieToActionSpace(die));

        this.activeAlarms = data.alarmTokens.filter(alarm => alarm.isActive === true);
        this.updateActiveAlarms();
    }

    public updateActiveAlarms() {
        document.querySelectorAll('.st-action-space').forEach(element => {
            element.classList.remove('blocked-by-alarm')
            this.activeAlarms.forEach(alarm => {
                if (alarm.blocksSpaces.includes(element.id)) {
                    element.classList.add('blocked-by-alarm')
                }
            })
        })
    }

    public getValidPlacements(ids: { [p: string]: ActionSpace }, dieValue?: number) {
        return Object.entries(ids).filter(([id, space]) => !dieValue || (!space.allowedValues || space.allowedValues?.includes(dieValue)));
    }

    public setActionSpacesSelectable(ids: { [p: string]: ActionSpace }, onSelectedActionSpaceChanged?: (spaceId: string) => void, dieValue?: number) {
        document.querySelector('.st-dice-placeholder')?.remove();
        this.game.planeManager.unhighlightPlane();
        this.game.planeManager.updateSpeedMarker();

        this.onSelectedActionSpaceChanged = onSelectedActionSpaceChanged;

        this.setAllActionSpacesUnselectable();

        const validPlacements = this.getValidPlacements(ids, dieValue);
        validPlacements.forEach(([id, space]) => {
            const element = $(id);
            if (!element.classList.contains('selected')) {
                element.classList.add('selectable');
            }
        });
    }

    public setAllActionSpacesUnselectable() {
        this.selectedActionSpaceId = null;
        Object.keys(this.actionSpaces).forEach(id => {
            const element = $(id);
            element.classList.remove('selected');
            element.classList.remove('selectable');
        });
    }

    public moveDieToActionSpace(die: Dice) {
        this.game.diceManager.updateDieValue(die);
        if (this.actionSpaces[die.locationArg]) {
            return this.actionSpaces[die.locationArg].addCard(die).then(() => $(die.locationArg).classList.add('st-action-space-occupied'));
        }
        return Promise.resolve();
    }

    public resetActionSpaceOccupied() {
        document.querySelectorAll('.st-action-space-occupied').forEach(node => node.classList.remove('st-action-space-occupied'))
    }

    public removeDice(dice: Dice[]) {
        dice.forEach(die => Object.values(this.actionSpaces).forEach(stock => {
            if (stock.contains(die)) {
                stock.removeCard(die);
            }
        }))
    }

    public getDieInLocation(space: string) {
        const dice = this.actionSpaces[space]?.getCards();
        if (dice && dice.length === 1) {
            return dice[0];
        }
        return null;
    }

    private actionSpaceClicked(id, event) {
        dojo.stopEvent(event);
        const target = $(id);
         if (target.classList.contains('selected')) {
             target.classList.add('selectable');
             target.classList.remove('selected');
            this.selectedActionSpaceId = null;
            this.onSelectedActionSpaceChanged(null);
        } else if (target.classList.contains('selectable')) {
             target.classList.add('selected');
             target.classList.remove('selectable');
             if (this.selectedActionSpaceId) {
                 $(this.selectedActionSpaceId).classList.remove('selected');
                 $(this.selectedActionSpaceId).classList.add('selectable');
             }
             this.selectedActionSpaceId = target.id;
             this.onSelectedActionSpaceChanged(target.id);
         }
        console.log('Selected: ' + this.selectedActionSpaceId)
    }



}