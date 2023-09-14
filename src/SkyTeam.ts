declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;
declare const g_replayFrom;
declare const g_archive_mode;

const ANIMATION_MS = 1000;
const TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;



class SkyTeam implements SkyTeamGame {

    instantaneousMode: boolean;
    notifqueue: {};

    public gamedatas: SkyTeamGameData;
    private zoomManager: ZoomManager;
    public animationManager: AnimationManager;

    // UI elements
    private playerSetup: PlayerSetup;
    private endGameInfo: EndGameInfo;
    private spendCoffee: SpendCoffee;
    private victoryConditions: VictoryConditions;

    // Managers
    public planeManager: PlaneManager;
    private reserveManager: ReserveManager;
    public playerRoleManager: PlayerRoleManager;
    public diceManager: DiceManager;
    public tokenManager: TokenManager;
    public communicationInfoManager: CommunicationInfoManager;
    private actionSpaceManager: ActionSpaceManager;
    public helpDialogManager: HelpDialogManager;

    // Modules

    constructor() {
        // Init Managers
        this.planeManager = new PlaneManager(this);
        this.reserveManager = new ReserveManager(this);
        this.playerRoleManager = new PlayerRoleManager(this);
        this.diceManager = new DiceManager(this);
        this.tokenManager = new TokenManager(this);
        this.communicationInfoManager = new CommunicationInfoManager(this);
        this.actionSpaceManager = new ActionSpaceManager(this);
        this.helpDialogManager = new HelpDialogManager(this);
        // Init Modules
    }

    /*
        setup:

        This method must set up the game user interface according to current game situation specified
        in parameters.

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)

        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */

