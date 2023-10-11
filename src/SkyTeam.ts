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
    public welcomeDialog: WelcomeDialog;

    // Managers
    public planeManager: PlaneManager;
    private reserveManager: ReserveManager;
    public playerRoleManager: PlayerRoleManager;
    public diceManager: DiceManager;
    public tokenManager: TokenManager;
    public communicationInfoManager: CommunicationInfoManager;
    private actionSpaceManager: ActionSpaceManager;
    public helpDialogManager: HelpDialogManager;
    public specialAbilityCardManager: SpecialAbilityCardManager;

    // Modules
    private alwaysFixTopActions: boolean;
    private alwaysFixTopActionsMaximum: number;

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
        this.specialAbilityCardManager = new SpecialAbilityCardManager(this);
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
        this.setAlwaysFixTopActions();

        log( "Starting game setup" );
        log('gamedatas', data);

        const maintitlebarContent = $('maintitlebar_content');
        dojo.place('<div id="st-communication-wrapper"><div id="st-communication-info"></div></div>', $('pagesection_gameview'), 'last')
        dojo.place('<div id="st-player-dice-wrapper"><div id="st-player-dice"></div></div>', maintitlebarContent, 'last')
        dojo.place('<div id="st-custom-actions"></div>', maintitlebarContent, 'last')
        dojo.place('<div id="st-final-round-notice"></div>', maintitlebarContent, 'last')

        // Setup modules
        this.zoomManager = new AutoZoomManager(this, 'st-game', 'st-zoom-level')
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
        this.welcomeDialog = new WelcomeDialog(this);
        this.welcomeDialog.showDialog()

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
                this.enteringPlayerSetup(args.args);
                break;
            case 'strategy':
                this.enteringStrategy();
                break;
            case 'dicePlacementSelect':
            case 'performSynchronisation':
                this.enteringDicePlacementSelect(args.args, stateName === 'performSynchronisation');
                break;
            case 'rerollDice':
                this.enteringRerollDice(args.args);
                break;
            case 'flipDie':
                this.enteringFlipDie();
            case 'swapDice':
                this.enteringSwapDice();
        }
    }

    private enteringPlayerSetup(args: PlayerSetupArgs) {
        this.diceManager.toggleShowPlayerDice(false);
        this.playerSetup.setUp(args);
    }

    private enteringStrategy() {
        this.diceManager.toggleShowPlayerDice(false);
    }

    private enteringRerollDice(args: RerollDiceArgs) {
        this.diceManager.toggleShowPlayerDice(true);
        if ((this as any).isCurrentPlayerActive()) {
            this.diceManager.setSelectionMode('multiple', selection => {
                if (selection.length == args.maxNumberOfDice) {
                    this.diceManager.playerDiceStock.setSelectableCards(selection);
                } else {
                    this.diceManager.playerDiceStock.setSelectableCards(this.diceManager.playerDiceStock.getCards());
                }
            });
        }
    }

    private enteringFlipDie() {
        this.diceManager.toggleShowPlayerDice(true);
        if ((this as any).isCurrentPlayerActive()) {
            this.diceManager.setSelectionMode('single');
        }
    }

    private enteringSwapDice() {
        this.diceManager.toggleShowPlayerDice(true);
        if ((this as any).isCurrentPlayerActive()) {
            this.diceManager.setSelectionMode('single');
        }
    }

    private enteringDicePlacementSelect(args: DicePlacementSelectArgs, trafficDieOnly: boolean) {
        this.diceManager.toggleShowPlayerDice(true);
        if ((this as any).isCurrentPlayerActive()) {
            this.diceManager.setSelectionMode('single', (selection) => this.onDicePlacementDiceSelected(args, selection), [], trafficDieOnly ? ['traffic'] : []);
        }
    }

    private onDicePlacementDiceSelected(args: DicePlacementSelectArgs, selection: Dice[]) {
        dojo.addClass('confirmPlacement', 'disabled');
        this.actionSpaceManager.setActionSpacesSelectable({}, null);
        if (selection.length == 1) {
            const die = selection[0];
            this.actionSpaceManager.setActionSpacesSelectable(args.availableActionSpaces, (space) => this.onDicePlacementActionSelected(args, die, space), die.value);
            this.spendCoffee.initiate(die, args.nrOfCoffeeAvailable, (die) => this.onDicePlacementCoffeeSpend(args, die));
        } else {
            this.spendCoffee.initiate(null, 0, null);
        }
    }

    private onDicePlacementActionSelected(args: DicePlacementSelectArgs, die: Dice, space: string) {
        document.querySelector('.st-dice-placeholder')?.remove();
        this.planeManager.unhighlightPlane();

        if (space) {
            const dieElement = this.diceManager.getCardElement(die);
            const dieElementClonePlaceholder = dieElement.cloneNode(true) as any;
            dieElementClonePlaceholder.id = dieElementClonePlaceholder.id + '-clone';
            dieElementClonePlaceholder.classList.add('st-dice-placeholder');
            dieElementClonePlaceholder.classList.remove('bga-cards_selectable-card');
            dieElementClonePlaceholder.classList.remove('bga-cards_selected-card');
            $(space).appendChild(dieElementClonePlaceholder);

            if (space.startsWith('radio')) {
                this.planeManager.highlightApproachSlot(die.value);
            } else if (space.startsWith('axis')) {
                const otherSlot = space === 'axis-1' ? 'axis-2' : 'axis-1';
                const otherDie = this.actionSpaceManager.getDieInLocation(otherSlot);
                if (otherDie) {
                    const pilotValue = space === 'axis-1' ? die.value : otherDie.value;
                    const copilotValue = space === 'axis-2' ? die.value : otherDie.value;
                    const axisChange = copilotValue - pilotValue;

                    this.planeManager.hightlightAxis(this.planeManager.currentAxis + axisChange);
                }
            }
            dojo.removeClass('confirmPlacement', 'disabled');
        } else {
            dojo.addClass('confirmPlacement', 'disabled');
        }
    }

    private onDicePlacementCoffeeSpend(args: DicePlacementSelectArgs, die: Dice) {
        dojo.addClass('confirmPlacement', 'disabled');
        this.actionSpaceManager.setActionSpacesSelectable({}, null);
        this.actionSpaceManager.setActionSpacesSelectable(args.availableActionSpaces, (space) => this.onDicePlacementActionSelected(args, die, space), die.value);
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
            case 'playerSetup':
                this.leavingPlayerSetup();
                break;
            case 'dicePlacementSelect':
                this.leavingDicePlacementSelect()
                break;
            case 'rerollDice':
                this.leavingRerollDice()
                break;
        }
    }

    private leavingPlayerSetup() {
        this.playerSetup.destroy();
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
                    (this as any).addActionButton('confirmPlayerSetup', _("Confirm"), () => this.confirmPlayerSetup(args as PlayerSetupArgs));
                    break;
                case 'strategy':
                    (this as any).addActionButton('confirmReadyStrategy', _("I'm Ready"), () => this.confirmReadyStrategy());
                    break;
                case 'dicePlacementSelect':
                    (this as any).addActionButton('confirmPlacement', _("Confirm"), () => this.confirmPlacement());
                    dojo.addClass('confirmPlacement', 'disabled');

                    if ((args as DicePlacementSelectArgs).canActivateAdaptation) {
                        (this as any).addActionButton('useAdaptation', _("Use Special Ability: Adaptation"), () => this.requestAdaptation(), null, null, 'gray');
                    }
                    break;
                case 'rerollDice':
                    (this as any).addActionButton('rerollDice', _("Reroll selected dice"), () => this.rerollDice());
                    break;
                case 'flipDie':
                    (this as any).addActionButton('rerollDice', _("Flip selected die"), () => this.flipDie());
                    (this as any).addActionButton('cancel', _("Cancel"), () => this.cancelAdaptation(), null, null, 'gray');
                    break;
                case 'swapDice':
                    const swapDiceArgs = args as SwapDiceArgs;
                    const SwapDieButtonText = swapDiceArgs.firstDie ? `${dojo.string.substitute(_("Swap selected die value with ${die}"), { die: swapDiceArgs.firstDie.side })}` : _('Swap selected die');
                    (this as any).addActionButton('swapDie', SwapDieButtonText, () => this.swapDie(args.firstDie));
                    if (!swapDiceArgs.firstDie) {
                        (this as any).addActionButton('cancel', _("Cancel"), () => this.cancelSwap(), null, null, 'gray');
                    }
                    break;
                case 'performSynchronisation':
                    (this as any).addActionButton('confirmPlacement', _("Confirm"), () => this.confirmPlacement());
                    dojo.addClass('confirmPlacement', 'disabled');
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
                case 'performSynchronisation':
                    if ((args as DicePlacementSelectArgs).canActivateWorkingTogether) {
                        (this as any).addActionButton('useWorkingTogether', _("Use Special Ability: Working Together"), () => this.requestSwap(), null, null, 'gray');
                    }
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
        const actionSpaceId = this.actionSpaceManager.selectedActionSpaceId;
        const diceId = this.diceManager.playerDiceStock.getSelection()[0].id;
        const diceValue = this.spendCoffee.currentDie ? this.spendCoffee.currentDie.side : null;

        let confirmMessage = undefined;
        if (actionSpaceId.startsWith('radio') && document.querySelectorAll('.st-approach-overlay-track-slot-highlighted').length === 0) {
            confirmMessage = _('Your Radio reach is outside of the Approach Track. This action has no effect.');
        } else if (actionSpaceId.startsWith('concentration') && this.reserveManager.reserveCoffeeStock.getCards().length === 0) {
            confirmMessage = _('No Coffee tokens remaining. This action has no effect.');
        }

        const runnable = () => {
            this.actionSpaceManager.selectedActionSpaceId = null;
            this.actionSpaceManager.setActionSpacesSelectable({}, null);
            this.diceManager.setSelectionMode('none', null);
            this.spendCoffee.destroy();

            this.takeAction('confirmPlacement', {
                placement: JSON.stringify({actionSpaceId, diceId, diceValue})
            })
        };

        if (confirmMessage) {
            this.wrapInConfirm(runnable, confirmMessage);
        } else {
            runnable();
        }

    }

    private confirmPlayerSetup(args: PlayerSetupArgs) {
        if (!this.playerSetup.selectedRole) {
            (this as any).showMessage(_("You need to select a role"), 'error')
            return;
        }

        if (this.playerSetup.selectedSpecialAbilities.length != args.nrOfSpecialAbilitiesToSelect) {
            (this as any).showMessage(_("You need to select a special ability card(s)"), 'error')
            return;
        }

        this.takeAction('confirmPlayerSetup', {
            settings: JSON.stringify({
                activePlayerRole: this.playerSetup.selectedRole,
                specialAbilityCardIds: this.playerSetup.selectedSpecialAbilities.map(card => card.id)
            })
        })
    }

    private requestReroll() {
        this.wrapInConfirm(() => {
            this.takeAction('requestReroll');
        }, _('This action allows players to use a re-roll token to re-roll any number of their dice. This action cannot be undone.'))
    }

    private requestAdaptation() {
        this.takeAction('requestAdaptation');
    }

    private requestSwap() {
        this.takeAction('requestSwap');
    }

    private cancelAdaptation() {
        this.diceManager.setSelectionMode('none');
        this.takeAction('cancelAdaptation');
    }

    private cancelSwap() {
        this.diceManager.setSelectionMode('none');
        this.takeAction('cancelSwap');
    }

    private rerollDice() {
        const selectedDieIds = this.diceManager.playerDiceStock.getSelection().map(die => die.id);
        this.wrapInConfirm(() => {
            this.diceManager.setSelectionMode('none');
            this.takeNoLockAction('rerollDice', {payload: JSON.stringify({selectedDieIds})});
        }, dojo.string.substitute(_("You have chosen to re-roll ${nrOfSelectedDice} dice. This action cannot be undone."), { nrOfSelectedDice: selectedDieIds.length + '' }))
    }

    private flipDie() {
        const selectedDice = this.diceManager.playerDiceStock.getSelection();
        if (selectedDice.length !== 1) {
            (this as any).showMessage(_("You need to select a die to flip"), 'error')
            return;
        }
        const selectedDie = selectedDice[0];
        const selectedDieId = selectedDie.id;

        this.wrapInConfirm(() => {
            this.diceManager.setSelectionMode('none');
            this.takeNoLockAction('flipDie', {payload: JSON.stringify({selectedDieId})});
        }, dojo.string.substitute(_('Do you want to flip ${originalDie} to ${newDie}? This action cannot be undone.'), { originalDie: this.diceIcon(selectedDie), newDie: this.diceIcon({...selectedDie, side: 7 - selectedDie.side}) }))
    }

    private swapDie(firstDie) {
        const selectedDice = this.diceManager.playerDiceStock.getSelection();
        if (selectedDice.length !== 1) {
            (this as any).showMessage(_("You need to select a die to swap"), 'error')
            return;
        }
        const selectedDie = selectedDice[0];
        const selectedDieId = selectedDie.id;

        let confirmText = dojo.string.substitute(_('Do you want to swap ${die}? This action cannot be undone.'), { die: this.diceIcon(selectedDie) });
        if (firstDie) {
            confirmText = dojo.string.substitute(_('Do you want to swap the values of ${die} and ${firstDie}? This action cannot be undone.'), { die: this.diceIcon(selectedDie), firstDie: this.diceIcon(firstDie) });
        }

        this.wrapInConfirm(() => {
            this.diceManager.setSelectionMode('none');
            this.takeNoLockAction('swapDie', {payload: JSON.stringify({selectedDieId})});
        }, confirmText)
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
            case 'failure-turn':
                return _('Turn Failure');
            case 'failure-kerosene':
                return _('Ran out of Kerosene');
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
            case 'failure-turn':
                return _('When you advance the Approach Track, if the airplane’s Axis is not in one of the permitted positions, you lose the game. This also applies to both spaces you fly through if you advance 2 spaces during the round. If you do not advance the Approach Track (you move 0 spaces), you do not need to follow these constraints.')
            case 'failure-kerosene':
                return _('At any time during the game, even in the final round, if you hit the X space on the Kerosene track, you have run out of kerosene and you’ve lost the game!')
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
        if ((this as any).checkLock()) {
            data = data || {};
            data.lock = true;
            (this as any).ajaxcall(`/skyteam/skyteam/${action}.html`, data, this, onComplete);
        }
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
        if ((this as any).checkLock()) {
            if (this.isAskForConfirmation()) {
                (this as any).confirmationDialog(message, () => {
                    runnable();
                });
            } else {
                runnable();
            }
        }
    }

    public delay = async (ms: number) => {
        if (this.animationManager.animationsActive()) {
            await new Promise(resolve => setTimeout(resolve, ms))
        } else {
            await Promise.resolve();
        }
    }

    public setAlwaysFixTopActions(alwaysFixed = true, maximum = 30) {
        this.alwaysFixTopActions = alwaysFixed;
        this.alwaysFixTopActionsMaximum = maximum;
        this.adaptStatusBar();
    }

    public adaptStatusBar() {
        (this as any).inherited(arguments);

        if (this.alwaysFixTopActions) {
            const afterTitleElem = document.getElementById('after-page-title');
            const titleElem = document.getElementById('page-title');
            //@ts-ignore
            let zoom = getComputedStyle(titleElem).zoom;
            if (!zoom) {
                zoom = 1;
            }

            const titleRect = afterTitleElem.getBoundingClientRect();
            if (titleRect.top < 0 && (titleElem.offsetHeight < (window.innerHeight * this.alwaysFixTopActionsMaximum / 100))) {
                const afterTitleRect = afterTitleElem.getBoundingClientRect();
                titleElem.classList.add('fixed-page-title');
                titleElem.style.width = ((afterTitleRect.width - 10) / zoom) + 'px';
                afterTitleElem.style.height = titleRect.height + 'px';
            } else {
                titleElem.classList.remove('fixed-page-title');
                titleElem.style.width = 'auto';
                afterTitleElem.style.height = '0px';
            }
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
            ['specialAbilitiesSelected', undefined],
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
            ['newRoundStarted', 1],
            ['trafficDieRolled', undefined],
            ['trafficDiceReturned', 1],
            ['planeKeroseneChanged', 1],
            ['diceRemoved', 1],
            ['windChanged', undefined],
            ['playerUsedAdaptation', 1]
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

    private notif_specialAbilitiesSelected(args: NotifSpecialAbilitiesSelected) {
        return this.planeManager.specialAbilityCardStock.addCards(args.cards);
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
        const promises = args.dice.map(die => {
            let cardStock = this.diceManager.getCardStock(die);
            if (!cardStock) {
                this.diceManager.playerDiceStock.addCard(die);
                cardStock = this.diceManager.getCardStock(die);
            }
            const originalDie = cardStock.getCards().find(originalDie => originalDie.id === die.id);
            this.diceManager.updateDieValue({...originalDie, side: 7 - die.side})
            return this.delay(500).then(() => this.diceManager.updateDieValue(die));
        });
        return Promise.all(promises);
    }

    notif_playerUsedAdaptation(args: NotifPlayerUsedAdaptation) {
        this.specialAbilityCardManager.updateRolesThatUsedCard(this.planeManager.specialAbilityCardStock.getCards().find(card => card.type === 2), args.rolesThatUsedAdaptation)
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
            return this.reserveManager.reservePlaneStock.addCard(args.plane, {});
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
        this.diceManager.toggleShowPlayerDice(false);
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

    private notif_trafficDieRolled(args: NotifTrafficDieRolled) {
        return this.diceManager.trafficDiceStock.addCard({...args.trafficDie, side: args.trafficDie.side == 1 ? 6 : 1})
            .then(() => this.diceManager.updateDieValue(args.trafficDie))
            .then(() => this.planeManager.approachTokenStock.addCard(args.planeToken, {fromElement: $(DiceManager.TRAFFIC_DICE)}));
    }

    private notif_trafficDiceReturned() {
        this.diceManager.trafficDiceStock.removeAll();
    }

    private notif_planeKeroseneChanged(args: NotifPlaneKeroseneChanged) {
        return this.planeManager.updateKerosene(args.kerosene);
    }

    private notif_diceRemoved(args: NotifDiceRemoved) {
        this.actionSpaceManager.removeDice(args.dice);
    }

    private notif_windChanged(args: NotifWindChanged) {
        return this.planeManager.updateWind(args.wind);
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
                    } else if (argKey.startsWith('icon_kerosene_marker')  && typeof args[argKey] == 'string') {
                        args[argKey] = this.keroseneMarkerIcon()
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
        return `<span class="st-plane-switch small"></span>`
    }

    public keroseneMarkerIcon() {
        return `<span class="st-kerosene-marker small"></span>`
    }

    public diceIcon(die: Dice, additionalStyle: string = '') {
        return `<span class="st-dice small" data-type="${die.typeArg}" data-value="${die.side}" style="${additionalStyle}">
                    <span class="side" data-side="1"></span>
                    <span class="side" data-side="2"></span>
                    <span class="side" data-side="3"></span>
                    <span class="side" data-side="4"></span>
                    <span class="side" data-side="5"></span>
                    <span class="side" data-side="6"></span>
               </span>`;
    }
}