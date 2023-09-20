const determineBoardWidth = (game: SkyTeamGame) => {
    const BASE_BOARD = 607;
    const COFFEE_RESERVE = 55 * 2;
    const TRAFFIC_DICE = 110 * 2;

    if (game.gamedatas.scenario.modules.includes('traffic')) {
        return BASE_BOARD + TRAFFIC_DICE;
    }
    return BASE_BOARD + COFFEE_RESERVE;
}

const determineMaxZoomLevel = (game: SkyTeamGame) => {
    const bodycoords = dojo.marginBox("zoom-overall");
    const contentWidth = bodycoords.w;
    const rowWidth = determineBoardWidth(game);

    return contentWidth / rowWidth;
}

const getZoomLevels = (maxZoomLevels: number) => {
    let zoomLevels = [];
    if (maxZoomLevels > 1) {
        const maxZoomLevelsAbove1 = maxZoomLevels - 1;
        const increments = (maxZoomLevelsAbove1 / 3)
        zoomLevels = [ (increments) + 1, increments + increments + 1, increments + increments + increments + 1 ]
    }
    zoomLevels = [...zoomLevels, 1, 0.8, 0.6];
    return zoomLevels.sort();
}

class AutoZoomManager extends ZoomManager {

    constructor(game: SkyTeamGame, elementId: string, localStorageKey: string) {
        const storedZoomLevel = localStorage.getItem(localStorageKey);
        const maxZoomLevel = determineMaxZoomLevel(game);
        if (storedZoomLevel && Number(storedZoomLevel) > maxZoomLevel) {
            localStorage.removeItem(localStorageKey);
        }

        const zoomLevels = getZoomLevels(determineMaxZoomLevel(game));
        super({
            element: document.getElementById(elementId),
            smooth: true,
            zoomLevels: zoomLevels,
            defaultZoom: 1,
            localStorageZoomKey: localStorageKey,
            zoomControls: {
                color: 'black',
                position: 'top-right'
            }
        });
    }
}