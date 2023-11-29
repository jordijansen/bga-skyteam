class RealTimeCounter {

    // Warning occurs at 10s
    public WARNING_THRESHOLD = 20;
    // Alert occurs at 5s
    public ALERT_THRESHOLD = 10;

    public secondsRemaining = 0;
    private timerInterval;
    private dialog;
    constructor(private game: SkyTeamGame, private onTimerFinished: () => void) {
        if (game.gamedatas.scenario.modules.includes('real-time')) {
            dojo.place(`<div id="st-real-time-wrapper" class="player-board" style="height: auto;">
                                <p>${_('Time Remaining')}</p>
                                <div class="st-real-time-base-timer">
                                  <span id="st-real-time-help" class="st-action-space-help right"><i class="fa fa-question-circle" aria-hidden="true"></i></span>
                                  <svg class="st-real-time-base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                    <g class="st-real-time-base-timer__circle">
                                      <circle class="st-real-time-base-timer__path-elapsed" cx="50" cy="50" r="45" />
                                      <path
                                        id="st-real-time-base-timer-remaining"
                                        stroke-dasharray="283"
                                        class="st-real-time-base-timer-remaining green"
                                        d="
                                          M 50, 50
                                          m -45, 0
                                          a 45,45 0 1,0 90,0
                                          a 45,45 0 1,0 -90,0
                                        "
                                      ></path>
                                    </g>
                                  </svg>
                                  <span id="st-real-time-base-timer-label" class="st-real-time-base-timer-label">
                                    ${game.gamedatas.realTimeSecondsRemaining >= 0 ? game.gamedatas.realTimeSecondsRemaining : game.gamedatas.timerSeconds}
                                  </span>
                                </div>
                            </div>`, `player_boards`, 'first')

            if (game.gamedatas.realTimeSecondsRemaining >= 0) {
                this.start(game.gamedatas.realTimeSecondsRemaining);
            }
            if (game.gamedatas.timerNeedsClearing) {
                this.showTimerRanOutDialog();
            }
            dojo.connect($(`st-real-time-help`), 'onclick', (event) => this.game.helpDialogManager.showModuleHelp(event, 'real-time'))
        }
    }

    public start(seconds: number) {
        this.secondsRemaining = seconds;
        this.setCircleDasharray();
        this.setRemainingPathColor();
        this.timerInterval = setInterval(() => {
            if (this.secondsRemaining <= 0) {
                clearInterval(this.timerInterval);
            } else {
                this.secondsRemaining -= 1;
                document.getElementById("st-real-time-base-timer-label").innerHTML = this.secondsRemaining + '';
                if (this.secondsRemaining <= 0) {
                    clearInterval(this.timerInterval);
                    this.showTimerRanOutDialog();
                }
                this.setCircleDasharray();
                this.setRemainingPathColor();
            }
        }, 1000);
    }

    private showTimerRanOutDialog() {
        this.dialog = new ebg.popindialog();
        this.dialog.create( 'realTimeTimerDialog' );
        this.dialog.setTitle( _("Time's Up!") );
        this.dialog.setMaxWidth( 500 ); // Optional

        this.dialog.setContent(`<p>${_('The timer has run out of time. Close this dialog to end the Dice Placement phase.')}</p>`);
        this.dialog.show();
        this.dialog.replaceCloseCallback(() => { this.onTimerFinished(); this.dialog.hide();});
    }

    public clear() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    public calculateTimeFraction() {
        const rawTimeFraction = this.secondsRemaining / this.game.gamedatas.timerSeconds;
        return rawTimeFraction - (1 / this.game.gamedatas.timerSeconds) * (1 - rawTimeFraction);
    }

    public setCircleDasharray() {
        const circleDasharray = `${(
            this.calculateTimeFraction() * 283
        ).toFixed(0)} 283`;
        document.getElementById("st-real-time-base-timer-remaining")
            .setAttribute("stroke-dasharray", circleDasharray);
    }

    public setRemainingPathColor() {
        const remainingPath = document.getElementById("st-real-time-base-timer-remaining");
        remainingPath.classList.remove('green', 'warning', 'alert');
        if (this.secondsRemaining > this.WARNING_THRESHOLD) {
            remainingPath.classList.add('green');
        } else if (this.secondsRemaining > this.ALERT_THRESHOLD) {
            remainingPath.classList.add('warning');
        } else {
            remainingPath.classList.add('alert');
        }
    }
}