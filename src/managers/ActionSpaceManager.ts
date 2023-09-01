class ActionSpaceManager {


    public selectedActionSpaceId: string = null;
    private actionSpaces: {[id: string]: LineStock<Dice>} = {}
    private onSelectedActionSpaceChanged: () => void

    constructor(private game: SkyTeamGame) {

    }

    public setUp(data: SkyTeamGameData) {
        Object.entries(data.actionSpaces).forEach(([id, space]) => {
            dojo.place(`<div id="${id}" class="st-action-space ${space.mandatory ? 'mandatory' : ''}"></div>`, $('st-action-spaces'))
            this.actionSpaces[id] = new LineStock<Dice>(this.game.diceManager, $(id), {});
            dojo.connect($(id), 'onclick', (event) => this.actionSpaceClicked(id, event))
        });

        data.planeDice.forEach(die => this.moveDieToActionSpace(die));
    }

    public setActionSpacesSelectable(ids: { [p: string]: ActionSpace }, onSelectedActionSpaceChanged?: () => void, dieValue?: number) {
        this.onSelectedActionSpaceChanged = onSelectedActionSpaceChanged;

        this.setAllActionSpacesUnselectable();

        Object.entries(ids).filter(([id, space]) => !dieValue || (!space.allowedValues || space.allowedValues?.includes(dieValue))).forEach(([id, space]) => {
            const element = $(id);
            if (!element.classList.contains('selected')) {
                element.classList.add('selectable');
            }
        });
    }

    public setAllActionSpacesUnselectable() {
        Object.keys(this.actionSpaces).forEach(id => {
            const element = $(id);
            if (this.selectedActionSpaceId !== id) {
                element.classList.remove('selected');
            }
            element.classList.remove('selectable');
        });
    }

    public moveDieToActionSpace(die: Dice) {
        return this.actionSpaces[die.locationArg].addCard(die);
    }

    private actionSpaceClicked(id, event) {
        dojo.stopEvent(event);
        const target = $(id);
         if (target.classList.contains('selected')) {
             target.classList.add('selectable');
             target.classList.remove('selected');
            this.selectedActionSpaceId = null;
            this.onSelectedActionSpaceChanged();
        } else if (target.classList.contains('selectable')) {
             target.classList.add('selected');
             target.classList.remove('selectable');
             if (this.selectedActionSpaceId) {
                 $(this.selectedActionSpaceId).classList.remove('selected');
                 $(this.selectedActionSpaceId).classList.add('selectable');
             }
             this.selectedActionSpaceId = target.id;
             this.onSelectedActionSpaceChanged();
         }
        console.log('Selected: ' + this.selectedActionSpaceId)
    }



}