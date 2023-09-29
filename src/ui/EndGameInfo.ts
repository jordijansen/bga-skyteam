class EndGameInfo {

    constructor(private game: SkyTeamGame, private elementId: string) {

    }

    public setFailureReason(failureReason?: string) {
        if (failureReason) {
            const element = $(this.elementId);
            dojo.place(this.createFailureReaseonInfoBox(failureReason), element, 'only')
            element.scrollIntoView({block: 'center', behavior: 'smooth'});
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
        element.scrollIntoView({block: 'center', behavior: 'smooth'});
        return this.game.delay(10000);
    }

    private createFailureReaseonInfoBox(failureReason: string) {
        return `<div class="st-end-game-info-box failure">
                    <h1>${this.game.getFailureReasonTitle(failureReason)}</h1>
                    <p>${this.game.getFailureReasonText(failureReason)}</p>
                </div>`;
    }
}