    public setup(data: SkyTeamGameData) {
        log( "Starting game setup" );
        log('gamedatas', data);

        const maintitlebarContent = $('maintitlebar_content');
        dojo.place('<div id="st-communication-wrapper"><div id="st-communication-info"></div></div>', $('pagesection_gameview'), 'last')
        dojo.place('<div id="st-player-dice-wrapper"><div id="st-player-dice"></div></div>', maintitlebarContent, 'last')
        dojo.place('<div id="st-custom-actions"></div>', maintitlebarContent, 'last')
        dojo.place('<div id="st-final-round-notice"></div>', maintitlebarContent, 'last')

        // Setup modules
        this.zoomManager = new AutoZoomManager('st-game', 'st-zoom-level')
        this.animationManager = new AnimationManager(this, {duration: ANIMATION_MS})

        // Setup Managers
        this.playerRoleManager.setUp(data);
        this.planeManager.setUp(data);
        this.reserveManager.setUp(data);
        this.diceManager.setUp(data);
        this.communicationInfoManager.setUp(data);
        this.actionSpaceManager.setUp(data);

        // Setup UI
        this.playerSetup = new PlayerSetup(this, 'st-player-setup');
        this.endGameInfo = new EndGameInfo(this,'st-end-game-info-wrapper');
        this.spendCoffee = new SpendCoffee(this,'st-custom-actions');

        if (data.finalRound && !data.isLanded) {
            this.setFinalRound();
        }

        if (data.isLanded) {
            this.endGameInfo.setEndGameInfo(data.victoryConditions)
        } else  {
            this.endGameInfo.setFailureReason(data.failureReason)
        }

        this.setupNotifications();
        log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    public onEnteringState(stateName: string, args: any) {
        log('Entering state: ' + stateName, args.args);

        switch (stateName) {
            case 'playerSetup':
                this.enteringPlayerSetup();
                break;
            case 'strategy':
                this.enteringStrategy();
                break;
            case 'dicePlacementSelect':
                this.enteringDicePlacementSelect(args.args);
                break;
            case 'rerollDice':
                this.enteringRerollDice();
                break;
        }
    }

    private enteringPlayerSetup() {
        this.diceManager.toggleShowPlayerDice(false);
        this.playerSetup.setUp();
    }

    private enteringStrategy() {
        this.diceManager.toggleShowPlayerDice(false);
    }

    private enteringRerollDice() {
        this.diceManager.toggleShowPlayerDice(true);
        if ((this as any).isCurrentPlayerActive()) {
            this.diceManager.setSelectionMode('multiple');
        }
    }

    private enteringDicePlacementSelect(args: DicePlacementSelectArgs) {
        this.diceManager.toggleShowPlayerDice(true);
        if ((this as any).isCurrentPlayerActive()) {
            this.diceManager.setSelectionMode('single', (selection) => this.onDicePlacementDiceSelected(args, selection));
        }
    }

    private onDicePlacementDiceSelected(args: DicePlacementSelectArgs, selection: Dice[]) {
        dojo.addClass('confirmPlacement', 'disabled');
        this.actionSpaceManager.setActionSpacesSelectable({}, null);
        if (selection.length == 1) {
            const die = selection[0];
            this.actionSpaceManager.setActionSpacesSelectable(args.availableActionSpaces, (space) => this.onDicePlacementActionSelected(args, die, space), die.side);
            this.spendCoffee.initiate(die, args.nrOfCoffeeAvailable, (die) => this.onDicePlacementCoffeeSpend(args, die));
        } else {
            this.spendCoffee.initiate(null, 0, null);
        }
    }

    private onDicePlacementActionSelected(args: DicePlacementSelectArgs, die: Dice, space: string) {
        document.querySelector('.st-dice-placeholder')?.remove();
        if (space) {
            const dieElement = this.diceManager.getCardElement(die);
            const dieElementClonePlaceholder = dieElement.cloneNode(true) as any;
            dieElementClonePlaceholder.id = dieElementClonePlaceholder.id + '-clone';
            dieElementClonePlaceholder.classList.add('st-dice-placeholder');
            dieElementClonePlaceholder.classList.remove('bga-cards_selectable-card');
            dieElementClonePlaceholder.classList.remove('bga-cards_selected-card');
            $(space).appendChild(dieElementClonePlaceholder);
            dojo.removeClass('confirmPlacement', 'disabled');
        } else {
            dojo.addClass('confirmPlacement', 'disabled');
        }
    }

    private onDicePlacementCoffeeSpend(args: DicePlacementSelectArgs, die: Dice) {
        dojo.addClass('confirmPlacement', 'disabled');
        this.actionSpaceManager.setActionSpacesSelectable({}, null);
        this.actionSpaceManager.setActionSpacesSelectable(args.availableActionSpaces, (space) => this.onDicePlacementActionSelected(args, die, space), die.side);
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
            case 'dicePlacementSelect':
                this.leavingDicePlacementSelect()
                break;
            case 'rerollDice':
                this.leavingRerollDice()
                break;
        }
    }

    private leavingDicePlacementSelect() {
        if ((this as any).isCurrentPlayerActive()) {
            this.actionSpaceManager.selectedActionSpaceId = null;
            this.actionSpaceManager.setActionSpacesSelectable({}, null);
            this.diceManager.setSelectionMode('none', null);
            this.spendCoffee.destroy();
        }
    }

    private leavingRerollDice() {
        this.diceManager.setSelectionMode('none');
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        if ((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
                case 'playerSetup':
                    (this as any).addActionButton('confirmPlayerSetup', _("Confirm"), () => this.confirmPlayerSetup());
                    break;
                case 'strategy':
                    (this as any).addActionButton('confirmReadyStrategy', _("I'm Ready"), () => this.confirmReadyStrategy());
                    break;
                case 'dicePlacementSelect':
                    (this as any).addActionButton('confirmPlacement', _("Confirm"), () => this.confirmPlacement());
                    dojo.addClass('confirmPlacement', 'disabled');
                    break;
                case 'rerollDice':
                    (this as any).addActionButton('rerollDice', _("Reroll selected dice"), () => this.rerollDice());
                    break;
            }

            if (args?.canCancelMoves) {
                (this as any).addActionButton('undoLast', _("Undo last"), () => this.undoLast(), null, null, 'red');
                (this as any).addActionButton('undoAll', _("Undo all"), () => this.undoAll(), null, null, 'red');
            }
        }
        if (!this.isReadOnly()) {
            switch (stateName) {
                case 'dicePlacementSelect':
                    if ((args as DicePlacementSelectArgs).nrOfRerollAvailable > 0) {
                        (this as any).addActionButton('useReroll', `<span>${dojo.string.substitute(_("Use ${token} to reroll dice"), { token: this.tokenIcon('reroll') })}</span>`, () => this.requestReroll(), null, null, 'gray');
                    }
                    break;
            }
        }
    }

