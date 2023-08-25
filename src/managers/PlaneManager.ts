class PlaneManager  {

    // TEMP
    private currentApproach = 1;
    private currentAltitude = 1;

    private static readonly PLANE_AXIS_INDICATOR = 'st-plane-axis-indicator';
    private static readonly PLANE_AERODYNAMICS_ORANGE_MARKER = 'st-plane-aerodynamics-orange-marker';
    private static readonly PLANE_AERODYNAMICS_BLUE_MARKER = 'st-plane-aerodynamics-blue-marker';
    private static readonly PLANE_BRAKE_MARKER = 'st-plane-brake-marker';
    private static readonly PLANE_ALTITUDE_TRACK = 'st-altitude-track';
    private static readonly PLANE_APPROACH_TRACK = 'st-approach-track';

    constructor(private game: SkyTeamGame) {

    }

    public setUp(data: SkyTeamGameData) {
        $(PlaneManager.PLANE_AXIS_INDICATOR).dataset.value = data.plane.axis;
        $(PlaneManager.PLANE_AERODYNAMICS_ORANGE_MARKER).dataset.value = data.plane.aerodynamicsOrange;
        $(PlaneManager.PLANE_AERODYNAMICS_BLUE_MARKER).dataset.value = data.plane.aerodynamicsBlue;
        $(PlaneManager.PLANE_BRAKE_MARKER).dataset.value = data.plane.brake;

        $(PlaneManager.PLANE_ALTITUDE_TRACK).dataset.type = data.altitude.type;
        $(PlaneManager.PLANE_APPROACH_TRACK).dataset.type = data.approach.type;

        this.setApproachAndAltitude(data.plane.approach, data.plane.altitude);

        dojo.connect($(PlaneManager.PLANE_ALTITUDE_TRACK), 'onclick', () => this.updateAltitude(this.currentAltitude + 1))
        dojo.connect($(PlaneManager.PLANE_APPROACH_TRACK), 'onclick', () => this.updateApproach(this.currentApproach + 1))
    }

    public setApproachAndAltitude(approachValue: number, altitudeValue: number) {
        const wrapper = $('st-main-board-tracks');
        const altitude = $(PlaneManager.PLANE_ALTITUDE_TRACK);
        const approach = $(PlaneManager.PLANE_APPROACH_TRACK);

        const altitudeSize = this.game.gamedatas.altitude.size;
        const approachSize = this.game.gamedatas.approach.size;

        const altitudeHeight = altitude.offsetHeight - 22 -((altitudeSize - altitudeValue) * 96);
        const approachHeight = approach.offsetHeight - 22 -((approachSize - approachValue) * 96);

        altitude.style.bottom = `-${altitudeHeight}px`;
        approach.style.bottom = `-${approachHeight}px`;

        const newWrapperHeight = Math.max(altitude.offsetHeight - altitudeHeight, approach.offsetHeight - approachHeight)
        wrapper.style.height = `${newWrapperHeight}px`;
    }

    public updateApproach(value: number) {
        this.currentApproach = value;
        this.setApproachAndAltitude(value, this.currentAltitude);
    }

    public updateAltitude(value: number) {
        this.currentAltitude = value;
        this.setApproachAndAltitude(this.currentApproach, value);
    }
}