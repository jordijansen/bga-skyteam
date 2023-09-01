class EndGameInfo {

    constructor(private game: SkyTeamGame, private elementId: string) {

    }

    public setFailureReason(failureReason?: string) {
        if (failureReason) {
            const element = $(this.elementId);
            dojo.place(this.createFailureReaseonInfoBox(failureReason), element, 'only')
            return this.game.delay(5000);
        }
        return Promise.resolve();
    }

    private createFailureReaseonInfoBox(failureReason: string) {
        return `<div class="st-end-game-info-box failure">
                    <h1>${this.getFailureReasonTitle(failureReason)}</h1>
                    <p>${this.getFailureReasonText(failureReason)}</p>
                </div>`;
    }

    private getFailureReasonTitle(failureReason: string) {
        switch (failureReason) {
            case 'failure-axis':
                return _('Going into a spin');
            case 'failure-collision':
                return _('Collision');
            case 'failure-overshoot':
                return _('Overshoot');
        }
    }

    private getFailureReasonText(failureReason: string) {
        switch (failureReason) {
            case 'failure-axis':
                return _('If the Axis Arrow reaches or goes past an X, the plane goes into a spin and you immediately lose the game.');
            case 'failure-collision':
                return _('If there are Airplane tokens in the Current Position space and you have to advance the Approach Track, you have had a collision, and you’ve lost the game!');
            case 'failure-overshoot':
                return _('If the airport is in the Current Position space and you have to advance the Approach Track, you have overshot the airport, and you’ve lost the game!')
        }
        return '';
    }
}