    private confirmReadyStrategy() {
        this.takeAction('confirmReadyStrategy')
    }

    private confirmPlacement() {
        document.querySelector('.st-dice-placeholder')?.remove();
        const actionSpaceId = this.actionSpaceManager.selectedActionSpaceId;
        const diceId = this.diceManager.playerDiceStock.getSelection()[0].id;
        const diceValue = this.spendCoffee.currentDie ? this.spendCoffee.currentDie.side : null;

        this.actionSpaceManager.selectedActionSpaceId = null;
        this.actionSpaceManager.setActionSpacesSelectable({}, null);
        this.diceManager.setSelectionMode('none', null);
        this.spendCoffee.destroy();

        this.takeAction('confirmPlacement', {
            placement: JSON.stringify({actionSpaceId, diceId, diceValue})
        });
    }

    private confirmPlayerSetup() {
        if (this.playerSetup.selectedRole) {
            this.takeAction('confirmPlayerSetup', {
                settings: JSON.stringify({
                    activePlayerRole: this.playerSetup.selectedRole
                })
            })
        }
    }

    private requestReroll() {
        this.wrapInConfirm(() => {
            this.takeAction('requestReroll');
        }, _('This action allows players to use a re-roll token to re-roll any number of their dice. This action cannot be undone.'))
    }

    private rerollDice() {
        const selectedDieIds = this.diceManager.playerDiceStock.getSelection().map(die => die.id);
        this.wrapInConfirm(() => {
            this.diceManager.setSelectionMode('none');
            this.takeNoLockAction('rerollDice', {payload: JSON.stringify({selectedDieIds})});
        }, dojo.string.substitute(_("You have chosen to re-roll ${nrOfSelectedDice} dice. This action cannot be undone."), { nrOfSelectedDice: selectedDieIds.length + '' }))
    }

    private undoLast() {
        this.takeNoLockAction('undoLast');
    }

    private undoAll() {
        this.takeNoLockAction('undoAll');
    }

    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////

    private setFinalRound() {
        dojo.place(`<p>${_('This is the final round!')}</p>`, $('st-final-round-notice'))
    }

