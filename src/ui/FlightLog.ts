class FlightLog {

    private static game: SkyTeam;

    public static teamFlightLog = null;
    public static playerFlightLog = {};
    public static addButton(game: SkyTeam, targetId: string) {
        FlightLog.game = game;

        dojo.place(`<div id="st-flight-log-button" class="bgabutton bgabutton_gray"><i class="fa6 fa6-plane-circle-check"></i> ${_('Flight Log')}</div>`, targetId);

        dojo.connect($('st-flight-log-button'), 'onclick', () => {
            const dialog = new ebg.popindialog();
           dialog.create('st-flight-log-dialog');
           dialog.setTitle(`<i class="fa6 fa6-plane-circle-check" aria-hidden="true"></i> ${_('Flight Log')}`);
           dialog.setContent( FlightLog.createDialogHtml() );
           dialog.show();
        })

        this.teamFlightLog = game.gamedatas.flightLog;
        Object.keys(game.gamedatas.players).forEach(playerId => this.playerFlightLog[playerId] = game.gamedatas.players[playerId].flightLog)
    }

    public static open() {
        $('st-flight-log-button').click();
    }

    private static createDialogHtml() {
        let html = '';
        html += `<div style="display: flex; justify-content: center;"><img src="${g_gamethemeurl}/img/skyteam-logo-blue.png" width="100%" style="max-width: 300px;"></img></div>`;
        const colors = ['green', 'yellow', 'red', 'black'];
        const tags = ['base','promo','turbulence'];

        const playerIds = Object.keys(this.game.gamedatas.players);

        html += `<div class="st-flight-log-row st-flight-log-header">
                    <div style="width: 75px;">${_('COLOR').toUpperCase()}</div>
                    <div class="st-flight-log-code">${_('CODE').toUpperCase()}</div>
                    <div class="st-flight-log-title">${_('SCENARIO').toUpperCase()}</div>
                    <div class="st-flight-status">${_("TEAM (W/L)").toUpperCase()}</div>
                    ${playerIds.map(playerId => `<div class="st-flight-status" style="display: block;">${dojo.string.substitute(_("${playerName} (W/L)"), {playerName: this.game.gamedatas.players[playerId].name})}</div>`).join('')}
                </div>`
        colors.forEach(color => {
            tags.forEach(tag => {
                Object.keys(this.game.gamedatas.scenarioData).forEach(scenarioId => {
                    const scenario = this.game.gamedatas.scenarioData[scenarioId];
                    const approach = this.game.gamedatas.approachTrackData[scenario.approach];
                    if (approach.category === color && scenario.tags.includes(tag) && !scenario.tags.includes('coming-soon')) {
                        const nameParts = _(approach.name).split(" ");
                        const scenarioCode = nameParts.shift();
                        const scenarioName = nameParts.join(' ');

                        const teamScenarioData = this.teamFlightLog[scenarioId];
                        let teamScenarioStatus = 'unplayed';
                        if (teamScenarioData && teamScenarioData.length === 2) {
                            if (teamScenarioData[0] > 0) {
                                teamScenarioStatus = 'success';
                            } else {
                                teamScenarioStatus = 'failure';
                            }
                        }

                        html += `<div class="st-flight-log-row">`
                        html += `    <div class="st-flight-log-category" data-type="${approach.category}">${FlightLog.getTagsLabel(scenario.tags)}</div>`
                        html += `    <div class="st-flight-log-code">${scenarioCode.split('').map(codeLetter => `<div class="st-flight-log-code-letter">${codeLetter}</div>`).join('')}</div>`
                        html += `    <div class="st-flight-log-title">${scenarioName} ${scenario.modules.includes('real-time') ? '<i class="fa6 fa6-clock"></i>' : ''} ${scenario.tags.includes('new') ? `<i class="fa fa6-star"></i>` : ''}</div>`
                        html += `    <div class="st-flight-status" data-type="${teamScenarioStatus}">${teamScenarioData ? teamScenarioData.join(' / ') : ''}</div>`

                        playerIds.forEach(playerId => {
                            const playerScenarioData = this.playerFlightLog[playerId][scenarioId];
                            let playerScenarioStatus = 'unplayed';
                            if (playerScenarioData && playerScenarioData.length === 2) {
                                if (playerScenarioData[0] > 0) {
                                    playerScenarioStatus = 'success';
                                } else {
                                    playerScenarioStatus = 'failure';
                                }
                            }
                            html += `    <div class="st-flight-status" data-type="${playerScenarioStatus}">${playerScenarioData ? playerScenarioData.join(' / ') : ''}</div>`
                        })

                        html += `</div>`
                    }
                })
            })
        })
        html += `<div class="st-flight-log-row" style="flex-direction: column; font-size: 12px; width: 735px; gap: 0px;">`
        html += `<p><i class="fa6 fa6-clock"></i> = ${_('Real-time scenario')}</p>`
        html += `<p><i class="fa6 fa6-star"></i> = ${_('New')}</p>`
        html += `<p>${_('* The Flight Log tracks games played from the 8th november 2024 and onwards, games played before this date are not shown. Your Flight Log gets deleted after not completing a game for 365 days.')}</p>`
        html += `<p>${_('** Data is shown as WIN / LOSSES per scenario. If you have multiple games running, the data shown might be outdated as the Flight Log above gets populated at the start of the game.')}</p>`
        html += `</div>`

        return html;
    }

    private static getTagsLabel(tags: string[]) {
        if (tags.includes('promo')) {
            return _('PROMO');
        } else if (tags.includes('base')) {
            return _('BASE');
        } else if (tags.includes('turbulence')) {
            return _('TURBULENCE');
        }
    }
}