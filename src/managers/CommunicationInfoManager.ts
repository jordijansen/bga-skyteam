class CommunicationInfoManager  {

    private static readonly ELEMENT_ID: string = 'st-communication-info';
    constructor(private game: SkyTeamGame) {

    }

    public setUp(data: SkyTeamGameData) {
        this.update(data.phase);
    }

    public setCommunicationLimited() {
        const element = $(CommunicationInfoManager.ELEMENT_ID);
        dojo.empty(element);

        dojo.place(`<h2><i class="fa fa-microphone" aria-hidden="true"></i> ${_('Limited communication only. You are not allowed to discuss the dice.')} <i class="fa fa-microphone" aria-hidden="true"></i></h2>`, element)
        dojo.place(`<div class="st-communication-info-examples">
                            <div>
                                <div><i class="fa fa-check" aria-hidden="true"></i> “${_('We really need to get rid of that plane token')}“</div>
                                <div><i class="fa fa-check" aria-hidden="true"></i> “${_('Let’s make sure we advance 2 spaces.')}“</div>
                            </div>
                            <div>
                                <div><i class="fa fa-times" aria-hidden="true"></i> “${_('If you get a 6, put it here')}“</div>
                                <div><i class="fa fa-times" aria-hidden="true"></i> “${_('Use your weakest die to do this action')}“</div>
                            </div>
                        </div>`, element)
    }

    public setCommunicationNotAllowed() {
        const element = $(CommunicationInfoManager.ELEMENT_ID);
        dojo.empty(element);

        dojo.place(`<h2><i class="fa fa-ban" aria-hidden="true"></i> ${_('No communication. Non-game communication is allowed.')} <i class="fa fa-ban" aria-hidden="true"></i></h2>`, element)
        dojo.place(`<div class="st-communication-info-examples">
                            <div>
                                <div><i class="fa fa-check" aria-hidden="true"></i> “${_('Are you still there?')}“</div>
                                <div><i class="fa fa-check" aria-hidden="true"></i> “${_('I need to step away for a minute, be right back')}“</div>
                            </div>
                            <div>
                                <div><i class="fa fa-times" aria-hidden="true"></i> “${_('I have a 6 and I can use it here')}“</div>
                                <div><i class="fa fa-times" aria-hidden="true"></i> “${_('What dice do you have?')}“</div>
                                <div><i class="fa fa-times" aria-hidden="true"></i> “${_('Remember the brakes!')}“</div>
                            </div>
                        </div>`, element)
    }

    public update(newPhase: SkyTeamGameData['phase']) {
        if (newPhase == 'strategy') {
            this.setCommunicationLimited();
        } else if (newPhase == 'diceplacement') {
            this.setCommunicationNotAllowed();
        }
    }
}