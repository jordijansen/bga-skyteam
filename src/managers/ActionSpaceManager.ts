class ActionSpaceManager {


    public selectedActionSpaceId: string = null;
    private actionSpaces: {[id: string]: LineStock<Dice>} = {}
    private onSelectedActionSpaceChanged: () => void

    constructor(private game: SkyTeamGame) {

    }

    public setUp(data: SkyTeamGameData) {
        Object.entries(data.actionSpaces).forEach(([id, space]) => {
            console.log(id);
            this.actionSpaces[id] = new LineStock<Dice>(this.game.diceManager, $(id), {});
            dojo.connect($(id), 'onclick', (event) => this.actionSpaceClicked(id, event))
        });

        data.planeDice.forEach(die => this.moveDieToActionSpace(die));
    }

    public setActionSpacesSelectable(ids: { [p: string]: ActionSpace }, onSelectedActionSpaceChanged?: () => void) {
        this.onSelectedActionSpaceChanged = onSelectedActionSpaceChanged;

        this.setAllActionSpacesUnselectable();

        Object.entries(ids).forEach(([id, space]) => {
            const element = $(id);
            element.classList.add('selectable');
        });
    }

    public setAllActionSpacesUnselectable() {
        Object.keys(this.actionSpaces).forEach(id => {
            const element = $(id);
            element.classList.remove('selected');
            element.classList.remove('selectable');
        });
    }

    public moveDieToActionSpace(die: Dice) {
        return this.actionSpaces[die.locationArg].addCard(die);
    }

    private actionSpaceClicked(id, event) {
        dojo.stopEvent(event);
        const target = $(id);
        if (target.classList.contains('selectable')) {
            target.classList.remove('selectable');
            target.classList.add('selected');
            this.selectedActionSpaceId = target.id;
            this.onSelectedActionSpaceChanged();
        } else if (target.classList.contains('selected')) {
            target.classList.remove('selected');
            target.classList.add('selectable')
            this.selectedActionSpaceId = null;
            this.onSelectedActionSpaceChanged();
        }
        console.log('Selected: ' + this.selectedActionSpaceId)
    }



}