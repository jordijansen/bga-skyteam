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

    public setEndGameInfo(victoryConditions: { [p: string]: VictoryCondition }) {
        const element = $(this.elementId);
        const failure = Object.values(victoryConditions).some(vc => vc.status === 'failed');

        dojo.place(`<div id="st-end-game-info-box" class="st-end-game-info-box st-victory-conditions ${failure ? 'failure' : 'success'}"></div>`, element, 'only')

        const endGameInfoElement = new VictoryConditions(this.game, 'st-end-game-info-box')
        endGameInfoElement.updateVictoryConditions(victoryConditions);

        if (!failure) {
            dojo.place(`<h2>${_('Congratulations! The passengers burst into applause! You have landed smoothly, and you have won.')}</h2>`, $('st-end-game-info-box'))
        } else {
            dojo.place(`<h2>${_('Unfortunately, not all victory conditions were met, better luck next time pilots!')}</h2>`, $('st-end-game-info-box'))
        }

        return this.game.delay(5000);
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
            case 'failure-crash-landed':
                return _('Crash Landing');
        }
    }

    private getFailureReasonText(failureReason: string) {
        switch (failureReason) {
            case 'failure-axis':
                return _('If the Axis Arrow reaches or goes past an X, the plane goes into a spin; you have lost the game!');
            case 'failure-collision':
                return _('If there are Airplane tokens in the Current Position space and you have to advance the Approach Track, you have had a collision; you have lost the game!');
            case 'failure-overshoot':
                return _('If the airport is in the Current Position space and you have to advance the Approach Track, you have overshot the airport; you have lost the game!')
            case 'failure-crash-landed':
                return _('You have crash landed before reaching the airport; you have lost the game!');
        }
        return '';
    }


}