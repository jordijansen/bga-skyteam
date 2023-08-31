class EndGameInfo {

    constructor(private elementId: string) {

    }

    public setFailureReason(failureReason?: string) {
        if (failureReason) {
            const element = $(this.elementId);
            dojo.place(this.createFailureReaseonInfoBox(failureReason), element, 'only')
            return delay(5000);
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
        }
    }

    private getFailureReasonText(failureReason: string) {
        switch (failureReason) {
            case 'failure-axis':
                return _('If the Axis Arrow reaches or goes past an X, the plane goes into a spin and you immediately lose the game.');
        }
        return '';
    }
}