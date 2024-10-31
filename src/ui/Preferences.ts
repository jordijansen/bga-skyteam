interface SettingBase {
    id?: string,
    name: string,
    type: 'slider' | 'checkbox' | 'select' | 'category' | 'text',
    defaultValue?: any,
    onChanged?: (newValue) => void
}

interface ChangeableSetting extends SettingBase {

}

interface SliderSetting extends ChangeableSetting {
    min: number,
    max: number,
    steps: number,
}

interface SelectSetting extends ChangeableSetting {
    options: any[]
}

interface CheckboxSetting extends ChangeableSetting {

}

class Preferences {

    private static game: SkyTeam;
    public static addButton(game: SkyTeam, targetId: string) {
        dojo.place(`<div id="jj-preferences-panel">
                            <div id="jj-preferences-panel-toggle-button"><i class="fa6 fa6-sliders"></i></div>
                            <div id="jj-preferences-panel-content" style="display: none;">
                                ${this.getSettings().map(setting => {
            if (setting.type === 'category') {
                return `<h2 class="jj-preferences-panel-category-label">${setting.name}</h2>`
            } else if (setting.type === 'text') {
                return `<p class="jj-preferences-panel-text">${setting.name}</p>`
            } else if (setting.type === 'slider') {
                // @ts-ignore
                const s = setting as SliderSetting;
                return `<div class="jj-preferences-panel-preference-wrapper jj-slider-input">
                                                  <label for="${s.id}">${s.name}</label>
                                                  <input type="range" id="${s.id}" 
                                                      name="range" 
                                                      min="${s.min}" 
                                                      max="${s.max}"
                                                      value="${Preferences.getSettingValue(s.id)}"
                                                      step="${s.steps}"/>
                                                </div>`
            } else if (setting.type === 'checkbox') {
                const s = setting as CheckboxSetting;
                return `<div class="jj-preferences-panel-preference-wrapper jj-checkbox-input">
                                                  <input type="checkbox" id="${s.id}" ${Preferences.getSettingValue(s.id) === 'true' ? 'checked' : ''} />
                                                  <label for="${s.id}">${s.name}</label>
                                                </div>`
            } else if (setting.type === 'select') {
                const s = setting as SelectSetting;
                return `<div class="jj-preferences-panel-preference-wrapper jj-select-input">
                                                    <label for="${s.id}">${s.name}</label>
                                                    <select id="${s.id}">
                                                        ${s.options.map(option => `<option value="${option.value}" ${Preferences.getSettingValue(s.id) === option.value ? 'selected="selected"' : ''}>${option.label}</option>`).join('')}
                                                    </select>
                                                </div>`
            }
        }).join('')}
                               <div id="jj-preferences-panel-reset-button" class="bgabutton bgabutton_gray"><i class="fa6 fa6-arrows-rotate"></i>  ${_('Restore defaults')}</div>
                            </div>
                         </div>`, targetId);

        this.getSettings().forEach(setting => {
            if (setting.id) {
                // Apply initial setting
                setting.onChanged(Preferences.getSettingValue(setting.id))
                // Listen for changes
                Preferences.onInputChange(document.getElementById(setting.id), this.onSettingValueUpdated)
            }
        })

        dojo.connect($('jj-preferences-panel-toggle-button'), 'onclick', (event) => {
            const contentPanel = $('jj-preferences-panel-content');
            if (contentPanel.style.display === 'none') {
                contentPanel.style.display = 'flex';
            } else {
                contentPanel.style.display = 'none';
            }
        })

        dojo.connect($('jj-preferences-panel-reset-button'), 'onclick', (event) => {
            Preferences.getSettings().forEach(setting => {
                if (!['category', 'text'].includes(setting.type)) {
                    Preferences.setSetting(setting, setting.defaultValue)
                }
            });
            window.location.reload();
        })
    }

