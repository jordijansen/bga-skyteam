class WelcomeDialog {

    private readonly localStorageKey: string = 'skyteam-welcome-dialog-5';
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
            this.dialog.setTitle(`<i class="fa fa-plane" aria-hidden="true"></i> ${_('Welcome to Turbulence, an expansion for Sky Team.')}`);
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
        html += `<p><b>${_("NEW: new scenarios WAW - Warsaw Chopin Yellow + Red now available! You tried to deploy your landing gear... to no avail. You'll have to perform a belly landing, but first you needed to climb back up and circle high above the Polish capital to burn the remainder of your fuel. The last thing you need is a full tank when the sparks start to fly. The F-16s have kept you company for everyone's safety, but now it's time to put her down. Carefully, very carefully.")}</b></p>`;
        html += `<div style="display: flex; justify-content: center;"><img src="${g_gamethemeurl}/img/skyteam-logo.png" width="100%" style="max-width: 300px;"></img></div>`;
        html += `<p>${_('In this cooperative game, you play a team of pilots charged with landing your commercial airliner at airports all over the world. But landing an airplane is not as easy as you might think! ')}</p>`;
        html += `<h1>${_('Communications')}</h1>`;
        html += `<p>${_('In Sky Team, there are 2 ways to communicate: Verbally, before rolling the dice; and by placing your die during the Dice Placement phase without talking. While nothing restricts you from talking during the dice placement phase, talking and discussing strategy is against the intended nature of the game. Watch out for the communication banner during the game to know when you are allowed to communicate verbally. You can also click on the banners for more info.')}</p>`;
        html += `<img class="st-example-image" src="${g_gamethemeurl}/img/skyteam-welcome-comms-banners.png" width="100%"></img>`;
        html += `<h3 style="text-align: center">${_('Enjoy Sky Team!')}</br>Le Scorpion Masque</h3>`;
        html += `</br>`;
        html += `<label for="welcome-dialog-hide" style="cursor: pointer;"><input id="welcome-dialog-hide" type="checkbox" ${this.isHideWelcomeScreen() ? 'checked="checked"' : ''} /> ${_('Hide this Welcome Screen when opening the table (you can always access it through the ? in the bottom left corner)')}</label>`;

        return html;
    }

    private isHideWelcomeScreen() {
        return localStorage.getItem(this.localStorageKey) === 'hide';
    }
}