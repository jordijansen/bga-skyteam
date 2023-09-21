class CommunicationInfoManager  {


    private currentCommunicationLevel = '';
    private static readonly ELEMENT_ID: string = 'st-communication-info';
    private dialog = null;
    private dialogId: string = 'st-communication-info-dialog';
    private closeButtonId: string = 'st-communication-info-dialog-close-button';
    constructor(private game: SkyTeamGame) {

    }

    public setUp(data: SkyTeamGameData) {
        this.update(data.phase);

        dojo.connect($(CommunicationInfoManager.ELEMENT_ID), 'onclick', (event) => this.showMoreInfoDialog(event))
    }

    public setCommunicationLimited() {
        this.currentCommunicationLevel = 'limited';

        const element = $(CommunicationInfoManager.ELEMENT_ID);
        dojo.empty(element);

        dojo.removeClass(element, 'red');
        dojo.addClass(element, 'green');

        dojo.place(`<h2><i class="fa fa-microphone" aria-hidden="true"></i> ${_('Limited communication only')} <i class="fa fa-microphone" aria-hidden="true"></i><br/>${_('You are not allowed to discuss the dice.')}<br/></h2><i id="${this.closeButtonId}" class="fa fa-times" aria-hidden="true"></i>`, element)
    }

    public setCommunicationNotAllowed() {
        this.currentCommunicationLevel = 'not-allowed';

        const element = $(CommunicationInfoManager.ELEMENT_ID);
        dojo.empty(element);

        dojo.removeClass(element, 'green');
        dojo.addClass(element, 'red');

        dojo.place(`<h2><i class="fa fa-ban" aria-hidden="true"></i> ${_('No communication')} <i class="fa fa-ban" aria-hidden="true"></i><br/>${_('Non-game communication is allowed.')}</h2><i id="${this.closeButtonId}" class="fa fa-times" aria-hidden="true"></i>`, element)
    }

    public update(newPhase: SkyTeamGameData['phase']) {
        if (this.game.prefs[101].value == 1 || this.game.prefs[101].value == 2) {
            if (newPhase == 'strategy') {
                this.setCommunicationLimited();
            } else if (newPhase == 'diceplacement') {
                this.setCommunicationNotAllowed();
            }

            if (this.game.prefs[101].value == 2) {
                this.game.delay(10000).then(() => this.hideBanner())
            }

            dojo.connect($(this.closeButtonId), 'onclick', (event) => {
                dojo.stopEvent(event);
                this.hideBanner();
            })

        }
    }

    public hideBanner() {
        const element = $(CommunicationInfoManager.ELEMENT_ID);
        dojo.empty(element);
    }

    private showMoreInfoDialog(event) {
        dojo.stopEvent(event);

        this.dialog = new ebg.popindialog();
        this.dialog.create(this.dialogId);
        this.dialog.setTitle(`<i class="fa fa-info-circle" aria-hidden="true"></i> ${this.getDialogTitle()}`);
        this.dialog.setContent( this.getDialogHtml() );
        this.dialog.show();
    }

    private getDialogTitle() {
        switch (this.currentCommunicationLevel) {
            case 'not-allowed':
                return _('No communication. Non-game communication is allowed.');
            case 'limited':
                return _('Limited communication only. You are not allowed to discuss the dice.');
        }
    }

    private getDialogHtml() {
        switch (this.currentCommunicationLevel) {
            case 'not-allowed':
                return `<div class="st-communication-info-examples">
                            <p>${_('In Sky Team, there are 2 ways to communicate: Verbally, during the strategy phase; and by placing your die during the Dice Placement phase.')} ${_('Currently we are in the Dice Placement phase.')}</p>
                            <div>
                                <div><b>${_('For example:')}</b></div>
                                <div><i class="fa fa-check" aria-hidden="true"></i> “${_('Are you still there?')}“</div>
                                <div><i class="fa fa-check" aria-hidden="true"></i> “${_('I need to step away for a minute, be right back')}“</div>
                                <div><i class="fa fa-times" aria-hidden="true"></i> “${_('I have a 6 and I can use it here')}“</div>
                                <div><i class="fa fa-times" aria-hidden="true"></i> “${_('What dice do you have?')}“</div>
                                <div><i class="fa fa-times" aria-hidden="true"></i> “${_('Remember the brakes!')}“</div>
                            </div>
                        </div>`
            case 'limited':
                return `<div class="st-communication-info-examples">
                            <p>${_('In Sky Team, there are 2 ways to communicate: Verbally, during the strategy phase; and by placing your die during the Dice Placement phase.')} ${_('Currently we are in the Strategy phase.')}</p>
                            <div>
                                <div><b>${_('For example:')}</b></div>
                                <div><i class="fa fa-check" aria-hidden="true"></i> “${_('We really need to get rid of that plane token')}“</div>
                                <div><i class="fa fa-check" aria-hidden="true"></i> “${_('Let’s make sure we advance 2 spaces.')}“</div>
                                <div><i class="fa fa-times" aria-hidden="true"></i> “${_('If you get a 6, put it here')}“</div>
                                <div><i class="fa fa-times" aria-hidden="true"></i> “${_('Use your weakest die to do this action')}“</div>
                            </div>
                        </div>`
        }
    }
}