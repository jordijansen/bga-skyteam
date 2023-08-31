declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;
declare const g_replayFrom;
declare const g_archive_mode;

const ANIMATION_MS = 20000;
const TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;

const delay = async (ms: number) => {
    await new Promise(resolve => setTimeout(resolve, ms))
}

class SkyTeam implements SkyTeamGame {

    instantaneousMode: boolean;
    notifqueue: {};

    public gamedatas: SkyTeamGameData;
    private zoomManager: ZoomManager;
    public animationManager: AnimationManager;

    // UI elements
    private playerSetup: PlayerSetup;

    // Managers
    public planeManager: PlaneManager;
    private reserveManager: ReserveManager;
    public playerRoleManager: PlayerRoleManager;
    public diceManager: DiceManager;
    public tokenManager: TokenManager;
    public communicationInfoManager: CommunicationInfoManager;
    private actionSpaceManager: ActionSpaceManager;

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
        dojo.place('<div id="st-player-dice"></div>', maintitlebarContent, 'last')

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
            case 'dicePlacementSelect':
                this.enteringDicePlacementSelect(args.args);
                break;
        }
    }

    private enteringPlayerSetup() {
        this.playerSetup = new PlayerSetup(this, 'st-player-setup');
        this.playerSetup.setUp();
    }

    private enteringDicePlacementSelect(args: DicePlacementSelectArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.actionSpaceManager.setActionSpacesSelectable(args.availableActionSpaces, () => this.onDicePlacementSelectChange());
            this.diceManager.setSelectionMode('single', () => this.onDicePlacementSelectChange());
        }
    }

    private onDicePlacementSelectChange() {
        const selectedActionSpaceId = this.actionSpaceManager.selectedActionSpaceId;
        const selectedDice = this.diceManager.playerDiceStock.getSelection()
        document.querySelector('.st-dice-placeholder')?.remove();
        if (selectedActionSpaceId && selectedDice && selectedDice.length === 1) {
            const die = selectedDice[0];
            const dieElement = this.diceManager.getCardElement(die);
            const dieElementClonePlaceholder = dieElement.cloneNode(true) as any;
            dieElementClonePlaceholder.id = dieElementClonePlaceholder.id + '-clone';
            dieElementClonePlaceholder.classList.add('st-dice-placeholder');
            $(selectedActionSpaceId).appendChild(dieElementClonePlaceholder);
            console.log(selectedActionSpaceId + '-' + selectedDice[0].id);
            dojo.removeClass('confirmPlacement', 'disabled');
        } else {
            dojo.addClass('confirmPlacement', 'disabled');
        }
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
            case 'dicePlacementSelect':
                this.leavingDicePlacementSelect();
                break;
        }
    }

    private leavingDicePlacementSelect() {
        if ((this as any).isCurrentPlayerActive()) {
            this.actionSpaceManager.setActionSpacesSelectable({}, null);
            this.diceManager.setSelectionMode('none', null);
        }
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

            }

            if (args?.canCancelMoves) {
                (this as any).addActionButton('undoLast', _("Undo last"), () => this.undoLast(), null, null, 'red');
                (this as any).addActionButton('undoAll', _("Undo all"), () => this.undoAll(), null, null, 'red');
            }
        } else {
            if (!this.isReadOnly()) {
                switch (stateName) {
                    // CHANGE MULTIACTIVE STATE
                }
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
        this.takeAction('confirmPlacement', {
            placement: JSON.stringify({actionSpaceId, diceId})
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

    private undoLast() {
        this.takeNoLockAction('undoLast');
    }

    private undoAll() {
        this.takeNoLockAction('undoAll');
    }

    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////

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
        args.dice.forEach(die => this.diceManager.updateCardInformations(die));
        return Promise.resolve();
    }

    private notif_diePlaced(args: NotifDiePlaced) {
        return this.actionSpaceManager.moveDieToActionSpace(args.die);
    }

    public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {
                Object.keys(args).forEach(argKey => {
                    if (argKey.startsWith('token_') && typeof args[argKey] == 'string') {
                        args[argKey] = this.tokenIcon(args[argKey])
                    } else if (argKey.startsWith('icon_dice') && typeof args[argKey] == 'object') {
                        console.log(args[argKey]);
                        const diceIcons = args[argKey].map((die: Dice) => this.diceIcon(die))
                        args[argKey] = diceIcons.join('');
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
        // Add custom panels
    }

    public formatWithIcons(description) {
        //@ts-ignore
        // return bga_format(_(description), {
        //     '_': (t) => this.tokenIcon(t.replace('icon-', ''))
        // });
        return '';
    }

    public tokenIcon(type) {
        return `<span class="st-token" data-type="${type}"></span>`
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