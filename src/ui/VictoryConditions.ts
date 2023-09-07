class VictoryConditions {

    constructor(private game: SkyTeamGame, private elementId: string) {

    }

    public updateVictoryConditions(victoryConditions: { [conditionLetter: string]: VictoryCondition }) {
        const element = $(this.elementId);
        dojo.empty(element);

        let html = '<h3>FINAL TURN - VICTORY CONDITIONS</h3>';

        for (let conditionLetter in victoryConditions) {
            const victoryCondition = victoryConditions[conditionLetter];
            html += `<div class="st-victory-conditions-row">
                        <div class="st-victory-conditions-row-letter"><span>${conditionLetter}</span></div>
                        <div class="st-victory-conditions-row-description">${_(victoryCondition.description)}</div>
                        <div class="st-victory-conditions-row-status">${this.getIconForStatus(victoryCondition.status)}</div>
                     </div>`
        }

        dojo.place(html, element)
    }

    private getIconForStatus(status: "success" | "pending" | "failed") {
        switch (status) {
            case "pending":
                return '<i class="fa fa-clock-o" aria-hidden="true"></i>';
            case "failed":
                return '<i class="fa fa-times-circle-o" aria-hidden="true"></i>';
            case 'success':
                return '<i class="fa fa-check-circle-o" aria-hidden="true"></i>';
        }
    }

}