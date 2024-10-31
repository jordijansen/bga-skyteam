class HelpDialogManager {

    private readonly dialogId: string = 'stHelpDialogId';
    private dialog;

    constructor(private game: SkyTeamGame) {
    }
    showApproachHelp(event) {
        let html = `<div class="dp-help-dialog-content"><div class="dp-help-dialog-content-left">`;
        html += `<p><i>${_('The Approach Track tracks your approach to the airport. Once you reach the top airport space, you have arrived at the airport')}</i></p>`
        if (this.game.gamedatas.scenario.modules.includes('penguins')) {
            html += `<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">${this.game.tokenIcon('penguin', '')}</p></div>`
            html += `<b>${_('This scenario uses Penguins instead of Plane tokens. We know very well that Penguins don\'t fly... but look at how CUTE they are!!</b>')}`
            html += `<p>${_('Remove Penguin tokens from the approach track before you advance past the space it is on.')}</p>`
        } else {
            html += `<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">${this.game.tokenIcon('plane', '')}</p></div>`
            html += `<p>${_('Remove Airplane tokens from the approach track before you advance past the space it is on.')}</p>`
        }
        html += `<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;"><div class="st-end-game-info-box failure"><p><h1>${this.game.getFailureReasonTitle('failure-collision')}</h1></br>${this.game.getFailureReasonText('failure-collision')}</p></div>${this.getActionSpaceVictoryCondition('radio')}</div>`
        html += `<br/>`
        if (this.game.gamedatas.scenario.modules.includes('turns')) {
            html += `<h2 style="text-align: center">${_('Turns')}</h2>`;
            html += `<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;"><img src="${g_gamethemeurl}/img/skyteam-turns-example.png" alt="turns" /></div>`;
            html += `<p><i>${_('Ominous clouds and mountains require a steady hand at the controls. You’d better buckle up!')}</p></i>`
            html += `<p>${_('When you advance the Approach Track, if the airplane’s Axis is not in one of the permitted positions (black or green arrows) in the Current Position screen, you lose the game. This also applies to both spaces you fly through if you advance 2 spaces during this round. If you do not advance the Approach Track (you move 0 spaces), you do not need to follow these constraints.')}</p>`
            html += `<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;"><div class="st-end-game-info-box failure"><p><h1>${this.game.getFailureReasonTitle('failure-turn')}</h1></br>${this.game.getFailureReasonText('failure-turn')}</p></div></div>`
            html += `<br/>`
        }
        if (this.game.gamedatas.scenario.modules.includes('traffic')) {
            html += `<h2 style="text-align: center">${_('Traffic')}</h2>`;
            html += `<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;"><img src="${g_gamethemeurl}/img/skyteam-traffic-example.png" alt="traffic" /></div>`;
            html += `<p><i>${_('The skies are particularly busy today... airplanes seem to be appearing out of nowhere!')}</p></i>`
            html += `<p>${_('If there is a Traffic icon in the Current Position space at the beginning of the round, Traffic dice are rolled as many as there are icons on the space. Each rolled Traffic die adds an Airplane token to the space indicated by the value of the die, starting with the Current Position space. No Airplane tokens are placed if all Airplane tokens are already on the Approach Track (12).')}</p>`
            html += `<p><b>${_('Please note: the traffic die only has values 2, 3, 4 and 5.')}</b></p>`
            html += `<br/>`
        }
        if (this.game.gamedatas.scenario.modules.includes('total-trust')) {
            html += `<h2 style="text-align: center">${_('Total Trust')}</h2>`;
            html += `<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;"><img src="${g_gamethemeurl}/img/skyteam-total-trust-example.png" alt="total trust" /></div>`;
            html += `<p><i>${_('For one reason or another, communication has become impossible in the cockpit. It’s the ultimate test of trust.')}</p></i>`
            html += `<p>${_('If the symbol is in the Current Position screen at the end of the round, players will skip the Strategy Discussion in Phase 1 and simply roll their dice at the beginning of the following round.')}</p>`
            html += `<br/>`
        }
        html += `</div>`
        this.showDialog(event, this.game.gamedatas.approach.name.toUpperCase(), html)
    }

    showAltitudeHelp(event) {
        let html = `<div class="dp-help-dialog-content"><div class="dp-help-dialog-content-left">`;
        html += `<p><i>${_('The Altitude Track tracks your alitude. Once you reach the top space, you have touched down... hopefully at the Airport...')}</i></p>`
        html += `<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;"><img src="${g_gamethemeurl}/img/skyteam-altitude-example.png" alt="turns" /></div>`;
        html += `<p>${_('If at the start of the round the Current Altitude space contains a Re-Roll token, it is gained. The Altitude Track is automatically advanced at the end of each round. The orange (co-pilot) and blue (pilot) arrows indicate what player will go first in a round.')}</p>`
        if (this.game.gamedatas.scenario.modules.includes('turbulence')) {
            html += `<h2 style="text-align: center">${_('Turbulence')}</h2>`;
            html += `<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;"><img src="${g_gamethemeurl}/img/skyteam-turbulence-example.png" alt="turbulence" /></div>`;
            html += `<p><i>${_('Eddies in air currents caused by geographical features or thermal pockets are easily explained in theory, but when your wingtips are bending at impossible angles and your plane feels like a roller coaster, you know that turbulence is no joke.')}</p></i>`
            html += `<p>${_('Every time you place a die, all your remaining dice are rerolled.')}</p>`
        }
        if (this.game.gamedatas.scenario.modules.includes('bad-visibility')) {
            html += `<h2 style="text-align: center">${_('Bad Visibility')}</h2>`;
            html += `<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;"><img src="${g_gamethemeurl}/img/skyteam-bad-visibility-example.png" alt="bad visibility" /></div>`;
            html += `<p><i>${_('Despite your ability to fly with instruments only, coming out of a fog bank to see the ground rushing up towards you is... startling. To put it lightly.')}</p></i>`
            html += `<p>${_('When rolling your dice at the beginning of this round, both players will only roll 2 dice, leaving the other 2 aside. The next two times you place a die, one of the dice you put aside is rolled and can now be placed. In other words, the die you played is replaced with a new one. You never have more than 2 dice to choose from every turn.')}</p>`
        }
        if (this.game.gamedatas.scenario.modules.includes('turbulence') && this.game.gamedatas.scenario.modules.includes('bad-visibility')) {
            html += `<h2 style="text-align: center">${_('Turbulence + Bad Visibility')}</h2>`;
            html += `<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;"><img src="${g_gamethemeurl}/img/skyteam-turbulence-plus-bad-visibility-example.png" alt="turbulence + bad visibility" /></div>`;
            html += `<p><i>${_('This is what it feels like to fly into a full-fledged storm; you’re trying to land a bucking bronco while half-blindfolded. You’ve had better days.')}</p></i>`
            html += `<p>${_('Only use 2 dice, like with the Bad Visibility rule, but when you take a new die to replace the one you have placed, roll both of your available dice.')}</p>`
        }
        html += `</div>`
        this.showDialog(event, _('Altitude Track').toUpperCase(), html)
    }

    showModuleHelp(event, module: string) {
        let html = `<div class="dp-help-dialog-content"><div class="dp-help-dialog-content-left">`;
        html += `<p><i>${this.getModuleFlavorText(module)}</i></p>`
        html += `<p>${this.getModuleDescription(module)}</p>`
        html += `<br/><div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">`
        html += `${this.getModuleFailure(module)}`
        html += `${this.getModuleVictoryCondition(module)}`
        html += `</div>`
        html += `</div>`
        this.showDialog(event, this.getModuleTitle(module).toUpperCase(), html)
    }

    showActionSpaceHelp(event, id: string, actionSpace: ActionSpace) {
        let html = `<div class="dp-help-dialog-content"><div class="dp-help-dialog-content-left">`;
        html += actionSpace.mandatory ? `<p><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> ${_('Mandatory, a die must be placed here each round')}</p>` : '';
        if (actionSpace.type === 'alarms') {
            const alarmTokenType = id.replace('alarms-', '');
            html += `<div style="display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap;"><div class="st-alarm-token-art" data-type="${alarmTokenType}"></div><i>${_(this.game.gamedatas.alarmTokenData[alarmTokenType].name)}</i></div>`;
        }
        html += `<p>${dojo.string.substitute(_('<b>Allowed role(s)</b>: ${roles}'), { roles: actionSpace.allowedRoles.map(role => _(role)).join(', ') })}</p>`
        if (actionSpace.type !== 'intern') {
            html += `<p>${dojo.string.substitute(_('<b>Allowed values(s)</b>: ${values}'), { values: actionSpace.allowedValues ? actionSpace.allowedValues?.map(role => _(role)).join(', ') : _('all values')})}</p>`
        } else {
            html += `<p>${dojo.string.substitute(_('<b>Allowed values(s)</b>: ${values}'), { values: _('a different value compared to the next Intern')})}</p>`
        }
        html += `<p><i>${this.getActionSpaceFlavorText(actionSpace.type)}</i></p>`
        html += `<p>${this.getActionSpaceDescription(actionSpace.type)}</p>`
        html += `<br/><div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">`
        html += `${this.getActionSpaceFailure(actionSpace.type)}`
        html += `${this.getActionSpaceVictoryCondition(actionSpace.type)}`
        html += `</div>`
        html += `</div>`
        this.showDialog(event, this.getActionSpaceTitle(actionSpace.type).toUpperCase(), html)
    }

    private getModuleTitle(module: string) {
        if (module === 'kerosene-leak') {
            return _('kerosene leak');
        } else if (module === 'winds') {
            return _('winds');
        } else if (module === 'real-time') {
            return _('real-time');
        } else if (module === 'engine-loss') {
            return _('engine loss');
        } else if (module === 'winds-headon') {
            return _('winds head-on');
        } else if (module === 'stuck-landing-gear') {
            return _('stuck landing gear');
        }
        return _(module);
    }

    private getActionSpaceTitle(type: string) {
        if (type === 'landing-gear') {
            return _('landing gear');
        } else if (type === 'ice-brakes') {
            return _('ice brakes');
        }
        return _(type);
    }

    private getModuleFlavorText(module: string) {
        switch (module) {
            case 'kerosene-leak':
                return _('Uh-oh... there’s a kerosene leak to take care of! Adjust your speed to avoid catastrophe.');
            case 'winds':
                return _('The tail wind has picked up and you are advancing too fast. Turn your plane to control your speed.');
            case 'winds-headon':
                return _('A strong headwind shakes your cargo and the few passengers you have aboard.');
            case 'real-time':
                return _('Show your nerves of steel by playing in real time.');
            case 'engine-loss':
                return _('Both our engines have stopped. Our only hope: glide to the Airport');
            case 'stuck-landing-gear':
                return _('Your landing gear is stuck. It will not descend. You’ll need to perform a belly landing. But first you have to get rid of all that flammable fuel!');
            default:
                return '';
        }
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
            case 'kerosene':
                return _('Manage your fuel and land your plane before going dry!');
            case 'intern':
                return _('An intern has been assigned to you. They will be helpful during the flight, but you must finish their training before you land.');
            case 'ice-brakes':
                return _('You are landing on an icy runway. Deploy your special brakes to avoid losing control!');
            case 'alarms':
                return _('An alarm is sounding. There’s something going on with your electronics. Elements of your panel are shorting out and require attention.')
            default:
                return '';
        }
    }

    private getModuleDescription(module: string) {
        switch (module) {
            case 'kerosene-leak':
                return _('You can no longer perform the Kerosene Action, and you do not lose kerosene in the same way. Instead, your kerosene loss is the same as the difference between your two Engine dice, +1.<br />For example, if you played a 6 and a 3 in the Engines, you lose 4 units of kerosene: 6 - 3 + 1');
            case 'winds':
            case 'winds-headon':
                return _('Immediately after resolving the Axis, the blue Airplane token is moved as many spaces as the current Axis position is off centre, even if the Axis did not move.<br/>When resolving the Engine speed, the wind speed (the number of the space the blue Airplane token is pointing to) is added to the sum of your Engine dice. This modifier applies to all rounds, even the last one.')
            case 'real-time':
                return _('At the beginning of each round, a 60-second timer (or 70 or 80 seconds) is started IMMEDIATELY after rolling your dice. You cannot place any dice after the timer has run out; the round ends immediately. Any dice that haven’t been placed are simply ignored. If the Axis and Engine spaces haven’t been filled, you’ve lost the game.');
            case 'engine-loss':
                return _('The 2 Engines Action Spaces will not be used. Each round, the players roll their 4 dice but only play 3. At the end of the round, the Approach Track is automatically advanced by 1 space.<br/><br/>Note: Ice Brakes Module<br/>There is no actual ice on the landing strip here, but you’ll need a much stronger braking system to perform an emergency landing.');
            case 'stuck-landing-gear':
                return _('You cannot place dice on the Landing Gear spaces, meaning the blue Aerodynamics marker will stay at 5 for the entire game. You do not need to have the Landing Gear switches engaged when you land. You will use the brakes normally, which will represent spoilers, reverse engines, etc.');
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
            case 'kerosene':
                return _('Placing a die here will reduce the Kerosene level by a number of spaces equal to the die value. If no die is placed here at the end of the round, the Kerosene level is lowered by 6.');
            case 'intern':
                return _('On your turn, you can train your Intern by placing a die of any value on the space of your colour on the Intern Board, and taking the first available token closest to your side. You can then place that token on any space you’d normally be able to place a die, and resolve its effect with the token’s number.<br/><br/><b>Important:</b><br/>An Intern token cannot be modified by a Coffee token.<br/>You cannot use this token on a Concentration space.</br>The die placed must be of a different value than the next available token.');
            case 'ice-brakes':
                return _('The Ice Brakes track works like the normal Brakes track, but 2 dice of the same value must be placed in the space above and below the track in the same round. If you place a die in a space on the Ice Brake track and you are not able to place a die in the opposite space in the same round, the single die has no effect. The die is removed without moving the Brake marker.<br/><br/>Note that this track does not have Switches. However, as with the normal brakes:<br/>You must deploy them in order, from left to right.<br/>You cannot play a die in a space to the left of the Brake marker (in a space where dice have already been played in a previous round).<br/>You can advance the Brake marker more than once per round if the conditions have been met.');
            case 'alarms':
                return _('<b>Rules</b></br>If there is an Alarm symbol in your Current Position space at the beginning of a round, a Alarm token is flipped face-up. You may no longer use that Action space on the Control Panel until you reset the system by removing the Alarm token. If no face-down Alarm tokens remain no token is flipped face-up.<br/><br/><b>Removing Alarm tokens</b><br/>If a player places a die of the correct colour and number onto the Alarm token, this resets the system. The Alarm token is removed from the Alarm board. The corresponding Action Space(s) are now available again.<br/><br/><b>Important:</b> Alarm tokens do not prevent you from landing. You may still land safely if you have active Alarms.')
            default:
                return '';
        }
    }

    private getModuleFailure(module: string) {
        switch (module) {
            case 'kerosene-leak':
                return this.getActionSpaceFailure('kerosene');
            case 'winds':
            case 'winds-headon':
                return this.getActionSpaceFailure('engines');
            case 'real-time':
                return `<div class="st-end-game-info-box failure"><p><h1>${this.game.getFailureReasonTitle('failure-mandatory-empty')}</h1></br>${this.game.getFailureReasonText('failure-mandatory-empty')}</p></div>`;
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
            case 'kerosene':
                return `<div class="st-end-game-info-box failure"><p><h1>${this.game.getFailureReasonTitle('failure-kerosene')}</h1></br>${this.game.getFailureReasonText('failure-kerosene')}</p></div>`
            default:
                return '';
        }
    }

    private getModuleVictoryCondition(module: string) {
        switch (module) {
            case 'winds':
            case 'winds-headon':
                return this.getActionSpaceVictoryCondition('engines');
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
            case 'intern':
                return `<div class="st-end-game-info-box success"><p><h1>${dojo.string.substitute(_('Victory Condition ${victoryCondition}'), { victoryCondition: 'E' })}</h1></br>${_(this.game.gamedatas.victoryConditions['E'].description)}</p></div>`
            case 'ice-brakes':
                return `<div class="st-end-game-info-box success"><p><h1>${dojo.string.substitute(_('Victory Condition ${victoryCondition}'), { victoryCondition: 'F' })}</h1></br>${_(this.game.gamedatas.victoryConditions['F'].description)}</p></div>`
            default:
                return '';
        }
    }

    private showDialog(event, title: string, html: string) {
        if (event) {
            dojo.stopEvent(event);
        }
        this.dialog = new ebg.popindialog();
        this.dialog.create(this.dialogId);
        this.dialog.setTitle(`<i class="fa fa-question-circle" aria-hidden="true"></i> ${_(title)}`);
        this.dialog.setContent( html );
        this.dialog.show();
    }
}