    public getFailureReasonTitle(failureReason: string) {
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

    public getFailureReasonText(failureReason: string) {
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

    private disableActionButtons() {
        const buttons = document.querySelectorAll('.action-button')
        buttons.forEach(button => {
            button.classList.add('disabled');
        })
    }

    public isReadOnly() {
        return (this as any).isSpectator || typeof g_replayFrom != 'undefined' || g_archive_mode;
    }

    public getPlayerId(): number {
        return Number((this as any).player_id);
    }

    public getPlayer(playerId: number): SkyTeamPlayer {
        return Object.values(this.gamedatas.players).find(player => Number(player.id) == playerId);
    }

    public takeAction(action: string, data?: any, onComplete: () => void = () => {}) {
        data = data || {};
        data.lock = true;
        (this as any).ajaxcall(`/skyteam/skyteam/${action}.html`, data, this, onComplete);
    }
    public takeNoLockAction(action: string, data?: any, onComplete: () => void = () => {}) {
        this.disableActionButtons();
        data = data || {};
        (this as any).ajaxcall(`/skyteam/skyteam/${action}.html`, data, this, onComplete);
    }

    public setTooltip(id: string, html: string) {
        (this as any).addTooltipHtml(id, html, TOOLTIP_DELAY);
    }
    public setTooltipToClass(className: string, html: string) {
        (this as any).addTooltipHtmlToClass(className, html, TOOLTIP_DELAY);
    }

    private setScore(playerId: number, score: number) {
        (this as any).scoreCtrl[playerId]?.toValue(score);
    }

    private isAskForConfirmation() {
        return true; // For now always ask for confirmation, might make this a preference later on.
    }

    private wrapInConfirm(runnable: () => void, message: string = _("This action can not be undone. Are you sure?")) {
        if (this.isAskForConfirmation()) {
            (this as any).confirmationDialog(message, () => {
                runnable();
            });
        } else {
            runnable();
        }
    }

    public delay = async (ms: number) => {
        if (this.instantaneousMode) {
            await Promise.resolve();
        } else {
            await new Promise(resolve => setTimeout(resolve, ms))
        }
    }

    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications

    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    setupNotifications() {
        log( 'notifications subscriptions setup' );

        const notifs = [
            ['newPhaseStarted', 1],
            ['playerRoleAssigned', undefined],
            ['tokenReceived', undefined],
            ['diceRolled', undefined],
            ['diePlaced', undefined],
            ['planeAxisChanged', undefined],
            ['planeFailure', undefined],
            ['planeApproachChanged', undefined],
            ['planeTokenRemoved', undefined],
            ['planeSwitchChanged', undefined],
            ['planeAerodynamicsChanged', undefined],
            ['planeBrakeChanged', undefined],
            ['coffeeUsed', undefined],
            ['rerollTokenUsed', undefined],
            ['planeAltitudeChanged', undefined],
            ['diceReturnedToPlayer', undefined],
            ['victoryConditionsUpdated', 1],
            ['planeLanded', undefined],
            ['newRoundStarted', 1]
            // ['shortTime', 1],
            // ['fixedTime', 1000]
        ];

        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, notifDetails => {
                log(`notif_${notif[0]}`, notifDetails.args);

                const promise = this[`notif_${notif[0]}`](notifDetails.args);

                // tell the UI notification ends
                promise?.then(() => (this as any).notifqueue.onSynchronousNotificationEnd());
            });
            // make all notif as synchronous
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }

    private notif_newPhaseStarted(args: NotifNewPhaseStarted) {
        this.communicationInfoManager.update(args.newPhase);
    }

    private notif_playerRoleAssigned(args: NotifPlayerRoleAssigned) {
        const promise = this.playerRoleManager.setRole(args.playerId, args.role, args.roleColor);
        if (args.playerId === this.getPlayerId()) {
            this.diceManager.playerDiceStock.addCards(args.dice)
        }
        return promise;
    }

    private notif_tokenReceived(args: NotifTokenReceived) {
        if (args.token.type == 'reroll') {
            return this.planeManager.rerollTokenStock.addCard(args.token);
        }else if (args.token.type == 'coffee') {
            return this.planeManager.coffeeTokenStock.addCard(args.token);
        }
        return Promise.resolve();
    }

    private notif_diceRolled(args: NotifDiceRolled) {
        this.diceManager.toggleShowPlayerDice(true);
        args.dice.forEach(die => this.diceManager.updateCardInformations(die));
        return Promise.resolve();
    }

    private notif_diePlaced(args: NotifDiePlaced) {
        return this.actionSpaceManager.moveDieToActionSpace(args.die);
    }

    private notif_planeAxisChanged(args: NotifPlaneAxisChanged) {
        return this.planeManager.updateAxis(args.axis);
    }

    private notif_planeFailure(args: NotifPlaneFailure) {
        return this.endGameInfo.setFailureReason(args.failureReason);
    }

    private notif_planeApproachChanged(args: NotifPlaneApproachChanged) {
        return this.planeManager.updateApproach(args.approach);
    }

    private notif_planeTokenRemoved(args: NotifPlaneTokenRemoved) {
        if (args.plane) {
            return this.reserveManager.reservePlaneStock.addCard(args.plane);
        }
        return Promise.resolve();
    }

    private notif_planeSwitchChanged(args: NotifPlaneSwitchChanged) {
        return this.planeManager.updateSwitch(args.planeSwitch);
    }

    private notif_planeAerodynamicsChanged(args: NotifPlaneAerodynamicsChanged) {
        if (args.aerodynamicsBlue) {
            return this.planeManager.updateAerodynamicsBlue(args.aerodynamicsBlue);
        }
        if (args.aerodynamicsOrange) {
            return this.planeManager.updateAerodynamicsOrange(args.aerodynamicsOrange);
        }
        return Promise.resolve();
    }

    private notif_planeBrakeChanged(args: NotifPlaneBrakeChanged) {
        return this.planeManager.updateBrake(args.brake);
    }

    private notif_coffeeUsed(args: NotifCoffeeUsed) {
        return this.reserveManager.reserveCoffeeStock.addCards(args.tokens);
    }

    private notif_rerollTokenUsed(args: NotifRerollTokenUsed) {
        return this.reserveManager.reserveRerollStock.addCard(args.token);
    }

    private notif_planeAltitudeChanged(args: NotifPlaneAltitudeChanged) {
        return this.planeManager.updateAltitude(args.altitude)
    }

    private notif_diceReturnedToPlayer(args: NotifDiceReturnedToPlayer) {
        this.actionSpaceManager.resetActionSpaceOccupied();
        if (args.playerId == this.getPlayerId()) {
            return this.diceManager.playerDiceStock.addCards(args.dice);
        } else {
            return this.diceManager.otherPlayerDiceStock.addCards(args.dice);
        }
    }

    private notif_victoryConditionsUpdated(args: NotifVictoryConditionsUpdated) {
        this.victoryConditions.updateVictoryConditions(args.victoryConditions);
    }

    private notif_planeLanded(args: NotifPlaneLanded) {
        return this.endGameInfo.setEndGameInfo(args.victoryConditions).then(() => Object.keys(this.gamedatas.players).forEach(playerId => this.setScore(Number(playerId), args.score)));
    }

    private notif_newRoundStarted(args: NotifNewRoundStarted) {
        if (args.finalRound) {
            this.setFinalRound();
        }
    }

    public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {
                Object.keys(args).forEach(argKey => {
                    if (argKey.startsWith('token_') && typeof args[argKey] == 'string') {
                        args[argKey] = this.tokenIcon(args[argKey])
                    } else if (argKey.startsWith('icon_dice') && typeof args[argKey] == 'object') {
                        const diceIcons = args[argKey].map((die: Dice) => this.diceIcon(die))
                        args[argKey] = diceIcons.join('');
                    } else if (argKey.startsWith('icon_tokens') && typeof args[argKey] == 'object') {
                        const tokenIcons = args[argKey].map((token: Card) => this.tokenIcon(token.type))
                        args[argKey] = tokenIcons.join(' ');
                    } else if (argKey.startsWith('icon_plane_marker') && typeof args[argKey] == 'string') {
                        args[argKey] = this.planeMarkerIcon(args[argKey])
                    } else if (argKey.startsWith('icon_switch') && typeof args[argKey] == 'number') {
                        args[argKey] = this.switchIcon()
                    }
                })
            }
        } catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }

    public updatePlayerOrdering() {
        (this as any).inherited(arguments);
        dojo.place(`<div id="st-victory-conditions-panel" class="player-board st-victory-conditions" style="height: auto;"></div>`, `player_boards`, 'first');
        this.victoryConditions = new VictoryConditions(this, 'st-victory-conditions-panel');
        this.victoryConditions.updateVictoryConditions(this.gamedatas.victoryConditions);
    }

    public formatWithIcons(description) {
        //@ts-ignore
        // return bga_format(_(description), {
        //     '_': (t) => this.tokenIcon(t.replace('icon-', ''))
        // });
        return '';
    }

    public tokenIcon(type) {
        return `<span class="st-token token small" data-type="${type}"></span>`
    }

    public planeMarkerIcon(type) {
        return `<span class="st-plane-marker token small" data-type="${type}"></span>`
    }

    public switchIcon() {
        return `<span class="st-plane-switch"></span>`
    }

    public diceIcon(die: Dice) {
        return `<span class="st-dice" data-type="${die.typeArg}" data-value="${die.side}">
                    <span class="side" data-side="1"></span>
                    <span class="side" data-side="2"></span>
                    <span class="side" data-side="3"></span>
                    <span class="side" data-side="4"></span>
                    <span class="side" data-side="5"></span>
                    <span class="side" data-side="6"></span>
               </span>`;
    }

}