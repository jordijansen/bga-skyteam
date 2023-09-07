class HelpDialogManager {

    private readonly dialogId: string = 'stHelpDialogId';
    private dialog;

    constructor(private game: SkyTeamGame) {
    }

    showActionSpaceHelp(event, actionSpace: ActionSpace) {
        dojo.stopEvent(event);

        let html = `<div class="dp-help-dialog-content"><div class="dp-help-dialog-content-left">`;
        html += actionSpace.mandatory ? `<p><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> ${_('Mandatory, a die must be placed here each round')}</p>` : '';
        html += `<p>${dojo.string.substitute(_('<b>Allowed role(s)</b>: ${roles}'), { roles: actionSpace.allowedRoles.map(role => _(role)).join(', ') })}</p>`
        html += `<p>${dojo.string.substitute(_('<b>Allowed values(s)</b>: ${values}'), { values: actionSpace.allowedValues ? actionSpace.allowedValues?.map(role => _(role)).join(', ') : _('all values')})}</p>`
        html += `<p><i>${this.getActionSpaceFlavorText(actionSpace.type)}</i></p>`
        html += `<p>${this.getActionSpaceDescription(actionSpace.type)}</p>`
        html += `<br/><div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">`
        html += `${this.getActionSpaceFailure(actionSpace.type)}`
        html += `${this.getActionSpaceVictoryCondition(actionSpace.type)}`
        html += `</div>`
        html += `</div>`
        this.showDialog(event, _(actionSpace.type).toUpperCase(), html)
    }

    private getActionSpaceFlavorText(type: string) {
        switch (type) {
            case 'axis':
                return _('Manage your plane’s Axis during your approach. The Airplane tilts. Be careful not to go into a spin!');
            case 'engines':
                return _('Depending on the power you assigned to the engines, the Airplane will advance... or not!');
            case 'radio':
                return _('Communicate with the Control Tower to clear the traffic on your approach path.');
            case 'landing-gear':
                return _('Deploy the Landing Gear. Each piece of Landing Gear deployed increases the Airplane’s drag and wind resistance.');
            case 'flaps':
                return _('Deploy the flaps. Each flap extended increases the aircraft’s lift and wind resistance.');
            case 'concentration':
                return _('This is not the time to crack under pressure; concentrate and prepare your next manoeuvres.');
            case 'brakes':
                return _('Brake enough to bring the plane to a halt once it touches the runway.');
            default:
                return '';
        }
    }

    private getActionSpaceDescription(type: string) {
        switch (type) {
            case 'axis':
                return _('As soon as the second die is placed, compare the value of both dice: Do not move anything if both dice have the same number. If the dice show different numbers, turn the Airplane as many marks as the difference between the 2 dice. <b>Turn the Axis Arrow toward the player who played the highest die, and leave it there; do not reset the Axis to the starting point at the end of the round.</b>');
            case 'engines':
                return _('As soon as the second die is placed, add together the 2 dice played onto the Engine spaces; this is your speed. Then:<br/>If the sum is less than the weakest (blue) of the 2 Aerodynamics markers on the Speed Gauge, the Approach Track does not advance.<br/>If the sum is between the 2 Aerodynamics markers, the Approach Track advances one space.<br/>If the sum is greater than the highest (orange) of the 2 Aerodynamics markers, the Approach Track advances two space<br/><h3>WATCH OUT: The way you read your speed changes!</h3> During the final round, when playing the second engine die, instead of comparing your speed with the Aerodynamics markers, compare it WITH YOUR BRAKES.');
            case 'radio':
                return _('Play a dice here to remove a Airplane token from the space corresponding with the dice value. Counting from the Current Position upwards. Playing a die with value 1, removes an Airplane token from the Current Position.');
            case 'landing-gear':
                return _('Place a die respecting the number constraint. The order in which you deploy your Landing Gear is not important. If this is the first die you place here, the Switch below the space is activated (green light) and The Aerodynamics marker (blue) is moved one space. Playing on a space whose Switch is already showing green has no effect.')
            case 'flaps':
                return _('Place a die respecting the number constraint. Deploy the Flaps in order, from top to bottom. If this is the first die you place here, the Switch below the space is activated (green light) and The Aerodynamics marker (orange) is moved one space. Playing on a space whose Switch is already showing green has no effect.');
            case 'concentration':
                return _('Placing a die here will gain a Coffee token. You can never have more than 3 Coffee tokens. Any time you place a die you can spent Coffee tokens to increase/decrease the die value by 1. You can not change a 6 value into a 1 and vice versa.');
            case 'brakes':
                return _('Place a die respecting the number constraint. The brakes must be deployed in order, starting with the 2 space. If this is the first die you place here, the Switch below the space is activated (green light) and The Brakes marker (red) is moved. The Brakes only have an impact in the game’s final round. Playing on a space whose Switch is already showing green has no effect.');
            default:
                return '';
        }
    }

    private getActionSpaceFailure(type: string) {
        switch (type) {
            case 'axis':
                return `<div class="st-end-game-info-box failure"><p><h1>${this.game.getFailureReasonTitle('failure-axis')}</h1></br>${this.game.getFailureReasonText('failure-axis')}</p></div>`
            case 'engines':
                return `<div class="st-end-game-info-box failure"><p><h1>${this.game.getFailureReasonTitle('failure-collision')}</h1></br>${this.game.getFailureReasonText('failure-collision')}</p></div><div class="st-end-game-info-box failure"><p><h1>${this.game.getFailureReasonTitle('failure-overshoot')}</h1></br>${this.game.getFailureReasonText('failure-overshoot')}</p></div>`
            default:
                return '';
        }
    }

    private getActionSpaceVictoryCondition(type: string) {
        switch (type) {
            case 'axis':
                return `<div class="st-end-game-info-box success"><p><h1>${dojo.string.substitute(_('Victory Condition ${victoryCondition}'), { victoryCondition: 'C' })}</h1></br>${_(this.game.gamedatas.victoryConditions['C'].description)}</p></div>`
            case 'radio':
                return `<div class="st-end-game-info-box success"><p><h1>${dojo.string.substitute(_('Victory Condition ${victoryCondition}'), { victoryCondition: 'A' })}</h1></br>${_(this.game.gamedatas.victoryConditions['A'].description)}</p></div>`
            case 'landing-gear':
            case 'flaps':
                return `<div class="st-end-game-info-box success"><p><h1>${dojo.string.substitute(_('Victory Condition ${victoryCondition}'), { victoryCondition: 'B' })}</h1></br>${_(this.game.gamedatas.victoryConditions['B'].description)}</p></div>`
            case 'brakes':
            case 'engines':
                return `<div class="st-end-game-info-box success"><p><h1>${dojo.string.substitute(_('Victory Condition ${victoryCondition}'), { victoryCondition: 'D' })}</h1></br>${_(this.game.gamedatas.victoryConditions['D'].description)}</p></div>`
            default:
                return '';
        }
    }

    private showDialog(event, title: string, html: string) {
        dojo.stopEvent(event);
        this.dialog = new ebg.popindialog();
        this.dialog.create(this.dialogId);
        this.dialog.setTitle(`<i class="fa fa-question-circle" aria-hidden="true"></i> ${_(title)}`);
        this.dialog.setContent( html );
        this.dialog.show();
    }



}