const determineBoardWidth = (game: SkyTeamGame) => {
    // const BASE_BOARD = 607;
    // const COFFEE_RESERVE = 55 * 2;
    // const TRAFFIC_DICE = 110 * 2;
    // const WIND_PANEL = 280.5 * 2;
    //
    // if (game.gamedatas.scenario.modules.includes('special-abilities') || game.gamedatas.scenario.modules.includes('wind')) {
    //     console.log(BASE_BOARD + WIND_PANEL)
    //     return BASE_BOARD + WIND_PANEL;
    // }
    //
    // if (game.gamedatas.scenario.modules.includes('traffic')) {
    //     return BASE_BOARD + TRAFFIC_DICE;
    // }
    // return BASE_BOARD + COFFEE_RESERVE;
    return 1000;
}

const determineMaxZoomLevel = (game: SkyTeamGame) => {
    const bodycoords = dojo.marginBox("zoom-overall");
    const contentWidth = bodycoords.w;
    const rowWidth = determineBoardWidth(game);

    return contentWidth / rowWidth;
}

const getZoomLevels = (maxZoomLevel: number) => {
    let zoomLevels = [];
    let increments = 0.05;
    if (maxZoomLevel > 1) {
        const maxZoomLevelsAbove1 = maxZoomLevel - 1;
        increments = (maxZoomLevelsAbove1 / 9)
        zoomLevels = [];
        for (let i = 1; i <= 9; i++) {
            zoomLevels.push((increments * i) + 1);
        }
    }
    for (let i = 1; i <= 9; i++) {
        zoomLevels.push(1 - (increments * i));
    }
    zoomLevels = [...zoomLevels, 1, maxZoomLevel];
    zoomLevels = zoomLevels.sort();
    zoomLevels = zoomLevels.filter(zoomLevel => (zoomLevel <= maxZoomLevel) && (zoomLevel > 0.3))
    return zoomLevels;
}
class AutoZoomManager extends ZoomManager {

    constructor(game: SkyTeamGame, elementId: string, localStorageKey: string) {
        const zoomLevels = getZoomLevels(determineMaxZoomLevel(game));

        const storedZoomLevel = localStorage.getItem(localStorageKey);
        if (!zoomLevels.includes(Number(storedZoomLevel))) {
            localStorage.removeItem(localStorageKey);
        }

        let defaultZoom = 1;
        if (!zoomLevels.includes(defaultZoom)) {
            defaultZoom = zoomLevels[zoomLevels.length - 1]
        }

        super({
            element: document.getElementById(elementId),
            smooth: false,
            zoomLevels: zoomLevels,
            defaultZoom: defaultZoom,
            localStorageZoomKey: localStorageKey,
            zoomControls: {
                color: 'white',
                position: 'top-right'
            }
        });
    }
}