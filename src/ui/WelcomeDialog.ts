class WelcomeDialog {

    private readonly localStorageKey: string = 'skyteam-welcome-dialog-2';
    private readonly dialogId: string = 'stWelcomeDialogId';
    private dialog;

    constructor(private game: SkyTeamGame) {
        dojo.place('<div id="bga-help_buttons"><button class="bga-help_button bga-help_popin-button">?</button></div>', $('left-side'))
        dojo.connect($('bga-help_buttons'), 'click', () => this.showDialog(true))
    }

    public showDialog(force = false) {
        if (!this.isHideWelcomeScreen() || force) {
            this.dialog = new ebg.popindialog();
            this.dialog.create(this.dialogId);
            this.dialog.setTitle(`<i class="fa fa-plane" aria-hidden="true"></i> ${_('Welcome to Sky Team!')}`);
            this.dialog.setContent( this.createContent() );
            this.dialog.show();

            dojo.connect($('welcome-dialog-hide'), 'change', (event) => {
                dojo.stopEvent(event);
                if (event.target.checked) {
                    localStorage.setItem(this.localStorageKey, 'hide');
                } else {
                    localStorage.setItem(this.localStorageKey, 'show');
                }
            });
        }
    }

    private createContent() {
        let html = ''
        html += `<p><b>${_('NEW: In this BGA version you will find all the Special Scenarios available on <a href="https://www.scorpionmasque.com/Skyteam/">scorpionmasque.com/Skyteam/</a>. This is our way of thanking you for stepping into our cockpit in such great numbers. Find even more Scenarios in the physical Sky Team game.')}</b></p>`;
        html += `<div style="display: flex; justify-content: center;"><img src="${g_gamethemeurl}/img/skyteam-logo.png" width="100%" style="max-width: 300px;"></img></div>`;
        html += `<p>${_('In this cooperative game, you play a team of pilots charged with landing your commercial airliner at airports all over the world. But landing an airplane is not as easy as you might think! You’ll need to communicate with the Control Tower to make sure your approach is free of air traffic, adjust your speed to not overshoot the airport, level your plane in order to land square with the ground, deploy your flaps to increase lift and allow you to descend more steeply, deploy your landing gear to ensure a safe landing, and finally engage the brakes to slow the plane once you\'ve landed. Cooperation and nerves of steel are all it takes to succeed!')}</p>`;
        html += `<h1>${_('Communications')}</h1>`;
        html += `<p>${_('In Sky Team, there are 2 ways to communicate: Verbally, before rolling the dice; and by placing your die during the Dice Placement phase without talking. While nothing restricts you from talking during the dice placement phase, talking and discussing strategy is against the intended nature of the game. Watch out for the communication banner during the game to know when you are allowed to communicate verbally. You can also click on the banners for more info.')}</p>`;
        html += `<img src="${g_gamethemeurl}/img/skyteam-welcome-comms-banners.png" width="100%"></img>`;
        html += `<h1>${_('Preferences')}</h1>`;
        html += `<p>${_('Once you are familiar with the game you can hide the communications banner and/or help buttons to have a cleaner interface. Go to the preferences panel through the BGA menu.')}</p>`;
        html += `<h3 style="text-align: center">${_('Enjoy Sky Team!')}</br>Le Scorpion Masque</h3>`;
        html += `</br>`;
        html += `<label for="welcome-dialog-hide" style="cursor: pointer;"><input id="welcome-dialog-hide" type="checkbox" ${this.isHideWelcomeScreen() ? 'checked="checked"' : ''} /> ${_('Hide this Welcome Screen when opening the table (you can always access it through the ? in the bottom left corner)')}</label>`;

        return html;
    }

    private isHideWelcomeScreen() {
        return localStorage.getItem(this.localStorageKey) === 'hide';
    }
}