    private static getSettings() : SettingBase[] {
        return [
            {id: '', type: 'category', name: _('Gameplay') },
            {
                id: 'st-safe-mode',
                type: 'select',
                name: _('Safe mode'),
                options: [{value: 'enabled', label: _('Enabled (default)')}, {value: 'Disabled', label: _('Disabled')}],
                defaultValue: 'enabled',
                onChanged: (newValue) => {
                    console.log('New safe mode value: ' + newValue)
                }
            } as SelectSetting,
            {id: '', type: 'text', name: _('With Safe Mode enabled, the game will ask for confirmation when making inefficient moves or moves that result in failures.') },
            {id: '', type: 'category', name: _('UI') },
            {
                id: 'st-show-communications-banner',
                type: 'select',
                name: _('Communication banner'),
                options: [{value: 'communication-banner-visible', label: _('Always visible (default)')}, {value: 'communication-banner-auto-hide', label: _('Auto hide after 10 seconds')}, {value: 'communication-banner-hidden', label: _('Do not show')}],
                defaultValue: 'communication-banner-visible',
                onChanged: (newValue) => {
                    const HTMLelement = (document.querySelector('html') as HTMLElement);
                    HTMLelement.classList.remove('communication-banner-visible', 'communication-banner-auto-hide', 'communication-banner-hidden');
                    HTMLelement.classList.add(newValue);

                    if (newValue === 'communication-banner-auto-hide') {
                        //@ts-ignore
                        gameui.communicationInfoManager.autoHide();
                    }
                    console.log('New communication banner value: ' + newValue)
                }
            } as SelectSetting,
            {
                id: 'st-background3',
                type: 'select',
                name: _('Background'),
                options: [{value: 'st-background-clouds', label: _('Clouds')}, {value: 'st-background-sunset', label: _('Clouds Sunset')}, {value: 'st-background-turbulence', label: _('Clouds Turbulence')}, {value: 'st-background-dark', label: _('Dark (Turbulence default)')}, {value: 'st-background-blue', label: _('Blue (Base Game default)')}, {value: 'st-background-bga', label: _('Default BGA background (wood)')}],
                //@ts-ignore
                defaultValue: gameui.gamedatas.scenarioData[gameui.gamedatas.scenario.id].tags.includes('turbulence') ? 'st-background-dark' : 'st-background-blue',
                onChanged: (newValue) => {
                    const HTMLelement = (document.querySelector('html') as HTMLElement);
                    HTMLelement.classList.remove('st-background-clouds', 'st-background-blue', 'st-background-bga', 'st-background-sunset', 'st-background-turbulence', 'st-background-dark');
                    HTMLelement.classList.add(newValue);

                    console.log('New background value: ' + newValue)
                }
            } as SelectSetting,
            {
                id: 'st-show-help-buttons',
                type: 'checkbox',
                name: _('Show ? buttons'),
                defaultValue: true,
                onChanged: (newValue) => {
                    let value = newValue + '';
                    const HTMLelement = (document.querySelector('html') as HTMLElement);
                    HTMLelement.classList.remove('help-buttons-enabled', 'help-buttons-disabled');
                    if (value == 'true') {
                        HTMLelement.classList.add('help-buttons-enabled');
                    } else {
                        HTMLelement.classList.add('help-buttons-disabled');
                    }
                    console.log('New show ? buttons value: ' + newValue)
                }
            } as CheckboxSetting,
            {
                id: 'st-show-pulsing-mandatory-indicators',
                type: 'checkbox',
                name: _('Pulsing mandatory indicators'),
                defaultValue: true,
                onChanged: (newValue) => {
                    let value = newValue + '';
                    const HTMLelement = (document.querySelector('html') as HTMLElement);
                    HTMLelement.classList.remove('pulsing-mandatory-indicators-enabled', 'pulsing-mandatory-indicators-disabled');
                    if (value == 'true') {
                        HTMLelement.classList.add('pulsing-mandatory-indicators-enabled');
                    } else {
                        HTMLelement.classList.add('pulsing-mandatory-indicators-disabled');
                    }
                    console.log('New pulsing-mandatory-indicators value: ' + newValue)
                }
            } as CheckboxSetting,
        ];
    }

    private static onInputChange(r,f) {
        var n,c,m;
        r.addEventListener("input",function(e){
            n=1;
            c=e.target.type === 'checkbox'
                ? e.target.checked
                : e.target.value;
            if(c!=m) f(e);m=c;}
        );
        r.addEventListener("change",function(e){
            if(!n)f(e);
        });
    }

    private static onSettingValueUpdated(e) {
        const settingId = e.target.id;
        const setting = Preferences.getSettings().find(setting => setting.id === settingId);
        const newValue = e.target.type === 'checkbox'
            ? e.target.checked
            : e.target.value;
        Preferences.setSetting(setting, newValue);
    }

    private static setSetting(setting, newValue) {
        console.log(`Setting ${setting.id} updated: ${newValue}`)
        localStorage.setItem(setting.id, newValue);
        setting.onChanged(newValue);
    }

    public static getSettingValue(id: string) {
        const localStorageValue = localStorage.getItem(id);
        if (localStorageValue) {
            return localStorageValue;
        }
        return Preferences.getSettings().find(setting => setting.id === id).defaultValue;
    }
}