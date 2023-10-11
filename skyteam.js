var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
var log = isDebug ? console.log.bind(window.console) : function () { };
define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"
], function (dojo, declare) {
    return declare("bgagame.skyteam", ebg.core.gamegui, new SkyTeam());
});
var DEFAULT_ZOOM_LEVELS = [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
var ZoomManager = /** @class */ (function () {
    /**
     * Place the settings.element in a zoom wrapper and init zoomControls.
     *
     * @param settings: a `ZoomManagerSettings` object
     */
    function ZoomManager(settings) {
        var _this = this;
        var _a, _b, _c, _d, _e;
        this.settings = settings;
        if (!settings.element) {
            throw new DOMException('You need to set the element to wrap in the zoom element');
        }
        this._zoomLevels = (_a = settings.zoomLevels) !== null && _a !== void 0 ? _a : DEFAULT_ZOOM_LEVELS;
        this._zoom = this.settings.defaultZoom || 1;
        if (this.settings.localStorageZoomKey) {
            var zoomStr = localStorage.getItem(this.settings.localStorageZoomKey);
            if (zoomStr) {
                this._zoom = Number(zoomStr);
            }
        }
        this.wrapper = document.createElement('div');
        this.wrapper.id = 'bga-zoom-wrapper';
        this.wrapElement(this.wrapper, settings.element);
        this.wrapper.appendChild(settings.element);
        settings.element.classList.add('bga-zoom-inner');
        if ((_b = settings.smooth) !== null && _b !== void 0 ? _b : true) {
            settings.element.dataset.smooth = 'true';
            settings.element.addEventListener('transitionend', function () { return _this.zoomOrDimensionChanged(); });
        }
        if ((_d = (_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.visible) !== null && _d !== void 0 ? _d : true) {
            this.initZoomControls(settings);
        }
        if (this._zoom !== 1) {
            this.setZoom(this._zoom);
        }
        window.addEventListener('resize', function () {
            var _a;
            _this.zoomOrDimensionChanged();
            if ((_a = _this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth) {
                _this.setAutoZoom();
            }
        });
        if (window.ResizeObserver) {
            new ResizeObserver(function () { return _this.zoomOrDimensionChanged(); }).observe(settings.element);
        }
        if ((_e = this.settings.autoZoom) === null || _e === void 0 ? void 0 : _e.expectedWidth) {
            this.setAutoZoom();
        }
    }
    Object.defineProperty(ZoomManager.prototype, "zoom", {
        /**
         * Returns the zoom level
         */
        get: function () {
            return this._zoom;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZoomManager.prototype, "zoomLevels", {
        /**
         * Returns the zoom levels
         */
        get: function () {
            return this._zoomLevels;
        },
        enumerable: false,
        configurable: true
    });
    ZoomManager.prototype.setAutoZoom = function () {
        var _this = this;
        var _a, _b, _c;
        var zoomWrapperWidth = document.getElementById('bga-zoom-wrapper').clientWidth;
        if (!zoomWrapperWidth) {
            setTimeout(function () { return _this.setAutoZoom(); }, 200);
            return;
        }
        var expectedWidth = (_a = this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth;
        var newZoom = this.zoom;
        while (newZoom > this._zoomLevels[0] && newZoom > ((_c = (_b = this.settings.autoZoom) === null || _b === void 0 ? void 0 : _b.minZoomLevel) !== null && _c !== void 0 ? _c : 0) && zoomWrapperWidth / newZoom < expectedWidth) {
            newZoom = this._zoomLevels[this._zoomLevels.indexOf(newZoom) - 1];
        }
        if (this._zoom == newZoom) {
            if (this.settings.localStorageZoomKey) {
                localStorage.setItem(this.settings.localStorageZoomKey, '' + this._zoom);
            }
        }
        else {
            this.setZoom(newZoom);
        }
    };
    /**
     * Sets the available zoomLevels and new zoom to the provided values.
     * @param zoomLevels the new array of zoomLevels that can be used.
     * @param newZoom if provided the zoom will be set to this value, if not the last element of the zoomLevels array will be set as the new zoom
     */
    ZoomManager.prototype.setZoomLevels = function (zoomLevels, newZoom) {
        if (!zoomLevels || zoomLevels.length <= 0) {
            return;
        }
        this._zoomLevels = zoomLevels;
        var zoomIndex = newZoom && zoomLevels.includes(newZoom) ? this._zoomLevels.indexOf(newZoom) : this._zoomLevels.length - 1;
        this.setZoom(this._zoomLevels[zoomIndex]);
    };
    /**
     * Set the zoom level. Ideally, use a zoom level in the zoomLevels range.
     * @param zoom zool level
     */
    ZoomManager.prototype.setZoom = function (zoom) {
        var _a, _b, _c, _d;
        if (zoom === void 0) { zoom = 1; }
        this._zoom = zoom;
        if (this.settings.localStorageZoomKey) {
            localStorage.setItem(this.settings.localStorageZoomKey, '' + this._zoom);
        }
        var newIndex = this._zoomLevels.indexOf(this._zoom);
        (_a = this.zoomInButton) === null || _a === void 0 ? void 0 : _a.classList.toggle('disabled', newIndex === this._zoomLevels.length - 1);
        (_b = this.zoomOutButton) === null || _b === void 0 ? void 0 : _b.classList.toggle('disabled', newIndex === 0);
        this.settings.element.style.transform = zoom === 1 ? '' : "scale(".concat(zoom, ")");
        (_d = (_c = this.settings).onZoomChange) === null || _d === void 0 ? void 0 : _d.call(_c, this._zoom);
        this.zoomOrDimensionChanged();
    };
    /**
     * Call this method for the browsers not supporting ResizeObserver, everytime the table height changes, if you know it.
     * If the browsert is recent enough (>= Safari 13.1) it will just be ignored.
     */
    ZoomManager.prototype.manualHeightUpdate = function () {
        if (!window.ResizeObserver) {
            this.zoomOrDimensionChanged();
        }
    };
    /**
     * Everytime the element dimensions changes, we update the style. And call the optional callback.
     */
    ZoomManager.prototype.zoomOrDimensionChanged = function () {
        var _a, _b;
        this.settings.element.style.width = "".concat(this.wrapper.getBoundingClientRect().width / this._zoom, "px");
        this.wrapper.style.height = "".concat(this.settings.element.getBoundingClientRect().height, "px");
        (_b = (_a = this.settings).onDimensionsChange) === null || _b === void 0 ? void 0 : _b.call(_a, this._zoom);
    };
    /**
     * Simulates a click on the Zoom-in button.
     */
    ZoomManager.prototype.zoomIn = function () {
        if (this._zoom === this._zoomLevels[this._zoomLevels.length - 1]) {
            return;
        }
        var newIndex = this._zoomLevels.indexOf(this._zoom) + 1;
        this.setZoom(newIndex === -1 ? 1 : this._zoomLevels[newIndex]);
    };
    /**
     * Simulates a click on the Zoom-out button.
     */
    ZoomManager.prototype.zoomOut = function () {
        if (this._zoom === this._zoomLevels[0]) {
            return;
        }
        var newIndex = this._zoomLevels.indexOf(this._zoom) - 1;
        this.setZoom(newIndex === -1 ? 1 : this._zoomLevels[newIndex]);
    };
    /**
     * Changes the color of the zoom controls.
     */
    ZoomManager.prototype.setZoomControlsColor = function (color) {
        if (this.zoomControls) {
            this.zoomControls.dataset.color = color;
        }
    };
    /**
     * Set-up the zoom controls
     * @param settings a `ZoomManagerSettings` object.
     */
    ZoomManager.prototype.initZoomControls = function (settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        this.zoomControls = document.createElement('div');
        this.zoomControls.id = 'bga-zoom-controls';
        this.zoomControls.dataset.position = (_b = (_a = settings.zoomControls) === null || _a === void 0 ? void 0 : _a.position) !== null && _b !== void 0 ? _b : 'top-right';
        this.zoomOutButton = document.createElement('button');
        this.zoomOutButton.type = 'button';
        this.zoomOutButton.addEventListener('click', function () { return _this.zoomOut(); });
        if ((_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.customZoomOutElement) {
            settings.zoomControls.customZoomOutElement(this.zoomOutButton);
        }
        else {
            this.zoomOutButton.classList.add("bga-zoom-out-icon");
        }
        this.zoomInButton = document.createElement('button');
        this.zoomInButton.type = 'button';
        this.zoomInButton.addEventListener('click', function () { return _this.zoomIn(); });
        if ((_d = settings.zoomControls) === null || _d === void 0 ? void 0 : _d.customZoomInElement) {
            settings.zoomControls.customZoomInElement(this.zoomInButton);
        }
        else {
            this.zoomInButton.classList.add("bga-zoom-in-icon");
        }
        this.zoomControls.appendChild(this.zoomOutButton);
        this.zoomControls.appendChild(this.zoomInButton);
        this.wrapper.appendChild(this.zoomControls);
        this.setZoomControlsColor((_f = (_e = settings.zoomControls) === null || _e === void 0 ? void 0 : _e.color) !== null && _f !== void 0 ? _f : 'black');
    };
    /**
     * Wraps an element around an existing DOM element
     * @param wrapper the wrapper element
     * @param element the existing element
     */
    ZoomManager.prototype.wrapElement = function (wrapper, element) {
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
    };
    return ZoomManager;
}());
var BgaAnimation = /** @class */ (function () {
    function BgaAnimation(animationFunction, settings) {
        this.animationFunction = animationFunction;
        this.settings = settings;
        this.played = null;
        this.result = null;
        this.playWhenNoAnimation = false;
    }
    return BgaAnimation;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * Just use playSequence from animationManager
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function attachWithAnimation(animationManager, animation) {
    var _a;
    var settings = animation.settings;
    var element = settings.animation.settings.element;
    var fromRect = element.getBoundingClientRect();
    settings.animation.settings.fromRect = fromRect;
    settings.attachElement.appendChild(element);
    (_a = settings.afterAttach) === null || _a === void 0 ? void 0 : _a.call(settings, element, settings.attachElement);
    return animationManager.play(settings.animation);
}
var BgaAttachWithAnimation = /** @class */ (function (_super) {
    __extends(BgaAttachWithAnimation, _super);
    function BgaAttachWithAnimation(settings) {
        var _this = _super.call(this, attachWithAnimation, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaAttachWithAnimation;
}(BgaAnimation));
/**
 * Just use playSequence from animationManager
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function cumulatedAnimations(animationManager, animation) {
    return animationManager.playSequence(animation.settings.animations);
}
var BgaCumulatedAnimation = /** @class */ (function (_super) {
    __extends(BgaCumulatedAnimation, _super);
    function BgaCumulatedAnimation(settings) {
        var _this = _super.call(this, cumulatedAnimations, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaCumulatedAnimation;
}(BgaAnimation));
/**
 * Just does nothing for the duration
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function pauseAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a;
        var settings = animation.settings;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        setTimeout(function () { return success(); }, duration);
    });
    return promise;
}
var BgaPauseAnimation = /** @class */ (function (_super) {
    __extends(BgaPauseAnimation, _super);
    function BgaPauseAnimation(settings) {
        return _super.call(this, pauseAnimation, settings) || this;
    }
    return BgaPauseAnimation;
}(BgaAnimation));
/**
 * Show the element at the center of the screen
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function showScreenCenterAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d;
        var settings = animation.settings;
        var element = settings.element;
        var elementBR = element.getBoundingClientRect();
        var xCenter = (elementBR.left + elementBR.right) / 2;
        var yCenter = (elementBR.top + elementBR.bottom) / 2;
        var x = xCenter - (window.innerWidth / 2);
        var y = yCenter - (window.innerHeight / 2);
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        var transitionTimingFunction = (_b = settings.transitionTimingFunction) !== null && _b !== void 0 ? _b : 'linear';
        element.style.zIndex = "".concat((_c = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _c !== void 0 ? _c : 10);
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionEnd);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms ").concat(transitionTimingFunction);
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_d = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _d !== void 0 ? _d : 0, "deg)");
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaShowScreenCenterAnimation = /** @class */ (function (_super) {
    __extends(BgaShowScreenCenterAnimation, _super);
    function BgaShowScreenCenterAnimation(settings) {
        return _super.call(this, showScreenCenterAnimation, settings) || this;
    }
    return BgaShowScreenCenterAnimation;
}(BgaAnimation));
/**
 * Slide of the element from origin to destination.
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function slideAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d, _e;
        var settings = animation.settings;
        var element = settings.element;
        var _f = getDeltaCoordinates(element, settings), x = _f.x, y = _f.y;
        var duration = (_a = settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        var transitionTimingFunction = (_b = settings.transitionTimingFunction) !== null && _b !== void 0 ? _b : 'linear';
        element.style.zIndex = "".concat((_c = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _c !== void 0 ? _c : 10);
        element.style.transition = null;
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_d = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _d !== void 0 ? _d : 0, "deg)");
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionCancel);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms ").concat(transitionTimingFunction);
        element.offsetHeight;
        element.style.transform = (_e = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _e !== void 0 ? _e : null;
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideAnimation = /** @class */ (function (_super) {
    __extends(BgaSlideAnimation, _super);
    function BgaSlideAnimation(settings) {
        return _super.call(this, slideAnimation, settings) || this;
    }
    return BgaSlideAnimation;
}(BgaAnimation));
/**
 * Slide of the element from destination to origin.
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function slideToAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d, _e;
        var settings = animation.settings;
        var element = settings.element;
        var _f = getDeltaCoordinates(element, settings), x = _f.x, y = _f.y;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        var transitionTimingFunction = (_b = settings.transitionTimingFunction) !== null && _b !== void 0 ? _b : 'linear';
        element.style.zIndex = "".concat((_c = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _c !== void 0 ? _c : 10);
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionEnd);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms ").concat(transitionTimingFunction);
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_d = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _d !== void 0 ? _d : 0, "deg) scale(").concat((_e = settings.scale) !== null && _e !== void 0 ? _e : 1, ")");
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideToAnimation = /** @class */ (function (_super) {
    __extends(BgaSlideToAnimation, _super);
    function BgaSlideToAnimation(settings) {
        return _super.call(this, slideToAnimation, settings) || this;
    }
    return BgaSlideToAnimation;
}(BgaAnimation));
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var AnimationManager = /** @class */ (function () {
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `AnimationManagerSettings` object
     */
    function AnimationManager(game, settings) {
        this.game = game;
        this.settings = settings;
        this.zoomManager = settings === null || settings === void 0 ? void 0 : settings.zoomManager;
        if (!game) {
            throw new Error('You must set your game as the first parameter of AnimationManager');
        }
    }
    AnimationManager.prototype.getZoomManager = function () {
        return this.zoomManager;
    };
    /**
     * Set the zoom manager, to get the scale of the current game.
     *
     * @param zoomManager the zoom manager
     */
    AnimationManager.prototype.setZoomManager = function (zoomManager) {
        this.zoomManager = zoomManager;
    };
    AnimationManager.prototype.getSettings = function () {
        return this.settings;
    };
    /**
     * Returns if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @returns if the animations are active.
     */
    AnimationManager.prototype.animationsActive = function () {
        return document.visibilityState !== 'hidden' && !this.game.instantaneousMode;
    };
    /**
     * Plays an animation if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @param animation the animation to play
     * @returns the animation promise.
     */
    AnimationManager.prototype.play = function (animation) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        return __awaiter(this, void 0, void 0, function () {
            var settings, _r;
            return __generator(this, function (_s) {
                switch (_s.label) {
                    case 0:
                        animation.played = animation.playWhenNoAnimation || this.animationsActive();
                        if (!animation.played) return [3 /*break*/, 2];
                        settings = animation.settings;
                        (_a = settings.animationStart) === null || _a === void 0 ? void 0 : _a.call(settings, animation);
                        (_b = settings.element) === null || _b === void 0 ? void 0 : _b.classList.add((_c = settings.animationClass) !== null && _c !== void 0 ? _c : 'bga-animations_animated');
                        animation.settings = __assign(__assign({}, animation.settings), { duration: (_g = (_e = (_d = animation.settings) === null || _d === void 0 ? void 0 : _d.duration) !== null && _e !== void 0 ? _e : (_f = this.settings) === null || _f === void 0 ? void 0 : _f.duration) !== null && _g !== void 0 ? _g : 500, scale: (_l = (_j = (_h = animation.settings) === null || _h === void 0 ? void 0 : _h.scale) !== null && _j !== void 0 ? _j : (_k = this.zoomManager) === null || _k === void 0 ? void 0 : _k.zoom) !== null && _l !== void 0 ? _l : undefined });
                        _r = animation;
                        return [4 /*yield*/, animation.animationFunction(this, animation)];
                    case 1:
                        _r.result = _s.sent();
                        (_o = (_m = animation.settings).animationEnd) === null || _o === void 0 ? void 0 : _o.call(_m, animation);
                        (_p = settings.element) === null || _p === void 0 ? void 0 : _p.classList.remove((_q = settings.animationClass) !== null && _q !== void 0 ? _q : 'bga-animations_animated');
                        return [3 /*break*/, 3];
                    case 2: return [2 /*return*/, Promise.resolve(animation)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Plays multiple animations in parallel.
     *
     * @param animations the animations to play
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playParallel = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.all(animations.map(function (animation) { return _this.play(animation); }))];
            });
        });
    };
    /**
     * Plays multiple animations in sequence (the second when the first ends, ...).
     *
     * @param animations the animations to play
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playSequence = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var result, others;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!animations.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.play(animations[0])];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, this.playSequence(animations.slice(1))];
                    case 2:
                        others = _a.sent();
                        return [2 /*return*/, __spreadArray([result], others, true)];
                    case 3: return [2 /*return*/, Promise.resolve([])];
                }
            });
        });
    };
    /**
     * Plays multiple animations with a delay between each animation start.
     *
     * @param animations the animations to play
     * @param delay the delay (in ms)
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playWithDelay = function (animations, delay) {
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            var _this = this;
            return __generator(this, function (_a) {
                promise = new Promise(function (success) {
                    var promises = [];
                    var _loop_1 = function (i) {
                        setTimeout(function () {
                            promises.push(_this.play(animations[i]));
                            if (i == animations.length - 1) {
                                Promise.all(promises).then(function (result) {
                                    success(result);
                                });
                            }
                        }, i * delay);
                    };
                    for (var i = 0; i < animations.length; i++) {
                        _loop_1(i);
                    }
                });
                return [2 /*return*/, promise];
            });
        });
    };
    /**
     * Attach an element to a parent, then play animation from element's origin to its new position.
     *
     * @param animation the animation function
     * @param attachElement the destination parent
     * @returns a promise when animation ends
     */
    AnimationManager.prototype.attachWithAnimation = function (animation, attachElement) {
        var attachWithAnimation = new BgaAttachWithAnimation({
            animation: animation,
            attachElement: attachElement
        });
        return this.play(attachWithAnimation);
    };
    return AnimationManager;
}());
function shouldAnimate(settings) {
    var _a;
    return document.visibilityState !== 'hidden' && !((_a = settings === null || settings === void 0 ? void 0 : settings.game) === null || _a === void 0 ? void 0 : _a.instantaneousMode);
}
/**
 * Return the x and y delta, based on the animation settings;
 *
 * @param settings an `AnimationSettings` object
 * @returns a promise when animation ends
 */
function getDeltaCoordinates(element, settings) {
    var _a;
    if (!settings.fromDelta && !settings.fromRect && !settings.fromElement) {
        throw new Error("[bga-animation] fromDelta, fromRect or fromElement need to be set");
    }
    var x = 0;
    var y = 0;
    if (settings.fromDelta) {
        x = settings.fromDelta.x;
        y = settings.fromDelta.y;
    }
    else {
        var originBR = (_a = settings.fromRect) !== null && _a !== void 0 ? _a : settings.fromElement.getBoundingClientRect();
        // TODO make it an option ?
        var originalTransform = element.style.transform;
        element.style.transform = '';
        var destinationBR = element.getBoundingClientRect();
        element.style.transform = originalTransform;
        x = (destinationBR.left + destinationBR.right) / 2 - (originBR.left + originBR.right) / 2;
        y = (destinationBR.top + destinationBR.bottom) / 2 - (originBR.top + originBR.bottom) / 2;
    }
    if (settings.scale) {
        x /= settings.scale;
        y /= settings.scale;
    }
    return { x: x, y: y };
}
function logAnimation(animationManager, animation) {
    var settings = animation.settings;
    var element = settings.element;
    if (element) {
        console.log(animation, settings, element, element.getBoundingClientRect(), element.style.transform);
    }
    else {
        console.log(animation, settings);
    }
    return Promise.resolve(false);
}
/**
 * The abstract stock. It shouldn't be used directly, use stocks that extends it.
 */
var CardStock = /** @class */ (function () {
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function CardStock(manager, element, settings) {
        this.manager = manager;
        this.element = element;
        this.settings = settings;
        this.cards = [];
        this.selectedCards = [];
        this.selectionMode = 'none';
        manager.addStock(this);
        element === null || element === void 0 ? void 0 : element.classList.add('card-stock' /*, this.constructor.name.split(/(?=[A-Z])/).join('-').toLowerCase()* doesn't work in production because of minification */);
        this.bindClick();
        this.sort = settings === null || settings === void 0 ? void 0 : settings.sort;
    }
    /**
     * @returns the cards on the stock
     */
    CardStock.prototype.getCards = function () {
        return this.cards.slice();
    };
    /**
     * @returns if the stock is empty
     */
    CardStock.prototype.isEmpty = function () {
        return !this.cards.length;
    };
    /**
     * @returns the selected cards
     */
    CardStock.prototype.getSelection = function () {
        return this.selectedCards.slice();
    };
    /**
     * @returns the selected cards
     */
    CardStock.prototype.isSelected = function (card) {
        var _this = this;
        return this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    /**
     * @param card a card
     * @returns if the card is present in the stock
     */
    CardStock.prototype.contains = function (card) {
        var _this = this;
        return this.cards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    /**
     * @param card a card in the stock
     * @returns the HTML element generated for the card
     */
    CardStock.prototype.getCardElement = function (card) {
        return this.manager.getCardElement(card);
    };
    /**
     * Checks if the card can be added. By default, only if it isn't already present in the stock.
     *
     * @param card the card to add
     * @param settings the addCard settings
     * @returns if the card can be added
     */
    CardStock.prototype.canAddCard = function (card, settings) {
        return !this.contains(card);
    };
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    CardStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b, _c;
        if (!this.canAddCard(card, settings)) {
            return Promise.resolve(false);
        }
        var promise;
        // we check if card is in a stock
        var originStock = this.manager.getCardStock(card);
        var index = this.getNewCardIndex(card);
        var settingsWithIndex = __assign({ index: index }, (settings !== null && settings !== void 0 ? settings : {}));
        var updateInformations = (_a = settingsWithIndex.updateInformations) !== null && _a !== void 0 ? _a : true;
        if (originStock === null || originStock === void 0 ? void 0 : originStock.contains(card)) {
            var element = this.getCardElement(card);
            promise = this.moveFromOtherStock(card, element, __assign(__assign({}, animation), { fromStock: originStock }), settingsWithIndex);
            if (!updateInformations) {
                element.dataset.side = ((_b = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _b !== void 0 ? _b : this.manager.isCardVisible(card)) ? 'front' : 'back';
            }
        }
        else if ((animation === null || animation === void 0 ? void 0 : animation.fromStock) && animation.fromStock.contains(card)) {
            var element = this.getCardElement(card);
            promise = this.moveFromOtherStock(card, element, animation, settingsWithIndex);
        }
        else {
            var element = this.manager.createCardElement(card, ((_c = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _c !== void 0 ? _c : this.manager.isCardVisible(card)));
            promise = this.moveFromElement(card, element, animation, settingsWithIndex);
        }
        if (settingsWithIndex.index !== null && settingsWithIndex.index !== undefined) {
            this.cards.splice(index, 0, card);
        }
        else {
            this.cards.push(card);
        }
        if (updateInformations) { // after splice/push
            this.manager.updateCardInformations(card);
        }
        if (!promise) {
            console.warn("CardStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if (this.selectionMode !== 'none') {
            // make selectable only at the end of the animation
            promise.then(function () { var _a; return _this.setSelectableCard(card, (_a = settingsWithIndex.selectable) !== null && _a !== void 0 ? _a : true); });
        }
        return promise;
    };
    CardStock.prototype.getNewCardIndex = function (card) {
        if (this.sort) {
            var otherCards = this.getCards();
            for (var i = 0; i < otherCards.length; i++) {
                var otherCard = otherCards[i];
                if (this.sort(card, otherCard) < 0) {
                    return i;
                }
            }
            return otherCards.length;
        }
        else {
            return undefined;
        }
    };
    CardStock.prototype.addCardElementToParent = function (cardElement, settings) {
        var _a;
        var parent = (_a = settings === null || settings === void 0 ? void 0 : settings.forceToElement) !== null && _a !== void 0 ? _a : this.element;
        if ((settings === null || settings === void 0 ? void 0 : settings.index) === null || (settings === null || settings === void 0 ? void 0 : settings.index) === undefined || !parent.children.length || (settings === null || settings === void 0 ? void 0 : settings.index) >= parent.children.length) {
            parent.appendChild(cardElement);
        }
        else {
            parent.insertBefore(cardElement, parent.children[settings.index]);
        }
    };
    CardStock.prototype.moveFromOtherStock = function (card, cardElement, animation, settings) {
        var promise;
        var element = animation.fromStock.contains(card) ? this.manager.getCardElement(card) : animation.fromStock.element;
        var fromRect = element.getBoundingClientRect();
        this.addCardElementToParent(cardElement, settings);
        this.removeSelectionClassesFromElement(cardElement);
        promise = this.animationFromElement(cardElement, fromRect, {
            originalSide: animation.originalSide,
            rotationDelta: animation.rotationDelta,
            animation: animation.animation,
        });
        // in the case the card was move inside the same stock we don't remove it
        if (animation.fromStock && animation.fromStock != this) {
            animation.fromStock.removeCard(card);
        }
        if (!promise) {
            console.warn("CardStock.moveFromOtherStock didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    CardStock.prototype.moveFromElement = function (card, cardElement, animation, settings) {
        var promise;
        this.addCardElementToParent(cardElement, settings);
        if (animation) {
            if (animation.fromStock) {
                promise = this.animationFromElement(cardElement, animation.fromStock.element.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
                animation.fromStock.removeCard(card);
            }
            else if (animation.fromElement) {
                promise = this.animationFromElement(cardElement, animation.fromElement.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
            }
        }
        else {
            promise = Promise.resolve(false);
        }
        if (!promise) {
            console.warn("CardStock.moveFromElement didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    /**
     * Add an array of cards to the stock.
     *
     * @param cards the cards to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @param shift if number, the number of milliseconds between each card. if true, chain animations
     */
    CardStock.prototype.addCards = function (cards, animation, settings, shift) {
        if (shift === void 0) { shift = false; }
        return __awaiter(this, void 0, void 0, function () {
            var promises, result, others, _loop_2, i, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.manager.animationsActive()) {
                            shift = false;
                        }
                        promises = [];
                        if (!(shift === true)) return [3 /*break*/, 4];
                        if (!cards.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.addCard(cards[0], animation, settings)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, this.addCards(cards.slice(1), animation, settings, shift)];
                    case 2:
                        others = _a.sent();
                        return [2 /*return*/, result || others];
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        if (typeof shift === 'number') {
                            _loop_2 = function (i) {
                                setTimeout(function () { return promises.push(_this.addCard(cards[i], animation, settings)); }, i * shift);
                            };
                            for (i = 0; i < cards.length; i++) {
                                _loop_2(i);
                            }
                        }
                        else {
                            promises = cards.map(function (card) { return _this.addCard(card, animation, settings); });
                        }
                        _a.label = 5;
                    case 5: return [4 /*yield*/, Promise.all(promises)];
                    case 6:
                        results = _a.sent();
                        return [2 /*return*/, results.some(function (result) { return result; })];
                }
            });
        });
    };
    /**
     * Remove a card from the stock.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeCard = function (card, settings) {
        if (this.contains(card) && this.element.contains(this.getCardElement(card))) {
            this.manager.removeCard(card, settings);
        }
        this.cardRemoved(card, settings);
    };
    /**
     * Notify the stock that a card is removed.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.cardRemoved = function (card, settings) {
        var _this = this;
        var index = this.cards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.cards.splice(index, 1);
        }
        if (this.selectedCards.find(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); })) {
            this.unselectCard(card);
        }
    };
    /**
     * Remove a set of card from the stock.
     *
     * @param cards the cards to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeCards = function (cards, settings) {
        var _this = this;
        cards.forEach(function (card) { return _this.removeCard(card, settings); });
    };
    /**
     * Remove all cards from the stock.
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeAll = function (settings) {
        var _this = this;
        var cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
        cards.forEach(function (card) { return _this.removeCard(card, settings); });
    };
    /**
     * Set if the stock is selectable, and if yes if it can be multiple.
     * If set to 'none', it will unselect all selected cards.
     *
     * @param selectionMode the selection mode
     * @param selectableCards the selectable cards (all if unset). Calls `setSelectableCards` method
     */
    CardStock.prototype.setSelectionMode = function (selectionMode, selectableCards) {
        var _this = this;
        if (selectionMode !== this.selectionMode) {
            this.unselectAll(true);
        }
        this.cards.forEach(function (card) { return _this.setSelectableCard(card, selectionMode != 'none'); });
        this.element.classList.toggle('bga-cards_selectable-stock', selectionMode != 'none');
        this.selectionMode = selectionMode;
        if (selectionMode === 'none') {
            this.getCards().forEach(function (card) { return _this.removeSelectionClasses(card); });
        }
        else {
            this.setSelectableCards(selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards());
        }
    };
    CardStock.prototype.setSelectableCard = function (card, selectable) {
        if (this.selectionMode === 'none') {
            return;
        }
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        if (selectableCardsClass) {
            element === null || element === void 0 ? void 0 : element.classList.toggle(selectableCardsClass, selectable);
        }
        if (unselectableCardsClass) {
            element === null || element === void 0 ? void 0 : element.classList.toggle(unselectableCardsClass, !selectable);
        }
        if (!selectable && this.isSelected(card)) {
            this.unselectCard(card, true);
        }
    };
    /**
     * Set the selectable class for each card.
     *
     * @param selectableCards the selectable cards. If unset, all cards are marked selectable. Default unset.
     */
    CardStock.prototype.setSelectableCards = function (selectableCards) {
        var _this = this;
        if (this.selectionMode === 'none') {
            return;
        }
        var selectableCardsIds = (selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards()).map(function (card) { return _this.manager.getId(card); });
        this.cards.forEach(function (card) {
            return _this.setSelectableCard(card, selectableCardsIds.includes(_this.manager.getId(card)));
        });
    };
    /**
     * Set selected state to a card.
     *
     * @param card the card to select
     */
    CardStock.prototype.selectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        if (!element || !element.classList.contains(selectableCardsClass)) {
            return;
        }
        if (this.selectionMode === 'single') {
            this.cards.filter(function (c) { return _this.manager.getId(c) != _this.manager.getId(card); }).forEach(function (c) { return _this.unselectCard(c, true); });
        }
        var selectedCardsClass = this.getSelectedCardClass();
        element.classList.add(selectedCardsClass);
        this.selectedCards.push(card);
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    /**
     * Set unselected state to a card.
     *
     * @param card the card to unselect
     */
    CardStock.prototype.unselectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var element = this.getCardElement(card);
        var selectedCardsClass = this.getSelectedCardClass();
        element === null || element === void 0 ? void 0 : element.classList.remove(selectedCardsClass);
        var index = this.selectedCards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.selectedCards.splice(index, 1);
        }
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    /**
     * Select all cards
     */
    CardStock.prototype.selectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        this.cards.forEach(function (c) { return _this.selectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    /**
     * Unelect all cards
     */
    CardStock.prototype.unselectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
        cards.forEach(function (c) { return _this.unselectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    CardStock.prototype.bindClick = function () {
        var _this = this;
        var _a;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function (event) {
            var cardDiv = event.target.closest('.card');
            if (!cardDiv) {
                return;
            }
            var card = _this.cards.find(function (c) { return _this.manager.getId(c) == cardDiv.id; });
            if (!card) {
                return;
            }
            _this.cardClick(card);
        });
    };
    CardStock.prototype.cardClick = function (card) {
        var _this = this;
        var _a;
        if (this.selectionMode != 'none') {
            var alreadySelected = this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
            if (alreadySelected) {
                this.unselectCard(card);
            }
            else {
                this.selectCard(card);
            }
        }
        (_a = this.onCardClick) === null || _a === void 0 ? void 0 : _a.call(this, card);
    };
    /**
     * @param element The element to animate. The element is added to the destination stock before the animation starts.
     * @param fromElement The HTMLElement to animate from.
     */
    CardStock.prototype.animationFromElement = function (element, fromRect, settings) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var side, cardSides_1, animation, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        side = element.dataset.side;
                        if (settings.originalSide && settings.originalSide != side) {
                            cardSides_1 = element.getElementsByClassName('card-sides')[0];
                            cardSides_1.style.transition = 'none';
                            element.dataset.side = settings.originalSide;
                            setTimeout(function () {
                                cardSides_1.style.transition = null;
                                element.dataset.side = side;
                            });
                        }
                        animation = settings.animation;
                        if (animation) {
                            animation.settings.element = element;
                            animation.settings.fromRect = fromRect;
                        }
                        else {
                            animation = new BgaSlideAnimation({ element: element, fromRect: fromRect });
                        }
                        return [4 /*yield*/, this.manager.animationManager.play(animation)];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, (_a = result === null || result === void 0 ? void 0 : result.played) !== null && _a !== void 0 ? _a : false];
                }
            });
        });
    };
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     */
    CardStock.prototype.setCardVisible = function (card, visible, settings) {
        this.manager.setCardVisible(card, visible, settings);
    };
    /**
     * Flips the card.
     *
     * @param card the card informations
     */
    CardStock.prototype.flipCard = function (card, settings) {
        this.manager.flipCard(card, settings);
    };
    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    CardStock.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? this.manager.getSelectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    CardStock.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? this.manager.getUnselectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    /**
     * @returns the class to apply to selected cards. Use class from manager is unset.
     */
    CardStock.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? this.manager.getSelectedCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    CardStock.prototype.removeSelectionClasses = function (card) {
        this.removeSelectionClassesFromElement(this.getCardElement(card));
    };
    CardStock.prototype.removeSelectionClassesFromElement = function (cardElement) {
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        var selectedCardsClass = this.getSelectedCardClass();
        cardElement === null || cardElement === void 0 ? void 0 : cardElement.classList.remove(selectableCardsClass, unselectableCardsClass, selectedCardsClass);
    };
    return CardStock;
}());
/**
 * A stock with manually placed cards
 */
var ManualPositionStock = /** @class */ (function (_super) {
    __extends(ManualPositionStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function ManualPositionStock(manager, element, settings, updateDisplay) {
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.updateDisplay = updateDisplay;
        element.classList.add('manual-position-stock');
        return _this;
    }
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    ManualPositionStock.prototype.addCard = function (card, animation, settings) {
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        this.updateDisplay(this.element, this.getCards(), card, this);
        return promise;
    };
    ManualPositionStock.prototype.cardRemoved = function (card) {
        _super.prototype.cardRemoved.call(this, card);
        this.updateDisplay(this.element, this.getCards(), card, this);
    };
    return ManualPositionStock;
}(CardStock));
var AllVisibleDeck = /** @class */ (function (_super) {
    __extends(AllVisibleDeck, _super);
    function AllVisibleDeck(manager, element, settings) {
        var _this = this;
        var _a;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('all-visible-deck');
        var cardWidth = _this.manager.getCardWidth();
        var cardHeight = _this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            _this.element.style.setProperty('--width', "".concat(cardWidth, "px"));
            _this.element.style.setProperty('--height', "".concat(cardHeight, "px"));
        }
        else {
            throw new Error("You need to set cardWidth and cardHeight in the card manager to use Deck.");
        }
        element.style.setProperty('--shift', (_a = settings.shift) !== null && _a !== void 0 ? _a : '3px');
        return _this;
    }
    AllVisibleDeck.prototype.addCard = function (card, animation, settings) {
        var promise;
        var order = this.cards.length;
        promise = _super.prototype.addCard.call(this, card, animation, settings);
        var cardId = this.manager.getId(card);
        var cardDiv = document.getElementById(cardId);
        cardDiv.style.setProperty('--order', '' + order);
        this.element.style.setProperty('--tile-count', '' + this.cards.length);
        return promise;
    };
    /**
     * Set opened state. If true, all cards will be entirely visible.
     *
     * @param opened indicate if deck must be always opened. If false, will open only on hover/touch
     */
    AllVisibleDeck.prototype.setOpened = function (opened) {
        this.element.classList.toggle('opened', opened);
    };
    AllVisibleDeck.prototype.cardRemoved = function (card) {
        var _this = this;
        _super.prototype.cardRemoved.call(this, card);
        this.cards.forEach(function (c, index) {
            var cardId = _this.manager.getId(c);
            var cardDiv = document.getElementById(cardId);
            cardDiv.style.setProperty('--order', '' + index);
        });
        this.element.style.setProperty('--tile-count', '' + this.cards.length);
    };
    return AllVisibleDeck;
}(CardStock));
/**
 * A stock to make cards disappear (to automatically remove discarded cards, or to represent a bag)
 */
var VoidStock = /** @class */ (function (_super) {
    __extends(VoidStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function VoidStock(manager, element) {
        var _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('void-stock');
        return _this;
    }
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardToVoidStockSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    VoidStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a;
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        // center the element
        var cardElement = this.getCardElement(card);
        var originalLeft = cardElement.style.left;
        var originalTop = cardElement.style.top;
        cardElement.style.left = "".concat((this.element.clientWidth - cardElement.clientWidth) / 2, "px");
        cardElement.style.top = "".concat((this.element.clientHeight - cardElement.clientHeight) / 2, "px");
        if (!promise) {
            console.warn("VoidStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.remove) !== null && _a !== void 0 ? _a : true) {
            return promise.then(function (result) {
                _this.removeCard(card);
                return result;
            });
        }
        else {
            cardElement.style.left = originalLeft;
            cardElement.style.top = originalTop;
            return promise;
        }
    };
    return VoidStock;
}(CardStock));
/**
 * A basic stock for a list of cards, based on flex.
 */
var LineStock = /** @class */ (function (_super) {
    __extends(LineStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `LineStockSettings` object
     */
    function LineStock(manager, element, settings) {
        var _this = this;
        var _a, _b, _c, _d;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('line-stock');
        element.dataset.center = ((_a = settings === null || settings === void 0 ? void 0 : settings.center) !== null && _a !== void 0 ? _a : true).toString();
        element.style.setProperty('--wrap', (_b = settings === null || settings === void 0 ? void 0 : settings.wrap) !== null && _b !== void 0 ? _b : 'wrap');
        element.style.setProperty('--direction', (_c = settings === null || settings === void 0 ? void 0 : settings.direction) !== null && _c !== void 0 ? _c : 'row');
        element.style.setProperty('--gap', (_d = settings === null || settings === void 0 ? void 0 : settings.gap) !== null && _d !== void 0 ? _d : '8px');
        return _this;
    }
    return LineStock;
}(CardStock));
/**
 * A stock with fixed slots (some can be empty)
 */
var SlotStock = /** @class */ (function (_super) {
    __extends(SlotStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `SlotStockSettings` object
     */
    function SlotStock(manager, element, settings) {
        var _this = this;
        var _a, _b;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.slotsIds = [];
        _this.slots = [];
        element.classList.add('slot-stock');
        _this.mapCardToSlot = settings.mapCardToSlot;
        _this.slotsIds = (_a = settings.slotsIds) !== null && _a !== void 0 ? _a : [];
        _this.slotClasses = (_b = settings.slotClasses) !== null && _b !== void 0 ? _b : [];
        _this.slotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
        return _this;
    }
    SlotStock.prototype.createSlot = function (slotId) {
        var _a;
        this.slots[slotId] = document.createElement("div");
        this.slots[slotId].dataset.slotId = slotId;
        this.element.appendChild(this.slots[slotId]);
        (_a = this.slots[slotId].classList).add.apply(_a, __spreadArray(['slot'], this.slotClasses, true));
    };
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardToSlotSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    SlotStock.prototype.addCard = function (card, animation, settings) {
        var _a, _b;
        var slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : (_b = this.mapCardToSlot) === null || _b === void 0 ? void 0 : _b.call(this, card);
        if (slotId === undefined) {
            throw new Error("Impossible to add card to slot : no SlotId. Add slotId to settings or set mapCardToSlot to SlotCard constructor.");
        }
        if (!this.slots[slotId]) {
            throw new Error("Impossible to add card to slot \"".concat(slotId, "\" : slot \"").concat(slotId, "\" doesn't exists."));
        }
        var newSettings = __assign(__assign({}, settings), { forceToElement: this.slots[slotId] });
        return _super.prototype.addCard.call(this, card, animation, newSettings);
    };
    /**
     * Change the slots ids. Will empty the stock before re-creating the slots.
     *
     * @param slotsIds the new slotsIds. Will replace the old ones.
     */
    SlotStock.prototype.setSlotsIds = function (slotsIds) {
        var _this = this;
        if (slotsIds.length == this.slotsIds.length && slotsIds.every(function (slotId, index) { return _this.slotsIds[index] === slotId; })) {
            // no change
            return;
        }
        this.removeAll();
        this.element.innerHTML = '';
        this.slotsIds = slotsIds !== null && slotsIds !== void 0 ? slotsIds : [];
        this.slotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
    };
    /**
     * Add new slots ids. Will not change nor empty the existing ones.
     *
     * @param slotsIds the new slotsIds. Will be merged with the old ones.
     */
    SlotStock.prototype.addSlotsIds = function (newSlotsIds) {
        var _a;
        var _this = this;
        if (newSlotsIds.length == 0) {
            // no change
            return;
        }
        (_a = this.slotsIds).push.apply(_a, newSlotsIds);
        newSlotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
    };
    SlotStock.prototype.canAddCard = function (card, settings) {
        var _a, _b;
        if (!this.contains(card)) {
            return true;
        }
        else {
            var currentCardSlot = this.getCardElement(card).closest('.slot').dataset.slotId;
            var slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : (_b = this.mapCardToSlot) === null || _b === void 0 ? void 0 : _b.call(this, card);
            return currentCardSlot != slotId;
        }
    };
    /**
     * Swap cards inside the slot stock.
     *
     * @param cards the cards to swap
     * @param settings for `updateInformations` and `selectable`
     */
    SlotStock.prototype.swapCards = function (cards, settings) {
        var _this = this;
        if (!this.mapCardToSlot) {
            throw new Error('You need to define SlotStock.mapCardToSlot to use SlotStock.swapCards');
        }
        var promises = [];
        var elements = cards.map(function (card) { return _this.manager.getCardElement(card); });
        var elementsRects = elements.map(function (element) { return element.getBoundingClientRect(); });
        var cssPositions = elements.map(function (element) { return element.style.position; });
        // we set to absolute so it doesn't mess with slide coordinates when 2 div are at the same place
        elements.forEach(function (element) { return element.style.position = 'absolute'; });
        cards.forEach(function (card, index) {
            var _a, _b;
            var cardElement = elements[index];
            var promise;
            var slotId = (_a = _this.mapCardToSlot) === null || _a === void 0 ? void 0 : _a.call(_this, card);
            _this.slots[slotId].appendChild(cardElement);
            cardElement.style.position = cssPositions[index];
            var cardIndex = _this.cards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
            if (cardIndex !== -1) {
                _this.cards.splice(cardIndex, 1, card);
            }
            if ((_b = settings === null || settings === void 0 ? void 0 : settings.updateInformations) !== null && _b !== void 0 ? _b : true) { // after splice/push
                _this.manager.updateCardInformations(card);
            }
            _this.removeSelectionClassesFromElement(cardElement);
            promise = _this.animationFromElement(cardElement, elementsRects[index], {});
            if (!promise) {
                console.warn("CardStock.animationFromElement didn't return a Promise");
                promise = Promise.resolve(false);
            }
            promise.then(function () { var _a; return _this.setSelectableCard(card, (_a = settings === null || settings === void 0 ? void 0 : settings.selectable) !== null && _a !== void 0 ? _a : true); });
            promises.push(promise);
        });
        return Promise.all(promises);
    };
    return SlotStock;
}(LineStock));
var SlideAndBackAnimation = /** @class */ (function (_super) {
    __extends(SlideAndBackAnimation, _super);
    function SlideAndBackAnimation(manager, element, tempElement) {
        var distance = (manager.getCardWidth() + manager.getCardHeight()) / 2;
        var angle = Math.random() * Math.PI * 2;
        var fromDelta = {
            x: distance * Math.cos(angle),
            y: distance * Math.sin(angle),
        };
        return _super.call(this, {
            animations: [
                new BgaSlideToAnimation({ element: element, fromDelta: fromDelta, duration: 250 }),
                new BgaSlideAnimation({ element: element, fromDelta: fromDelta, duration: 250, animationEnd: tempElement ? (function () { return element.remove(); }) : undefined }),
            ]
        }) || this;
    }
    return SlideAndBackAnimation;
}(BgaCumulatedAnimation));
/**
 * Abstract stock to represent a deck. (pile of cards, with a fake 3d effect of thickness). *
 * Needs cardWidth and cardHeight to be set in the card manager.
 */
var Deck = /** @class */ (function (_super) {
    __extends(Deck, _super);
    function Deck(manager, element, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('deck');
        var cardWidth = _this.manager.getCardWidth();
        var cardHeight = _this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            _this.element.style.setProperty('--width', "".concat(cardWidth, "px"));
            _this.element.style.setProperty('--height', "".concat(cardHeight, "px"));
        }
        else {
            throw new Error("You need to set cardWidth and cardHeight in the card manager to use Deck.");
        }
        _this.thicknesses = (_a = settings.thicknesses) !== null && _a !== void 0 ? _a : [0, 2, 5, 10, 20, 30];
        _this.setCardNumber((_b = settings.cardNumber) !== null && _b !== void 0 ? _b : 52);
        _this.autoUpdateCardNumber = (_c = settings.autoUpdateCardNumber) !== null && _c !== void 0 ? _c : true;
        _this.autoRemovePreviousCards = (_d = settings.autoRemovePreviousCards) !== null && _d !== void 0 ? _d : true;
        var shadowDirection = (_e = settings.shadowDirection) !== null && _e !== void 0 ? _e : 'bottom-right';
        var shadowDirectionSplit = shadowDirection.split('-');
        var xShadowShift = shadowDirectionSplit.includes('right') ? 1 : (shadowDirectionSplit.includes('left') ? -1 : 0);
        var yShadowShift = shadowDirectionSplit.includes('bottom') ? 1 : (shadowDirectionSplit.includes('top') ? -1 : 0);
        _this.element.style.setProperty('--xShadowShift', '' + xShadowShift);
        _this.element.style.setProperty('--yShadowShift', '' + yShadowShift);
        if (settings.topCard) {
            _this.addCard(settings.topCard, undefined);
        }
        else if (settings.cardNumber > 0) {
            console.warn("Deck is defined with ".concat(settings.cardNumber, " cards but no top card !"));
        }
        if (settings.counter && ((_f = settings.counter.show) !== null && _f !== void 0 ? _f : true)) {
            if (settings.cardNumber === null || settings.cardNumber === undefined) {
                throw new Error("You need to set cardNumber if you want to show the counter");
            }
            else {
                _this.createCounter((_g = settings.counter.position) !== null && _g !== void 0 ? _g : 'bottom', (_h = settings.counter.extraClasses) !== null && _h !== void 0 ? _h : 'round', settings.counter.counterId);
                if ((_j = settings.counter) === null || _j === void 0 ? void 0 : _j.hideWhenEmpty) {
                    _this.element.querySelector('.bga-cards_deck-counter').classList.add('hide-when-empty');
                }
            }
        }
        _this.setCardNumber((_k = settings.cardNumber) !== null && _k !== void 0 ? _k : 52);
        return _this;
    }
    Deck.prototype.createCounter = function (counterPosition, extraClasses, counterId) {
        var left = counterPosition.includes('right') ? 100 : (counterPosition.includes('left') ? 0 : 50);
        var top = counterPosition.includes('bottom') ? 100 : (counterPosition.includes('top') ? 0 : 50);
        this.element.style.setProperty('--bga-cards-deck-left', "".concat(left, "%"));
        this.element.style.setProperty('--bga-cards-deck-top', "".concat(top, "%"));
        this.element.insertAdjacentHTML('beforeend', "\n            <div ".concat(counterId ? "id=\"".concat(counterId, "\"") : '', " class=\"bga-cards_deck-counter ").concat(extraClasses, "\"></div>\n        "));
    };
    /**
     * Get the the cards number.
     *
     * @returns the cards number
     */
    Deck.prototype.getCardNumber = function () {
        return this.cardNumber;
    };
    /**
     * Set the the cards number.
     *
     * @param cardNumber the cards number
     */
    Deck.prototype.setCardNumber = function (cardNumber, topCard) {
        var _this = this;
        if (topCard === void 0) { topCard = null; }
        if (topCard) {
            this.addCard(topCard);
        }
        this.cardNumber = cardNumber;
        this.element.dataset.empty = (this.cardNumber == 0).toString();
        var thickness = 0;
        this.thicknesses.forEach(function (threshold, index) {
            if (_this.cardNumber >= threshold) {
                thickness = index;
            }
        });
        this.element.style.setProperty('--thickness', "".concat(thickness, "px"));
        var counterDiv = this.element.querySelector('.bga-cards_deck-counter');
        if (counterDiv) {
            counterDiv.innerHTML = "".concat(cardNumber);
        }
    };
    Deck.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber + 1);
        }
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        if ((_b = settings === null || settings === void 0 ? void 0 : settings.autoRemovePreviousCards) !== null && _b !== void 0 ? _b : this.autoRemovePreviousCards) {
            promise.then(function () {
                var previousCards = _this.getCards().slice(0, -1); // remove last cards
                _this.removeCards(previousCards, { autoUpdateCardNumber: false });
            });
        }
        return promise;
    };
    Deck.prototype.cardRemoved = function (card, settings) {
        var _a;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber - 1);
        }
        _super.prototype.cardRemoved.call(this, card, settings);
    };
    Deck.prototype.getTopCard = function () {
        var cards = this.getCards();
        return cards.length ? cards[cards.length - 1] : null;
    };
    /**
     * Shows a shuffle animation on the deck
     *
     * @param animatedCardsMax number of animated cards for shuffle animation.
     * @param fakeCardSetter a function to generate a fake card for animation. Required if the card id is not based on a numerci `id` field, or if you want to set custom card back
     * @returns promise when animation ends
     */
    Deck.prototype.shuffle = function (animatedCardsMax, fakeCardSetter) {
        if (animatedCardsMax === void 0) { animatedCardsMax = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var animatedCards, elements, i, newCard, newElement;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.manager.animationsActive()) {
                            return [2 /*return*/, Promise.resolve(false)]; // we don't execute as it's just visual temporary stuff
                        }
                        animatedCards = Math.min(10, animatedCardsMax, this.getCardNumber());
                        if (!(animatedCards > 1)) return [3 /*break*/, 2];
                        elements = [this.getCardElement(this.getTopCard())];
                        for (i = elements.length; i <= animatedCards; i++) {
                            newCard = {};
                            if (fakeCardSetter) {
                                fakeCardSetter(newCard, i);
                            }
                            else {
                                newCard.id = -100000 + i;
                            }
                            newElement = this.manager.createCardElement(newCard, false);
                            newElement.dataset.tempCardForShuffleAnimation = 'true';
                            this.element.prepend(newElement);
                            elements.push(newElement);
                        }
                        return [4 /*yield*/, this.manager.animationManager.playWithDelay(elements.map(function (element) { return new SlideAndBackAnimation(_this.manager, element, element.dataset.tempCardForShuffleAnimation == 'true'); }), 50)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2: return [2 /*return*/, Promise.resolve(false)];
                }
            });
        });
    };
    return Deck;
}(CardStock));
var CardManager = /** @class */ (function () {
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `CardManagerSettings` object
     */
    function CardManager(game, settings) {
        var _a;
        this.game = game;
        this.settings = settings;
        this.stocks = [];
        this.updateFrontTimeoutId = [];
        this.updateBackTimeoutId = [];
        this.animationManager = (_a = settings.animationManager) !== null && _a !== void 0 ? _a : new AnimationManager(game);
    }
    /**
     * Returns if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @returns if the animations are active.
     */
    CardManager.prototype.animationsActive = function () {
        return this.animationManager.animationsActive();
    };
    CardManager.prototype.addStock = function (stock) {
        this.stocks.push(stock);
    };
    /**
     * @param card the card informations
     * @return the id for a card
     */
    CardManager.prototype.getId = function (card) {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.settings).getId) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : "card-".concat(card.id);
    };
    CardManager.prototype.createCardElement = function (card, visible) {
        var _a, _b, _c, _d, _e, _f;
        if (visible === void 0) { visible = true; }
        var id = this.getId(card);
        var side = visible ? 'front' : 'back';
        if (this.getCardElement(card)) {
            throw new Error('This card already exists ' + JSON.stringify(card));
        }
        var element = document.createElement("div");
        element.id = id;
        element.dataset.side = '' + side;
        element.innerHTML = "\n            <div class=\"card-sides\">\n                <div id=\"".concat(id, "-front\" class=\"card-side front\">\n                </div>\n                <div id=\"").concat(id, "-back\" class=\"card-side back\">\n                </div>\n            </div>\n        ");
        element.classList.add('card');
        document.body.appendChild(element);
        (_b = (_a = this.settings).setupDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element);
        (_d = (_c = this.settings).setupFrontDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element.getElementsByClassName('front')[0]);
        (_f = (_e = this.settings).setupBackDiv) === null || _f === void 0 ? void 0 : _f.call(_e, card, element.getElementsByClassName('back')[0]);
        document.body.removeChild(element);
        return element;
    };
    /**
     * @param card the card informations
     * @return the HTML element of an existing card
     */
    CardManager.prototype.getCardElement = function (card) {
        return document.getElementById(this.getId(card));
    };
    /**
     * Remove a card.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardManager.prototype.removeCard = function (card, settings) {
        var _a;
        var id = this.getId(card);
        var div = document.getElementById(id);
        if (!div) {
            return false;
        }
        div.id = "deleted".concat(id);
        div.remove();
        // if the card is in a stock, notify the stock about removal
        (_a = this.getCardStock(card)) === null || _a === void 0 ? void 0 : _a.cardRemoved(card, settings);
        return true;
    };
    /**
     * Returns the stock containing the card.
     *
     * @param card the card informations
     * @return the stock containing the card
     */
    CardManager.prototype.getCardStock = function (card) {
        return this.stocks.find(function (stock) { return stock.contains(card); });
    };
    /**
     * Return if the card passed as parameter is suppose to be visible or not.
     * Use `isCardVisible` from settings if set, else will check if `card.type` is defined
     *
     * @param card the card informations
     * @return the visiblility of the card (true means front side should be displayed)
     */
    CardManager.prototype.isCardVisible = function (card) {
        var _a, _b, _c, _d;
        return (_c = (_b = (_a = this.settings).isCardVisible) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : ((_d = card.type) !== null && _d !== void 0 ? _d : false);
    };
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     * @param visible if the card is set to visible face. If unset, will use isCardVisible(card)
     * @param settings the flip params (to update the card in current stock)
     */
    CardManager.prototype.setCardVisible = function (card, visible, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var element = this.getCardElement(card);
        if (!element) {
            return;
        }
        var isVisible = visible !== null && visible !== void 0 ? visible : this.isCardVisible(card);
        element.dataset.side = isVisible ? 'front' : 'back';
        var stringId = JSON.stringify(this.getId(card));
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.updateFront) !== null && _a !== void 0 ? _a : true) {
            if (this.updateFrontTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateFrontTimeoutId[stringId]);
                delete this.updateFrontTimeoutId[stringId];
            }
            var updateFrontDelay = (_b = settings === null || settings === void 0 ? void 0 : settings.updateFrontDelay) !== null && _b !== void 0 ? _b : 500;
            if (!isVisible && updateFrontDelay > 0 && this.animationsActive()) {
                this.updateFrontTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupFrontDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('front')[0]); }, updateFrontDelay);
            }
            else {
                (_d = (_c = this.settings).setupFrontDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element.getElementsByClassName('front')[0]);
            }
        }
        if ((_e = settings === null || settings === void 0 ? void 0 : settings.updateBack) !== null && _e !== void 0 ? _e : false) {
            if (this.updateBackTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateBackTimeoutId[stringId]);
                delete this.updateBackTimeoutId[stringId];
            }
            var updateBackDelay = (_f = settings === null || settings === void 0 ? void 0 : settings.updateBackDelay) !== null && _f !== void 0 ? _f : 0;
            if (isVisible && updateBackDelay > 0 && this.animationsActive()) {
                this.updateBackTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupBackDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('back')[0]); }, updateBackDelay);
            }
            else {
                (_h = (_g = this.settings).setupBackDiv) === null || _h === void 0 ? void 0 : _h.call(_g, card, element.getElementsByClassName('back')[0]);
            }
        }
        if ((_j = settings === null || settings === void 0 ? void 0 : settings.updateData) !== null && _j !== void 0 ? _j : true) {
            // card data has changed
            var stock = this.getCardStock(card);
            var cards = stock.getCards();
            var cardIndex = cards.findIndex(function (c) { return _this.getId(c) === _this.getId(card); });
            if (cardIndex !== -1) {
                stock.cards.splice(cardIndex, 1, card);
            }
        }
    };
    /**
     * Flips the card.
     *
     * @param card the card informations
     * @param settings the flip params (to update the card in current stock)
     */
    CardManager.prototype.flipCard = function (card, settings) {
        var element = this.getCardElement(card);
        var currentlyVisible = element.dataset.side === 'front';
        this.setCardVisible(card, !currentlyVisible, settings);
    };
    /**
     * Update the card informations. Used when a card with just an id (back shown) should be revealed, with all data needed to populate the front.
     *
     * @param card the card informations
     */
    CardManager.prototype.updateCardInformations = function (card, settings) {
        var newSettings = __assign(__assign({}, (settings !== null && settings !== void 0 ? settings : {})), { updateData: true });
        this.setCardVisible(card, undefined, newSettings);
    };
    /**
     * @returns the card with set in the settings (undefined if unset)
     */
    CardManager.prototype.getCardWidth = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardWidth;
    };
    /**
     * @returns the card height set in the settings (undefined if unset)
     */
    CardManager.prototype.getCardHeight = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardHeight;
    };
    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_selectable-card'.
     */
    CardManager.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? 'bga-cards_selectable-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_disabled-card'.
     */
    CardManager.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? 'bga-cards_disabled-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    /**
     * @returns the class to apply to selected cards. Default 'bga-cards_selected-card'.
     */
    CardManager.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? 'bga-cards_selected-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    return CardManager;
}());
function sortFunction() {
    var sortedFields = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sortedFields[_i] = arguments[_i];
    }
    return function (a, b) {
        for (var i = 0; i < sortedFields.length; i++) {
            var direction = 1;
            var field = sortedFields[i];
            if (field[0] == '-') {
                direction = -1;
                field = field.substring(1);
            }
            else if (field[0] == '+') {
                field = field.substring(1);
            }
            var type = typeof a[field];
            if (type === 'string') {
                var compare = a[field].localeCompare(b[field]);
                if (compare !== 0) {
                    return compare;
                }
            }
            else if (type === 'number') {
                var compare = (a[field] - b[field]) * direction;
                if (compare !== 0) {
                    return compare * direction;
                }
            }
        }
        return 0;
    };
}
var determineBoardWidth = function (game) {
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
};
var determineMaxZoomLevel = function (game) {
    var bodycoords = dojo.marginBox("zoom-overall");
    var contentWidth = bodycoords.w;
    var rowWidth = determineBoardWidth(game);
    return contentWidth / rowWidth;
};
var getZoomLevels = function (maxZoomLevels) {
    var zoomLevels = [];
    if (maxZoomLevels > 1) {
        var maxZoomLevelsAbove1 = maxZoomLevels - 1;
        var increments = (maxZoomLevelsAbove1 / 3);
        zoomLevels = [(increments) + 1, increments + increments + 1, increments + increments + increments + 1];
    }
    zoomLevels = __spreadArray(__spreadArray([], zoomLevels, true), [1, 0.8, 0.6], false);
    return zoomLevels.sort();
};
var AutoZoomManager = /** @class */ (function (_super) {
    __extends(AutoZoomManager, _super);
    function AutoZoomManager(game, elementId, localStorageKey) {
        var storedZoomLevel = localStorage.getItem(localStorageKey);
        var maxZoomLevel = determineMaxZoomLevel(game);
        if (storedZoomLevel && Number(storedZoomLevel) > maxZoomLevel) {
            localStorage.removeItem(localStorageKey);
        }
        var zoomLevels = getZoomLevels(determineMaxZoomLevel(game));
        return _super.call(this, {
            element: document.getElementById(elementId),
            smooth: true,
            zoomLevels: zoomLevels,
            defaultZoom: 1,
            localStorageZoomKey: localStorageKey,
            zoomControls: {
                color: 'black',
                position: 'top-right'
            }
        }) || this;
    }
    return AutoZoomManager;
}(ZoomManager));
var PlayerRoleManager = /** @class */ (function () {
    function PlayerRoleManager(game) {
        this.game = game;
    }
    PlayerRoleManager.prototype.setUp = function (data) {
        var _this = this;
        Object.keys(data.players).forEach(function (playerId) {
            dojo.place("<div id=\"st-role-card-wrapper-".concat(playerId, "\" class=\"st-role-card-wrapper\"></div>"), "player_board_".concat(playerId));
            var player = data.players[playerId];
            if (player.role) {
                dojo.place(_this.createRoleCard(player.role), "st-role-card-wrapper-".concat(playerId));
            }
        });
    };
    PlayerRoleManager.prototype.createRoleCard = function (role) {
        return "<div id=\"st-role-card-".concat(role, "\" class=\"st-role-card\" data-type=\"").concat(role, "\"><p>").concat(_(role), "</p></div>");
    };
    PlayerRoleManager.prototype.setRole = function (playerId, role, roleColor) {
        this.game.gamedatas.players[playerId].color = roleColor;
        this.game.gamedatas.players[playerId].role = role;
        var element = document.querySelector("#player_name_".concat(playerId, " a"));
        element.style.color = "#".concat(roleColor);
        dojo.place(this.createRoleCard(role), "st-role-card-".concat(role), 'replace');
        return this.game.animationManager.play(new BgaAttachWithAnimation({
            animation: new BgaSlideAnimation({ element: $("st-role-card-".concat(role)), transitionTimingFunction: 'ease-out' }),
            attachElement: document.getElementById("st-role-card-wrapper-".concat(playerId))
        }));
    };
    return PlayerRoleManager;
}());
var PlaneManager = /** @class */ (function () {
    function PlaneManager(game) {
        this.game = game;
        this.currentApproach = 1;
        this.currentAltitude = 1;
        this.currentAxis = 1;
    }
    PlaneManager.prototype.setUp = function (data) {
        $(PlaneManager.PLANE_AXIS_INDICATOR).dataset.value = data.plane.axis;
        $(PlaneManager.PLANE_AERODYNAMICS_ORANGE_MARKER).dataset.value = data.plane.aerodynamicsOrange;
        $(PlaneManager.PLANE_AERODYNAMICS_BLUE_MARKER).dataset.value = data.plane.aerodynamicsBlue;
        $(PlaneManager.PLANE_BRAKE_MARKER).dataset.value = data.plane.brake;
        $(PlaneManager.KEROSENE_MARKER).dataset.value = data.plane.kerosene;
        $(PlaneManager.WINDS_PLANE).dataset.value = data.plane.wind;
        $(PlaneManager.PLANE_ALTITUDE_TRACK).dataset.type = data.altitude.type;
        $(PlaneManager.PLANE_APPROACH_TRACK).dataset.type = data.approach.type;
        this.currentApproach = data.plane.approach;
        this.currentAltitude = data.plane.altitude;
        this.currentAxis = data.plane.axis;
        Object.values(data.plane.switches).forEach(function (planeSwitch) {
            dojo.place("<div id=\"plane-switch-".concat(planeSwitch.id, "\" class=\"st-plane-switch-wrapper\" data-value=\"").concat(planeSwitch.value, "\"><div class=\"st-plane-switch token\"></div></div>"), $('st-plane-switches'));
        });
        var approachTokenStockSlots = Object.keys(data.approach.spaces).map(function (slotId) { return "st-approach-track-slot-".concat(slotId); }).reverse();
        this.approachTokenStock = new SlotStock(this.game.tokenManager, $('st-approach-track'), {
            slotsIds: approachTokenStockSlots,
            mapCardToSlot: function (card) { return "st-approach-track-slot-".concat(card.locationArg); },
            gap: '1px',
            direction: 'column',
            center: false,
        });
        this.approachTokenStock.addCards(Object.values(data.planeTokens).filter(function (card) { return card.location === 'approach'; }));
        var altitudeTokenStockSlots = Object.keys(data.altitude.spaces).map(function (slotId) { return "st-altitude-track-slot-".concat(slotId); }).reverse();
        this.altitudeTokenStock = new SlotStock(this.game.tokenManager, $('st-altitude-track'), {
            slotsIds: altitudeTokenStockSlots,
            mapCardToSlot: function (card) { return "st-altitude-track-slot-".concat(card.locationArg); },
            gap: '1px',
            direction: 'column',
            center: false
        });
        this.altitudeTokenStock.addCards(Object.values(data.rerollTokens).filter(function (card) { return card.location === 'altitude'; }));
        this.setApproachAndAltitude(data.plane.approach, data.plane.altitude, true);
        this.coffeeTokenStock = new SlotStock(this.game.tokenManager, $('st-available-coffee'), {
            slotsIds: ['st-available-coffee-1', 'st-available-coffee-2', 'st-available-coffee-3'],
            mapCardToSlot: function (card) { return "st-available-coffee-".concat(card.locationArg); },
            gap: '1px',
            direction: 'column',
            center: false
        });
        this.coffeeTokenStock.addCards(Object.values(data.coffeeTokens).filter(function (card) { return card.location === 'available'; }));
        this.rerollTokenStock = new AllVisibleDeck(this.game.tokenManager, $('st-available-reroll'), {});
        this.rerollTokenStock.addCards(Object.values(data.rerollTokens).filter(function (card) { return card.location === 'available'; }));
        this.specialAbilityCardStock = new LineStock(this.game.specialAbilityCardManager, $('st-main-board-special-abilities'), { direction: 'column' });
        this.specialAbilityCardStock.addCards(data.chosenSpecialAbilities);
        this.game.specialAbilityCardManager.updateRolesThatUsedCard(data.chosenSpecialAbilities.find(function (card) { return card.type === 2; }), data.rolesThatUsedAdaptation);
        if (!data.scenario.modules.includes('kerosene')) {
            $('st-kerosene-board').style.visibility = 'hidden';
        }
        if (!data.scenario.modules.includes('winds')) {
            $('st-winds-board').style.display = 'none';
        }
    };
    PlaneManager.prototype.setApproachAndAltitude = function (approachValue, altitudeValue, forceInstant) {
        if (forceInstant === void 0) { forceInstant = false; }
        var wrapper = $('st-main-board-tracks');
        var altitude = $(PlaneManager.PLANE_ALTITUDE_TRACK);
        var approach = $(PlaneManager.PLANE_APPROACH_TRACK);
        var altitudeSize = this.game.gamedatas.altitude.size;
        var approachSize = this.game.gamedatas.approach.size;
        var altitudeHeight = altitude.offsetHeight - 22 - ((altitudeSize - altitudeValue) * 96);
        var approachHeight = approach.offsetHeight - 22 - ((approachSize - approachValue) * 96);
        altitude.style.bottom = "-".concat(altitudeHeight, "px");
        approach.style.bottom = "-".concat(approachHeight, "px");
        var newWrapperHeight = Math.max(altitude.offsetHeight - altitudeHeight, approach.offsetHeight - approachHeight);
        return this.game.delay(ANIMATION_MS).then(function () {
            wrapper.style.height = "".concat(newWrapperHeight, "px");
        });
    };
    PlaneManager.prototype.updateApproach = function (value) {
        this.currentApproach = value;
        return this.setApproachAndAltitude(value, this.currentAltitude);
    };
    PlaneManager.prototype.updateAltitude = function (value) {
        this.currentAltitude = value;
        return this.setApproachAndAltitude(this.currentApproach, value);
    };
    PlaneManager.prototype.updateAxis = function (axis) {
        this.currentAxis = axis;
        $(PlaneManager.PLANE_AXIS_INDICATOR).dataset.value = axis;
        return this.game.delay(ANIMATION_MS);
    };
    PlaneManager.prototype.updateSwitch = function (planeSwitch) {
        $("plane-switch-".concat(planeSwitch.id)).dataset.value = planeSwitch.value;
        return this.game.delay(ANIMATION_MS);
    };
    PlaneManager.prototype.updateAerodynamicsBlue = function (aerodynamicsBlue) {
        $(PlaneManager.PLANE_AERODYNAMICS_BLUE_MARKER).dataset.value = aerodynamicsBlue;
        return this.game.delay(ANIMATION_MS);
    };
    PlaneManager.prototype.updateAerodynamicsOrange = function (aerodynamicsOrange) {
        $(PlaneManager.PLANE_AERODYNAMICS_ORANGE_MARKER).dataset.value = aerodynamicsOrange;
        return this.game.delay(ANIMATION_MS);
    };
    PlaneManager.prototype.updateBrake = function (brake) {
        $(PlaneManager.PLANE_BRAKE_MARKER).dataset.value = brake;
        return this.game.delay(ANIMATION_MS);
    };
    PlaneManager.prototype.updateKerosene = function (kerosene) {
        $(PlaneManager.KEROSENE_MARKER).dataset.value = kerosene;
        return this.game.delay(ANIMATION_MS);
    };
    PlaneManager.prototype.updateWind = function (wind) {
        $(PlaneManager.WINDS_PLANE).dataset.value = wind;
        return this.game.delay(ANIMATION_MS);
    };
    PlaneManager.prototype.highlightApproachSlot = function (offset) {
        var slotElement = $('st-approach-overlay-track-slot');
        var remainingOffset = this.game.gamedatas.approach.size - this.currentApproach + 1;
        if (offset <= remainingOffset) {
            if (slotElement) {
                slotElement.classList.add('st-approach-overlay-track-slot-highlighted');
                slotElement.style.bottom = (95 * (offset - 1)) + 'px';
            }
        }
    };
    PlaneManager.prototype.hightlightAxis = function (value) {
        dojo.place("<div id=\"st-plane-axis-indicator-highlight\" class=\"st-plane-axis-indicator\" data-value=\"".concat(value, "\"></div>"), $('st-main-board'));
    };
    PlaneManager.prototype.unhighlightPlane = function () {
        var _a;
        document.getElementById('st-approach-overlay-track-slot').classList.remove('st-approach-overlay-track-slot-highlighted');
        (_a = document.getElementById('st-plane-axis-indicator-highlight')) === null || _a === void 0 ? void 0 : _a.remove();
    };
    PlaneManager.PLANE_AXIS_INDICATOR = 'st-plane-axis-indicator';
    PlaneManager.PLANE_AERODYNAMICS_ORANGE_MARKER = 'st-plane-aerodynamics-orange-marker';
    PlaneManager.PLANE_AERODYNAMICS_BLUE_MARKER = 'st-plane-aerodynamics-blue-marker';
    PlaneManager.PLANE_BRAKE_MARKER = 'st-plane-brake-marker';
    PlaneManager.KEROSENE_MARKER = 'st-kerosene-marker';
    PlaneManager.WINDS_PLANE = 'st-winds-plane';
    PlaneManager.PLANE_ALTITUDE_TRACK = 'st-altitude-track';
    PlaneManager.PLANE_APPROACH_TRACK = 'st-approach-track';
    return PlaneManager;
}());
var ReserveManager = /** @class */ (function () {
    function ReserveManager(game) {
        this.game = game;
    }
    ReserveManager.prototype.setUp = function (data) {
        this.reserveCoffeeStock = new LineStock(this.game.tokenManager, $(ReserveManager.TOKEN_RESERVE_COFFEE), { center: true, direction: 'column' });
        this.reserveRerollStock = new VoidStock(this.game.tokenManager, $(ReserveManager.TOKEN_RESERVE_REROLL));
        this.reservePlaneStock = new VoidStock(this.game.tokenManager, $(ReserveManager.TOKEN_RESERVE_PLANE));
        this.reserveCoffeeStock.addCards(Object.values(data.coffeeTokens).filter(function (card) { return card.location === 'reserve'; }));
        this.reserveRerollStock.addCards(Object.values(data.rerollTokens).filter(function (card) { return card.location === 'reserve'; }));
        this.reservePlaneStock.addCards(Object.values(data.planeTokens).filter(function (card) { return card.location === 'reserve'; }));
    };
    ReserveManager.TOKEN_RESERVE_COFFEE = 'st-token-reserve-coffee';
    ReserveManager.TOKEN_RESERVE_PLANE = 'st-token-reserve-plane';
    ReserveManager.TOKEN_RESERVE_REROLL = 'st-token-reserve-reroll';
    return ReserveManager;
}());
var CommunicationInfoManager = /** @class */ (function () {
    function CommunicationInfoManager(game) {
        this.game = game;
        this.currentCommunicationLevel = '';
        this.dialog = null;
        this.dialogId = 'st-communication-info-dialog';
        this.closeButtonId = 'st-communication-info-dialog-close-button';
    }
    CommunicationInfoManager.prototype.setUp = function (data) {
        var _this = this;
        this.update(data.phase);
        dojo.connect($(CommunicationInfoManager.ELEMENT_ID), 'onclick', function (event) { return _this.showMoreInfoDialog(event); });
    };
    CommunicationInfoManager.prototype.setCommunicationLimited = function () {
        this.currentCommunicationLevel = 'limited';
        var element = $(CommunicationInfoManager.ELEMENT_ID);
        dojo.empty(element);
        dojo.removeClass(element, 'red');
        dojo.addClass(element, 'green');
        dojo.place("<h2><i class=\"fa fa-microphone\" aria-hidden=\"true\"></i> ".concat(_('Limited communication only'), " <i class=\"fa fa-microphone\" aria-hidden=\"true\"></i><br/>").concat(_('You are not allowed to discuss the dice.'), "<br/></h2><i id=\"st-communication-info-dialog-close-button\" class=\"fa fa-times\" aria-hidden=\"true\"></i>"), element);
    };
    CommunicationInfoManager.prototype.setCommunicationNotAllowed = function () {
        this.currentCommunicationLevel = 'not-allowed';
        var element = $(CommunicationInfoManager.ELEMENT_ID);
        dojo.empty(element);
        dojo.removeClass(element, 'green');
        dojo.addClass(element, 'red');
        dojo.place("<h2><i class=\"fa fa-ban\" aria-hidden=\"true\"></i> ".concat(_('No communication'), " <i class=\"fa fa-ban\" aria-hidden=\"true\"></i><br/>").concat(_('Non-game communication is allowed.'), "</h2><i id=\"st-communication-info-dialog-close-button\" class=\"fa fa-times\" aria-hidden=\"true\"></i>"), element);
    };
    CommunicationInfoManager.prototype.update = function (newPhase) {
        var _this = this;
        if (this.game.prefs[101].value == 1 || this.game.prefs[101].value == 2) {
            if (newPhase === 'strategy' || newPhase === 'diceplacement') {
                if (newPhase == 'strategy') {
                    this.setCommunicationLimited();
                }
                else if (newPhase == 'diceplacement') {
                    this.setCommunicationNotAllowed();
                }
                dojo.connect($('st-communication-info-dialog-close-button'), 'onclick', function (event) {
                    dojo.stopEvent(event);
                    _this.hideBanner();
                });
            }
            if (this.game.prefs[101].value == 2) {
                this.game.delay(10000).then(function () { return _this.hideBanner(); });
            }
        }
    };
    CommunicationInfoManager.prototype.hideBanner = function () {
        var element = $(CommunicationInfoManager.ELEMENT_ID);
        dojo.empty(element);
    };
    CommunicationInfoManager.prototype.showMoreInfoDialog = function (event) {
        dojo.stopEvent(event);
        this.dialog = new ebg.popindialog();
        this.dialog.create(this.dialogId);
        this.dialog.setTitle("<i class=\"fa fa-info-circle\" aria-hidden=\"true\"></i> ".concat(this.getDialogTitle()));
        this.dialog.setContent(this.getDialogHtml());
        this.dialog.show();
    };
    CommunicationInfoManager.prototype.getDialogTitle = function () {
        switch (this.currentCommunicationLevel) {
            case 'not-allowed':
                return _('No communication. Non-game communication is allowed.');
            case 'limited':
                return _('Limited communication only. You are not allowed to discuss the dice.');
        }
    };
    CommunicationInfoManager.prototype.getDialogHtml = function () {
        switch (this.currentCommunicationLevel) {
            case 'not-allowed':
                return "<div class=\"st-communication-info-examples\">\n                            <p>".concat(_('In Sky Team, there are 2 ways to communicate: Verbally, during the strategy phase; and by placing your die during the Dice Placement phase.'), " ").concat(_('Currently we are in the Dice Placement phase.'), "</p>\n                            <div>\n                                <div><b>").concat(_('For example:'), "</b></div>\n                                <div><i class=\"fa fa-check\" aria-hidden=\"true\"></i> \u201C").concat(_('Are you still there?'), "\u201C</div>\n                                <div><i class=\"fa fa-check\" aria-hidden=\"true\"></i> \u201C").concat(_('I need to step away for a minute, be right back'), "\u201C</div>\n                                <div><i class=\"fa fa-times\" aria-hidden=\"true\"></i> \u201C").concat(_('I have a 6 and I can use it here'), "\u201C</div>\n                                <div><i class=\"fa fa-times\" aria-hidden=\"true\"></i> \u201C").concat(_('What dice do you have?'), "\u201C</div>\n                                <div><i class=\"fa fa-times\" aria-hidden=\"true\"></i> \u201C").concat(_('Remember the brakes!'), "\u201C</div>\n                            </div>\n                        </div>");
            case 'limited':
                return "<div class=\"st-communication-info-examples\">\n                            <p>".concat(_('In Sky Team, there are 2 ways to communicate: Verbally, during the strategy phase; and by placing your die during the Dice Placement phase.'), " ").concat(_('Currently we are in the Strategy phase.'), "</p>\n                            <div>\n                                <div><b>").concat(_('For example:'), "</b></div>\n                                <div><i class=\"fa fa-check\" aria-hidden=\"true\"></i> \u201C").concat(_('We really need to get rid of that plane token'), "\u201C</div>\n                                <div><i class=\"fa fa-check\" aria-hidden=\"true\"></i> \u201C").concat(_('Let’s make sure we advance 2 spaces.'), "\u201C</div>\n                                <div><i class=\"fa fa-times\" aria-hidden=\"true\"></i> \u201C").concat(_('If you get a 6, put it here'), "\u201C</div>\n                                <div><i class=\"fa fa-times\" aria-hidden=\"true\"></i> \u201C").concat(_('Use your weakest die to do this action'), "\u201C</div>\n                            </div>\n                        </div>");
        }
    };
    CommunicationInfoManager.ELEMENT_ID = 'st-communication-info';
    return CommunicationInfoManager;
}());
var ActionSpaceManager = /** @class */ (function () {
    function ActionSpaceManager(game) {
        this.game = game;
        this.selectedActionSpaceId = null;
        this.actionSpaces = {};
    }
    ActionSpaceManager.prototype.setUp = function (data) {
        var _this = this;
        Object.entries(data.actionSpaces).forEach(function (_a) {
            var id = _a[0], space = _a[1];
            var warningPlacement = 'bottom';
            if (id === 'engines-1') {
                warningPlacement = 'left';
            }
            else if (id === 'engines-2') {
                warningPlacement = 'right';
            }
            var helpPlacement = 'top';
            if (space.type === 'landing-gear' || id === 'axis-1' || id === 'radio-1') {
                helpPlacement = 'left';
            }
            else if (space.type === 'flaps' || space.type === 'concentration' || id === 'axis-2' || id === 'radio-2' || id === 'radio-3') {
                helpPlacement = 'right';
            }
            dojo.place("<div id=\"".concat(id, "\" class=\"st-action-space\">\n                                ").concat(space.mandatory ? "<span class=\"st-action-space-mandatory-warning ".concat(warningPlacement, "\"><i class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>") : '', "\n                                <span id=\"").concat(id, "-help\" class=\"st-action-space-help ").concat(helpPlacement, "\"><i class=\"fa fa-question-circle\" aria-hidden=\"true\"></i></span>\n                             </div>"), $('st-action-spaces'));
            _this.actionSpaces[id] = new LineStock(_this.game.diceManager, $(id), {});
            dojo.connect($(id), 'onclick', function (event) { return _this.actionSpaceClicked(id, event); });
            dojo.connect($("".concat(id, "-help")), 'onclick', function (event) { return _this.game.helpDialogManager.showActionSpaceHelp(event, space); });
        });
        data.planeDice.forEach(function (die) { return _this.moveDieToActionSpace(die); });
    };
    ActionSpaceManager.prototype.setActionSpacesSelectable = function (ids, onSelectedActionSpaceChanged, dieValue) {
        var _a;
        (_a = document.querySelector('.st-dice-placeholder')) === null || _a === void 0 ? void 0 : _a.remove();
        this.game.planeManager.unhighlightPlane();
        this.onSelectedActionSpaceChanged = onSelectedActionSpaceChanged;
        this.setAllActionSpacesUnselectable();
        Object.entries(ids).filter(function (_a) {
            var _b;
            var id = _a[0], space = _a[1];
            return !dieValue || (!space.allowedValues || ((_b = space.allowedValues) === null || _b === void 0 ? void 0 : _b.includes(dieValue)));
        }).forEach(function (_a) {
            var id = _a[0], space = _a[1];
            var element = $(id);
            if (!element.classList.contains('selected')) {
                element.classList.add('selectable');
            }
        });
    };
    ActionSpaceManager.prototype.setAllActionSpacesUnselectable = function () {
        this.selectedActionSpaceId = null;
        Object.keys(this.actionSpaces).forEach(function (id) {
            var element = $(id);
            element.classList.remove('selected');
            element.classList.remove('selectable');
        });
    };
    ActionSpaceManager.prototype.moveDieToActionSpace = function (die) {
        return this.actionSpaces[die.locationArg].addCard(die).then(function () { return $(die.locationArg).classList.add('st-action-space-occupied'); });
    };
    ActionSpaceManager.prototype.resetActionSpaceOccupied = function () {
        document.querySelectorAll('.st-action-space-occupied').forEach(function (node) { return node.classList.remove('st-action-space-occupied'); });
    };
    ActionSpaceManager.prototype.removeDice = function (dice) {
        var _this = this;
        dice.forEach(function (die) { return Object.values(_this.actionSpaces).forEach(function (stock) {
            if (stock.contains(die)) {
                stock.removeCard(die);
            }
        }); });
    };
    ActionSpaceManager.prototype.getDieInLocation = function (space) {
        var dice = this.actionSpaces[space].getCards();
        if (dice && dice.length === 1) {
            return dice[0];
        }
        return null;
    };
    ActionSpaceManager.prototype.actionSpaceClicked = function (id, event) {
        dojo.stopEvent(event);
        var target = $(id);
        if (target.classList.contains('selected')) {
            target.classList.add('selectable');
            target.classList.remove('selected');
            this.selectedActionSpaceId = null;
            this.onSelectedActionSpaceChanged(null);
        }
        else if (target.classList.contains('selectable')) {
            target.classList.add('selected');
            target.classList.remove('selectable');
            if (this.selectedActionSpaceId) {
                $(this.selectedActionSpaceId).classList.remove('selected');
                $(this.selectedActionSpaceId).classList.add('selectable');
            }
            this.selectedActionSpaceId = target.id;
            this.onSelectedActionSpaceChanged(target.id);
        }
        console.log('Selected: ' + this.selectedActionSpaceId);
    };
    return ActionSpaceManager;
}());
var DiceManager = /** @class */ (function (_super) {
    __extends(DiceManager, _super);
    function DiceManager(game) {
        var _this = _super.call(this, game, {
            getId: function (die) { return "st-dice-".concat(die.id); },
            setupDiv: function (die, div) {
                div.classList.add('st-dice');
                div.dataset['type'] = die.typeArg;
                div.dataset['value'] = String(die.side);
                [1, 2, 3, 4, 5, 6].forEach(function (side) {
                    var sideDiv = document.createElement('div');
                    sideDiv.classList.add('side');
                    sideDiv.dataset['side'] = String(side);
                    div.appendChild(sideDiv);
                });
            },
            cardWidth: 58,
            cardHeight: 58
        }) || this;
        _this.game = game;
        return _this;
    }
    DiceManager.prototype.setUp = function (data) {
        var _this = this;
        var element = $(DiceManager.PLAYER_AREA);
        this.playerDiceStock = new LineStock(this, element, { center: true, gap: '16px' });
        dojo.place("<div id=\"".concat(DiceManager.OTHER_PLAYER_AREA, "\"></div>"), "player_board_".concat(Object.keys(this.game.gamedatas.players).find(function (playerId) { return Number(playerId) !== Number(_this.game.getPlayerId()); })));
        this.otherPlayerDiceStock = new VoidStock(this, $(DiceManager.OTHER_PLAYER_AREA));
        this.trafficDiceStock = new LineStock(this, $(DiceManager.TRAFFIC_DICE), {});
        this.trafficDiceStock.addCards(data.trafficDice);
        var player = data.players[this.game.getPlayerId()];
        if (player) {
            if (player.dice) {
                this.playerDiceStock.addCards(player.dice);
            }
        }
    };
    DiceManager.prototype.updateDieValue = function (die) {
        var dieElementId = this.getId(die);
        var dieElement = $(dieElementId);
        if (dieElement) {
            dieElement.dataset['value'] = String(die.side);
        }
        var stock = this.getCardStock(die);
        if (stock) {
            this.updateCardInformations(die);
        }
    };
    DiceManager.prototype.setSelectionMode = function (selectionMode, onSelectedActionSpaceChanged, allowedValues, allowedDieTypes) {
        if (this.playerDiceStock) {
            var selectableDice = this.playerDiceStock.getCards();
            if (allowedValues && allowedValues.length > 0) {
                selectableDice = selectableDice.filter(function (die) { return allowedValues.includes(die.value); });
            }
            if (allowedDieTypes && allowedDieTypes.length > 0) {
                selectableDice = selectableDice.filter(function (die) { return allowedDieTypes.includes(die.type); });
            }
            this.playerDiceStock.setSelectionMode(selectionMode, selectableDice);
            this.playerDiceStock.onSelectionChange = onSelectedActionSpaceChanged;
            if (selectableDice.length === 1) {
                this.playerDiceStock.selectCard(selectableDice[0]);
            }
        }
    };
    DiceManager.prototype.toggleShowPlayerDice = function (show) {
        $(DiceManager.PLAYER_AREA).style.display = show ? 'flex' : 'none';
    };
    DiceManager.PLAYER_AREA = 'st-player-dice';
    DiceManager.OTHER_PLAYER_AREA = 'st-other-player-dice';
    DiceManager.TRAFFIC_DICE = 'st-traffic-dice-stock';
    return DiceManager;
}(CardManager));
var TokenManager = /** @class */ (function (_super) {
    __extends(TokenManager, _super);
    function TokenManager(game) {
        var _this = _super.call(this, game, {
            getId: function (token) { return "st-token-".concat(token.id); },
            setupDiv: function (token, div) {
                div.classList.add('token');
                div.classList.add('st-token');
                div.dataset.type = token.type;
            },
            setupFrontDiv: function (token, div) {
            },
            cardWidth: 45,
            cardHeight: 45
        }) || this;
        _this.game = game;
        return _this;
    }
    return TokenManager;
}(CardManager));
var SpecialAbilityCardManager = /** @class */ (function (_super) {
    __extends(SpecialAbilityCardManager, _super);
    function SpecialAbilityCardManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "st-special-ability-card-".concat(card.id); },
            setupDiv: function (card, div) {
                div.classList.add('st-special-ability-card');
            },
            setupFrontDiv: function (card, div) {
                div.classList.add('st-special-ability');
                div.dataset.type = card.type + '';
                dojo.empty(div);
                var name = document.createElement('h1');
                name.textContent = _(card.name);
                div.appendChild(name);
                var description = document.createElement('p');
                description.innerHTML = _(card.description);
                div.appendChild(description);
            },
            cardWidth: 240,
            cardHeight: 158
        }) || this;
        _this.game = game;
        return _this;
    }
    SpecialAbilityCardManager.prototype.updateRolesThatUsedCard = function (card, rolesThatUsedCard) {
        if (card && card.type === 2) {
            var cardElement = this.getCardElement(card);
            var frontDiv_1 = cardElement.querySelector('.st-special-ability');
            frontDiv_1.querySelectorAll('.fa-check-circle').forEach(function (checkMark) { return checkMark.remove(); });
            rolesThatUsedCard.forEach(function (role) { return frontDiv_1.insertAdjacentHTML('beforeend', "<i class=\"fa fa-check-circle ".concat(role, "\" aria-hidden=\"true\"></i>")); });
        }
    };
    return SpecialAbilityCardManager;
}(CardManager));
var HelpDialogManager = /** @class */ (function () {
    function HelpDialogManager(game) {
        this.game = game;
        this.dialogId = 'stHelpDialogId';
    }
    HelpDialogManager.prototype.showActionSpaceHelp = function (event, actionSpace) {
        var _a;
        dojo.stopEvent(event);
        var html = "<div class=\"dp-help-dialog-content\"><div class=\"dp-help-dialog-content-left\">";
        html += actionSpace.mandatory ? "<p><i class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\"></i> ".concat(_('Mandatory, a die must be placed here each round'), "</p>") : '';
        html += "<p>".concat(dojo.string.substitute(_('<b>Allowed role(s)</b>: ${roles}'), { roles: actionSpace.allowedRoles.map(function (role) { return _(role); }).join(', ') }), "</p>");
        html += "<p>".concat(dojo.string.substitute(_('<b>Allowed values(s)</b>: ${values}'), { values: actionSpace.allowedValues ? (_a = actionSpace.allowedValues) === null || _a === void 0 ? void 0 : _a.map(function (role) { return _(role); }).join(', ') : _('all values') }), "</p>");
        html += "<p><i>".concat(this.getActionSpaceFlavorText(actionSpace.type), "</i></p>");
        html += "<p>".concat(this.getActionSpaceDescription(actionSpace.type), "</p>");
        html += "<br/><div style=\"display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;\">";
        html += "".concat(this.getActionSpaceFailure(actionSpace.type));
        html += "".concat(this.getActionSpaceVictoryCondition(actionSpace.type));
        html += "</div>";
        html += "</div>";
        this.showDialog(event, this.getActionSpaceTitle(actionSpace.type).toUpperCase(), html);
    };
    HelpDialogManager.prototype.getActionSpaceTitle = function (type) {
        if (type === 'landing-gear') {
            return _('landing gear');
        }
        return _(type);
    };
    HelpDialogManager.prototype.getActionSpaceFlavorText = function (type) {
        switch (type) {
            case 'axis':
                return _('Manage your plane’s Axis during your approach. The Airplane tilts. Be careful not to go into a spin!');
            case 'engines':
                return _('Depending on the power you assigned to the engines, the Airplane will advance... or not!');
            case 'radio':
                return _('Communicate with the Control Tower to clear the traffic on your approach path.');
            case 'landing-gear':
                return _('Deploy the Landing Gear. Each piece of Landing Gear deployed increases the Airplane’s drag and wind resistance.');
            case 'flaps':
                return _('Deploy the flaps. Each flap extended increases the aircraft’s lift and wind resistance.');
            case 'concentration':
                return _('This is not the time to crack under pressure; concentrate and prepare your next manoeuvres.');
            case 'brakes':
                return _('Brake enough to bring the plane to a halt once it touches the runway.');
            case 'kerosene':
                return _('Manage your fuel and land your plane before going dry!');
            default:
                return '';
        }
    };
    HelpDialogManager.prototype.getActionSpaceDescription = function (type) {
        switch (type) {
            case 'axis':
                return _('As soon as the second die is placed, compare the value of both dice: Do not move anything if both dice have the same number. If the dice show different numbers, turn the Airplane as many marks as the difference between the 2 dice. <b>Turn the Axis Arrow toward the player who played the highest die, and leave it there; do not reset the Axis to the starting point at the end of the round.</b>');
            case 'engines':
                return _('As soon as the second die is placed, add together the 2 dice played onto the Engine spaces; this is your speed. Then:<br/>If the sum is less than the weakest (blue) of the 2 Aerodynamics markers on the Speed Gauge, the Approach Track does not advance.<br/>If the sum is between the 2 Aerodynamics markers, the Approach Track advances one space.<br/>If the sum is greater than the highest (orange) of the 2 Aerodynamics markers, the Approach Track advances two space<br/><h3>WATCH OUT: The way you read your speed changes!</h3> During the final round, when playing the second engine die, instead of comparing your speed with the Aerodynamics markers, compare it WITH YOUR BRAKES.');
            case 'radio':
                return _('Play a dice here to remove a Airplane token from the space corresponding with the dice value. Counting from the Current Position upwards. Playing a die with value 1, removes an Airplane token from the Current Position.');
            case 'landing-gear':
                return _('Place a die respecting the number constraint. The order in which you deploy your Landing Gear is not important. If this is the first die you place here, the Switch below the space is activated (green light) and The Aerodynamics marker (blue) is moved one space. Playing on a space whose Switch is already showing green has no effect.');
            case 'flaps':
                return _('Place a die respecting the number constraint. Deploy the Flaps in order, from top to bottom. If this is the first die you place here, the Switch below the space is activated (green light) and The Aerodynamics marker (orange) is moved one space. Playing on a space whose Switch is already showing green has no effect.');
            case 'concentration':
                return _('Placing a die here will gain a Coffee token. You can never have more than 3 Coffee tokens. Any time you place a die you can spent Coffee tokens to increase/decrease the die value by 1. You can not change a 6 value into a 1 and vice versa.');
            case 'brakes':
                return _('Place a die respecting the number constraint. The brakes must be deployed in order, starting with the 2 space. If this is the first die you place here, the Switch below the space is activated (green light) and The Brakes marker (red) is moved. The Brakes only have an impact in the game’s final round. Playing on a space whose Switch is already showing green has no effect.');
            case 'kerosene':
                return _('Placing a die here will reduce the Kerosene level by a number of spaces equal to the die value. If no die is placed here at the end of the round, the Kerosene level is lowered by 6.');
            default:
                return '';
        }
    };
    HelpDialogManager.prototype.getActionSpaceFailure = function (type) {
        switch (type) {
            case 'axis':
                return "<div class=\"st-end-game-info-box failure\"><p><h1>".concat(this.game.getFailureReasonTitle('failure-axis'), "</h1></br>").concat(this.game.getFailureReasonText('failure-axis'), "</p></div>");
            case 'engines':
                return "<div class=\"st-end-game-info-box failure\"><p><h1>".concat(this.game.getFailureReasonTitle('failure-collision'), "</h1></br>").concat(this.game.getFailureReasonText('failure-collision'), "</p></div><div class=\"st-end-game-info-box failure\"><p><h1>").concat(this.game.getFailureReasonTitle('failure-overshoot'), "</h1></br>").concat(this.game.getFailureReasonText('failure-overshoot'), "</p></div>");
            case 'kerosene':
                return "<div class=\"st-end-game-info-box failure\"><p><h1>".concat(this.game.getFailureReasonTitle('failure-kerosene'), "</h1></br>").concat(this.game.getFailureReasonText('failure-kerosene'), "</p></div>");
            default:
                return '';
        }
    };
    HelpDialogManager.prototype.getActionSpaceVictoryCondition = function (type) {
        switch (type) {
            case 'axis':
                return "<div class=\"st-end-game-info-box success\"><p><h1>".concat(dojo.string.substitute(_('Victory Condition ${victoryCondition}'), { victoryCondition: 'C' }), "</h1></br>").concat(_(this.game.gamedatas.victoryConditions['C'].description), "</p></div>");
            case 'radio':
                return "<div class=\"st-end-game-info-box success\"><p><h1>".concat(dojo.string.substitute(_('Victory Condition ${victoryCondition}'), { victoryCondition: 'A' }), "</h1></br>").concat(_(this.game.gamedatas.victoryConditions['A'].description), "</p></div>");
            case 'landing-gear':
            case 'flaps':
                return "<div class=\"st-end-game-info-box success\"><p><h1>".concat(dojo.string.substitute(_('Victory Condition ${victoryCondition}'), { victoryCondition: 'B' }), "</h1></br>").concat(_(this.game.gamedatas.victoryConditions['B'].description), "</p></div>");
            case 'brakes':
            case 'engines':
                return "<div class=\"st-end-game-info-box success\"><p><h1>".concat(dojo.string.substitute(_('Victory Condition ${victoryCondition}'), { victoryCondition: 'D' }), "</h1></br>").concat(_(this.game.gamedatas.victoryConditions['D'].description), "</p></div>");
            default:
                return '';
        }
    };
    HelpDialogManager.prototype.showDialog = function (event, title, html) {
        dojo.stopEvent(event);
        this.dialog = new ebg.popindialog();
        this.dialog.create(this.dialogId);
        this.dialog.setTitle("<i class=\"fa fa-question-circle\" aria-hidden=\"true\"></i> ".concat(_(title)));
        this.dialog.setContent(html);
        this.dialog.show();
    };
    return HelpDialogManager;
}());
var PlayerSetup = /** @class */ (function () {
    function PlayerSetup(game, elementId) {
        this.game = game;
        this.elementId = elementId;
        this.roleCardsElementId = 'st-player-setup-role-cards';
        this.specialAbilityCardsElementId = 'st-player-setup-special-abilities';
        this.selectedRole = null;
        this.selectedSpecialAbilities = [];
    }
    PlayerSetup.prototype.destroy = function () {
        dojo.empty($(this.elementId));
    };
    PlayerSetup.prototype.setUp = function (args) {
        var _this = this;
        dojo.place("<h2>".concat(_('Select Role'), "</h2>"), this.elementId);
        dojo.place("<div id=\"".concat(this.roleCardsElementId, "\"></div>"), this.elementId);
        this.createRoleCard('pilot');
        this.createRoleCard('co-pilot');
        if (args.specialAbilities && args.specialAbilities.length > 0) {
            dojo.place("<h2>".concat(dojo.string.substitute(_('Select ${nr} Special Ability Card(s)'), { nr: args.nrOfSpecialAbilitiesToSelect }), "</h2>"), this.elementId);
            dojo.place("<div id=\"".concat(this.specialAbilityCardsElementId, "\"></div>"), this.elementId);
            this.specialAbilityCardsStock = new LineStock(this.game.specialAbilityCardManager, $(this.specialAbilityCardsElementId), { wrap: 'wrap', gap: '18px' });
            this.specialAbilityCardsStock.addCards(args.specialAbilities);
            if (this.game.isCurrentPlayerActive()) {
                this.specialAbilityCardsStock.setSelectionMode('multiple');
                this.specialAbilityCardsStock.onSelectionChange = function (selection) {
                    if (selection.length == args.nrOfSpecialAbilitiesToSelect) {
                        _this.specialAbilityCardsStock.setSelectableCards(selection);
                    }
                    else {
                        _this.specialAbilityCardsStock.setSelectableCards(_this.specialAbilityCardsStock.getCards());
                    }
                    _this.selectedSpecialAbilities = selection;
                };
            }
        }
    };
    PlayerSetup.prototype.createRoleCard = function (role) {
        var _this = this;
        dojo.place(this.game.playerRoleManager.createRoleCard(role), this.roleCardsElementId);
        if (this.game.isCurrentPlayerActive()) {
            var element = document.getElementById("st-role-card-".concat(role));
            element.classList.add('selectable');
            dojo.connect(element, 'onclick', function () { _this.roleCardClicked(role); });
        }
    };
    PlayerSetup.prototype.roleCardClicked = function (role) {
        var _this = this;
        var currentPlayer = this.game.getPlayer(this.game.getPlayerId());
        var otherPlayer = Object.keys(this.game.gamedatas.players)
            .filter(function (playerId) { return Number(playerId) !== _this.game.getPlayerId(); })
            .map(function (playerId) { return _this.game.gamedatas.players[playerId]; })[0];
        var clickedElement = document.getElementById("st-role-card-".concat(role));
        var otherElement = document.getElementById("st-role-card-".concat(role === 'pilot' ? 'co-pilot' : 'pilot'));
        clickedElement.classList.add('selected');
        clickedElement.classList.remove('selectable');
        dojo.destroy("st-role-card-playername-".concat(currentPlayer.id));
        dojo.place("<p id=\"st-role-card-playername-".concat(currentPlayer.id, "\">").concat(currentPlayer.name, "</p>"), clickedElement);
        otherElement.classList.add('selectable');
        otherElement.classList.remove('selected');
        dojo.destroy("st-role-card-playername-".concat(otherPlayer.id));
        dojo.place("<p id=\"st-role-card-playername-".concat(otherPlayer.id, "\">").concat(otherPlayer.name, "</p>"), otherElement);
        this.selectedRole = role;
    };
    return PlayerSetup;
}());
var EndGameInfo = /** @class */ (function () {
    function EndGameInfo(game, elementId) {
        this.game = game;
        this.elementId = elementId;
    }
    EndGameInfo.prototype.setFailureReason = function (failureReason) {
        if (failureReason) {
            var element = $(this.elementId);
            dojo.place(this.createFailureReaseonInfoBox(failureReason), element, 'only');
            element.scrollIntoView({ block: 'center', behavior: 'smooth' });
            return this.game.delay(5000);
        }
        return Promise.resolve();
    };
    EndGameInfo.prototype.setEndGameInfo = function (victoryConditions) {
        var element = $(this.elementId);
        var failure = Object.values(victoryConditions).some(function (vc) { return vc.status === 'failed'; });
        dojo.place("<div id=\"st-end-game-info-box\" class=\"st-end-game-info-box st-victory-conditions ".concat(failure ? 'failure' : 'success', "\"></div>"), element, 'only');
        var endGameInfoElement = new VictoryConditions(this.game, 'st-end-game-info-box');
        endGameInfoElement.updateVictoryConditions(victoryConditions);
        if (!failure) {
            dojo.place("<h2>".concat(_('Congratulations! The passengers burst into applause! You have landed smoothly, and you have won.'), "</h2>"), $('st-end-game-info-box'));
        }
        else {
            dojo.place("<h2>".concat(_('Unfortunately, not all victory conditions were met, better luck next time pilots!'), "</h2>"), $('st-end-game-info-box'));
        }
        element.scrollIntoView({ block: 'center', behavior: 'smooth' });
        return this.game.delay(10000);
    };
    EndGameInfo.prototype.createFailureReaseonInfoBox = function (failureReason) {
        return "<div class=\"st-end-game-info-box failure\">\n                    <h1>".concat(this.game.getFailureReasonTitle(failureReason), "</h1>\n                    <p>").concat(this.game.getFailureReasonText(failureReason), "</p>\n                </div>");
    };
    return EndGameInfo;
}());
var SpendCoffee = /** @class */ (function () {
    function SpendCoffee(game, parentId) {
        this.game = game;
        this.parentId = parentId;
        this.currentDie = null;
        this.originalSide = 0;
        this.originalValue = 0;
        this.minValue = 0;
        this.maxValue = 0;
        dojo.place("<div id=\"".concat(SpendCoffee.ELEMENT_ID, "\"></div>"), $(this.parentId));
    }
    SpendCoffee.prototype.initiate = function (die, nrOfCoffeeTokens, onCoffeeSpend) {
        var _this = this;
        var element = $(SpendCoffee.ELEMENT_ID);
        dojo.empty(element);
        if (this.currentDie) {
            this.currentDie.side = this.originalSide;
            this.currentDie.value = this.originalValue;
            this.game.diceManager.updateDieValue(this.currentDie);
        }
        if (nrOfCoffeeTokens > 0) {
            this.currentDie = die;
            this.originalSide = die.side;
            this.originalValue = die.value;
            this.minValue = Math.max(die.value - nrOfCoffeeTokens, die.type === 'traffic' ? 2 : 1);
            this.maxValue = Math.min(die.value + nrOfCoffeeTokens, die.type === 'traffic' ? 5 : 6);
            var content = '';
            content += "<a id=\"st-spend-coffee-decrease\" class=\"bgabutton bgabutton_blue\"> <i class=\"fa fa-minus\" aria-hidden=\"true\"></i> </a>";
            content += "<a id=\"st-spend-coffee-total-cost\" class=\"bgabutton bgabutton_gray disabled\"></a>";
            content += "<a id=\"st-spend-coffee-increase\" class=\"bgabutton bgabutton_blue\"> <i class=\"fa fa-plus\" aria-hidden=\"true\"></i> </a>";
            dojo.place(content, element);
            this.updateButtonsDisabledState(die);
            this.updateTotalCost();
            var decreaseButton = $('st-spend-coffee-decrease');
            dojo.connect(decreaseButton, 'onclick', function (event) {
                dojo.stopEvent(event);
                die.value = die.value - 1;
                die.side = _this.determineNewSide(die);
                _this.updateButtonsDisabledState(die);
                _this.updateTotalCost();
                _this.game.diceManager.updateDieValue(die);
                onCoffeeSpend(die);
            });
            var increaseButton = $('st-spend-coffee-increase');
            dojo.connect(increaseButton, 'onclick', function (event) {
                dojo.stopEvent(event);
                die.value = die.value + 1;
                die.side = _this.determineNewSide(die);
                _this.updateButtonsDisabledState(die);
                _this.updateTotalCost();
                _this.game.diceManager.updateDieValue(die);
                onCoffeeSpend(die);
            });
        }
    };
    SpendCoffee.prototype.destroy = function () {
        var element = $(SpendCoffee.ELEMENT_ID);
        dojo.empty(element);
        this.currentDie = null;
    };
    SpendCoffee.prototype.getCoffeeSpend = function () {
        return Math.abs(this.currentDie.value - this.originalValue);
    };
    SpendCoffee.prototype.updateTotalCost = function () {
        var totalCost = $('st-spend-coffee-total-cost');
        dojo.empty(totalCost);
        dojo.place("<span>".concat(dojo.string.substitute(_("Use: ${totalCost}"), { totalCost: this.getCoffeeSpend() }), " <span class=\"st-token small token\" data-type=\"coffee\"></span></span>"), totalCost);
    };
    SpendCoffee.prototype.updateButtonsDisabledState = function (die) {
        var increaseButton = $('st-spend-coffee-increase');
        var decreaseButton = $('st-spend-coffee-decrease');
        increaseButton.classList.remove('disabled');
        decreaseButton.classList.remove('disabled');
        if (die.value == this.minValue) {
            decreaseButton.classList.add('disabled');
        }
        if (die.value == this.maxValue) {
            increaseButton.classList.add('disabled');
        }
    };
    SpendCoffee.prototype.determineNewSide = function (die) {
        if (die.type !== "traffic") {
            return die.value;
        }
        else {
            if (die.value === 2) {
                return 1;
            }
            else if (die.value === 3) {
                return 2;
            }
            else if (die.value === 4) {
                return 4;
            }
            else if (die.value === 5) {
                return 6;
            }
        }
    };
    SpendCoffee.ELEMENT_ID = 'st-spend-coffee';
    return SpendCoffee;
}());
var VictoryConditions = /** @class */ (function () {
    function VictoryConditions(game, elementId) {
        this.game = game;
        this.elementId = elementId;
    }
    VictoryConditions.prototype.updateVictoryConditions = function (victoryConditions) {
        var element = $(this.elementId);
        dojo.empty(element);
        var html = "<h3>".concat(_('FINAL TURN - VICTORY CONDITIONS'), "</h3>");
        for (var conditionLetter in victoryConditions) {
            var victoryCondition = victoryConditions[conditionLetter];
            html += "<div class=\"st-victory-conditions-row ".concat(victoryCondition.status, "\">\n                        <div class=\"st-victory-conditions-row-letter\"><span>").concat(conditionLetter, "</span></div>\n                        <div class=\"st-victory-conditions-row-description\">").concat(_(victoryCondition.description), "</div>\n                        <div class=\"st-victory-conditions-row-status\">").concat(this.getIconForStatus(victoryCondition.status), "</div>\n                     </div>");
        }
        dojo.place(html, element);
    };
    VictoryConditions.prototype.getIconForStatus = function (status) {
        switch (status) {
            case "pending":
                return '<i class="fa fa-clock-o" aria-hidden="true"></i>';
            case "failed":
                return '<i class="fa fa-times-circle-o" aria-hidden="true"></i>';
            case 'success':
                return '<i class="fa fa-check-circle-o" aria-hidden="true"></i>';
        }
    };
    return VictoryConditions;
}());
var WelcomeDialog = /** @class */ (function () {
    function WelcomeDialog(game) {
        var _this = this;
        this.game = game;
        this.localStorageKey = 'skyteam-welcome-dialog';
        this.dialogId = 'stWelcomeDialogId';
        dojo.place('<div id="bga-help_buttons"><button class="bga-help_button bga-help_popin-button">?</button></div>', $('left-side'));
        dojo.connect($('bga-help_buttons'), 'click', function () { return _this.showDialog(true); });
    }
    WelcomeDialog.prototype.showDialog = function (force) {
        var _this = this;
        if (force === void 0) { force = false; }
        if (!this.isHideWelcomeScreen() || force) {
            this.dialog = new ebg.popindialog();
            this.dialog.create(this.dialogId);
            this.dialog.setTitle("<i class=\"fa fa-plane\" aria-hidden=\"true\"></i> ".concat(_('Welcome to Sky Team!')));
            this.dialog.setContent(this.createContent());
            this.dialog.show();
            dojo.connect($('welcome-dialog-hide'), 'change', function (event) {
                dojo.stopEvent(event);
                if (event.target.checked) {
                    localStorage.setItem(_this.localStorageKey, 'hide');
                }
                else {
                    localStorage.setItem(_this.localStorageKey, 'show');
                }
            });
        }
    };
    WelcomeDialog.prototype.createContent = function () {
        var html = '';
        html += "<div style=\"display: flex; justify-content: center;\"><img src=\"".concat(g_gamethemeurl, "/img/skyteam-logo.png\" width=\"100%\" style=\"max-width: 300px;\"></img></div>");
        html += "<p>".concat(_('In this cooperative game, you play a team of pilots charged with landing your commercial airliner at airports all over the world. But landing an airplane is not as easy as you might think! You’ll need to communicate with the Control Tower to make sure your approach is free of air traffic, adjust your speed to not overshoot the airport, level your plane in order to land square with the ground, deploy your flaps to increase lift and allow you to descend more steeply, deploy your landing gear to ensure a safe landing, and finally engage the brakes to slow the plane once you\'ve landed. Cooperation and nerves of steel are all it takes to succeed!'), "</p>");
        html += "<h1>".concat(_('Communications'), "</h1>");
        html += "<p>".concat(_('In Sky Team, there are 2 ways to communicate: Verbally, before rolling the dice; and by placing your die during the Dice Placement phase without talking. While nothing restricts you from talking during the dice placement phase, talking and discussing strategy is against the intended nature of the game. Watch out for the communication banner during the game to know when you are allowed to communicate verbally. You can also click on the banners for more info.'), "</p>");
        html += "<img src=\"".concat(g_gamethemeurl, "/img/skyteam-welcome-comms-banners.png\" width=\"100%\"></img>");
        html += "<h1>".concat(_('Preferences'), "</h1>");
        html += "<p>".concat(_('Once you are familiar with the game you can hide the communications banner and/or help buttons to have a cleaner interface. Go to the preferences panel through the BGA menu.'), "</p>");
        html += "<h3 style=\"text-align: center\">".concat(_('Enjoy Sky Team!'), "</br>Le Scorpion Masque</h3>");
        html += "</br>";
        html += "<label for=\"welcome-dialog-hide\" style=\"cursor: pointer;\"><input id=\"welcome-dialog-hide\" type=\"checkbox\" ".concat(this.isHideWelcomeScreen() ? 'checked="checked"' : '', " /> ").concat(_('Hide this Welcome Screen when opening the table (you can always access it through the ? in the bottom left corner)'), "</label>");
        return html;
    };
    WelcomeDialog.prototype.isHideWelcomeScreen = function () {
        return localStorage.getItem(this.localStorageKey) === 'hide';
    };
    return WelcomeDialog;
}());
var ANIMATION_MS = 1000;
var TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;
var SkyTeam = /** @class */ (function () {
    function SkyTeam() {
        var _this = this;
        this.delay = function (ms) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.animationManager.animationsActive()) return [3 /*break*/, 2];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, Promise.resolve()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); };
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
    SkyTeam.prototype.setup = function (data) {
        this.setAlwaysFixTopActions();
        log("Starting game setup");
        log('gamedatas', data);
        var maintitlebarContent = $('maintitlebar_content');
        dojo.place('<div id="st-communication-wrapper"><div id="st-communication-info"></div></div>', $('pagesection_gameview'), 'last');
        dojo.place('<div id="st-player-dice-wrapper"><div id="st-player-dice"></div></div>', maintitlebarContent, 'last');
        dojo.place('<div id="st-custom-actions"></div>', maintitlebarContent, 'last');
        dojo.place('<div id="st-final-round-notice"></div>', maintitlebarContent, 'last');
        // Setup modules
        this.zoomManager = new AutoZoomManager(this, 'st-game', 'st-zoom-level');
        this.animationManager = new AnimationManager(this, { duration: ANIMATION_MS });
        // Setup Managers
        this.playerRoleManager.setUp(data);
        this.planeManager.setUp(data);
        this.reserveManager.setUp(data);
        this.diceManager.setUp(data);
        this.communicationInfoManager.setUp(data);
        this.actionSpaceManager.setUp(data);
        // Setup UI
        this.playerSetup = new PlayerSetup(this, 'st-player-setup');
        this.endGameInfo = new EndGameInfo(this, 'st-end-game-info-wrapper');
        this.spendCoffee = new SpendCoffee(this, 'st-custom-actions');
        this.welcomeDialog = new WelcomeDialog(this);
        this.welcomeDialog.showDialog();
        if (data.finalRound && !data.isLanded) {
            this.setFinalRound();
        }
        if (data.isLanded) {
            this.endGameInfo.setEndGameInfo(data.victoryConditions);
        }
        else {
            this.endGameInfo.setFailureReason(data.failureReason);
        }
        this.setupNotifications();
        log("Ending game setup");
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    SkyTeam.prototype.onEnteringState = function (stateName, args) {
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
                break;
            case 'swapDice':
                this.enteringSwapDice();
                break;
            case 'gameEnd':
                this.unsetFinalRound();
                break;
        }
    };
    SkyTeam.prototype.enteringPlayerSetup = function (args) {
        this.diceManager.toggleShowPlayerDice(false);
        this.playerSetup.setUp(args);
    };
    SkyTeam.prototype.enteringStrategy = function () {
        this.diceManager.toggleShowPlayerDice(false);
    };
    SkyTeam.prototype.enteringRerollDice = function (args) {
        var _this = this;
        this.diceManager.toggleShowPlayerDice(true);
        if (this.isCurrentPlayerActive()) {
            this.diceManager.setSelectionMode('multiple', function (selection) {
                if (selection.length == args.maxNumberOfDice) {
                    _this.diceManager.playerDiceStock.setSelectableCards(selection);
                }
                else {
                    _this.diceManager.playerDiceStock.setSelectableCards(_this.diceManager.playerDiceStock.getCards());
                }
            });
        }
    };
    SkyTeam.prototype.enteringFlipDie = function () {
        this.diceManager.toggleShowPlayerDice(true);
        if (this.isCurrentPlayerActive()) {
            this.diceManager.setSelectionMode('single');
        }
    };
    SkyTeam.prototype.enteringSwapDice = function () {
        this.diceManager.toggleShowPlayerDice(true);
        if (this.isCurrentPlayerActive()) {
            this.diceManager.setSelectionMode('single');
        }
    };
    SkyTeam.prototype.enteringDicePlacementSelect = function (args, trafficDieOnly) {
        var _this = this;
        this.diceManager.toggleShowPlayerDice(true);
        if (this.isCurrentPlayerActive()) {
            this.diceManager.setSelectionMode('single', function (selection) { return _this.onDicePlacementDiceSelected(args, selection); }, [], trafficDieOnly ? ['traffic'] : []);
        }
    };
    SkyTeam.prototype.onDicePlacementDiceSelected = function (args, selection) {
        var _this = this;
        dojo.addClass('confirmPlacement', 'disabled');
        this.actionSpaceManager.setActionSpacesSelectable({}, null);
        if (selection.length == 1) {
            var die_1 = selection[0];
            this.actionSpaceManager.setActionSpacesSelectable(args.availableActionSpaces, function (space) { return _this.onDicePlacementActionSelected(args, die_1, space); }, die_1.value);
            this.spendCoffee.initiate(die_1, args.nrOfCoffeeAvailable, function (die) { return _this.onDicePlacementCoffeeSpend(args, die); });
        }
        else {
            this.spendCoffee.initiate(null, 0, null);
        }
    };
    SkyTeam.prototype.onDicePlacementActionSelected = function (args, die, space) {
        var _a;
        (_a = document.querySelector('.st-dice-placeholder')) === null || _a === void 0 ? void 0 : _a.remove();
        this.planeManager.unhighlightPlane();
        if (space) {
            var dieElement = this.diceManager.getCardElement(die);
            var dieElementClonePlaceholder = dieElement.cloneNode(true);
            dieElementClonePlaceholder.id = dieElementClonePlaceholder.id + '-clone';
            dieElementClonePlaceholder.classList.add('st-dice-placeholder');
            dieElementClonePlaceholder.classList.remove('bga-cards_selectable-card');
            dieElementClonePlaceholder.classList.remove('bga-cards_selected-card');
            $(space).appendChild(dieElementClonePlaceholder);
            if (space.startsWith('radio')) {
                this.planeManager.highlightApproachSlot(die.value);
            }
            else if (space.startsWith('axis')) {
                var otherSlot = space === 'axis-1' ? 'axis-2' : 'axis-1';
                var otherDie = this.actionSpaceManager.getDieInLocation(otherSlot);
                if (otherDie) {
                    var pilotValue = space === 'axis-1' ? die.value : otherDie.value;
                    var copilotValue = space === 'axis-2' ? die.value : otherDie.value;
                    var axisChange = copilotValue - pilotValue;
                    this.planeManager.hightlightAxis(this.planeManager.currentAxis + axisChange);
                }
            }
            dojo.removeClass('confirmPlacement', 'disabled');
        }
        else {
            dojo.addClass('confirmPlacement', 'disabled');
        }
    };
    SkyTeam.prototype.onDicePlacementCoffeeSpend = function (args, die) {
        var _this = this;
        dojo.addClass('confirmPlacement', 'disabled');
        this.actionSpaceManager.setActionSpacesSelectable({}, null);
        this.actionSpaceManager.setActionSpacesSelectable(args.availableActionSpaces, function (space) { return _this.onDicePlacementActionSelected(args, die, space); }, die.value);
    };
    SkyTeam.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'playerSetup':
                this.leavingPlayerSetup();
                break;
            case 'dicePlacementSelect':
                this.leavingDicePlacementSelect();
                break;
            case 'rerollDice':
                this.leavingRerollDice();
                break;
        }
    };
    SkyTeam.prototype.leavingPlayerSetup = function () {
        this.playerSetup.destroy();
    };
    SkyTeam.prototype.leavingDicePlacementSelect = function () {
        if (this.isCurrentPlayerActive()) {
            this.actionSpaceManager.selectedActionSpaceId = null;
            this.actionSpaceManager.setActionSpacesSelectable({}, null);
            this.diceManager.setSelectionMode('none', null);
            this.spendCoffee.destroy();
        }
    };
    SkyTeam.prototype.leavingRerollDice = function () {
        this.diceManager.setSelectionMode('none');
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    SkyTeam.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'playerSetup':
                    this.addActionButton('confirmPlayerSetup', _("Confirm"), function () { return _this.confirmPlayerSetup(args); });
                    break;
                case 'strategy':
                    this.addActionButton('confirmReadyStrategy', _("I'm Ready"), function () { return _this.confirmReadyStrategy(); });
                    break;
                case 'dicePlacementSelect':
                    this.addActionButton('confirmPlacement', _("Confirm"), function () { return _this.confirmPlacement(); });
                    dojo.addClass('confirmPlacement', 'disabled');
                    if (args.canActivateAdaptation) {
                        this.addActionButton('useAdaptation', _("Use Special Ability: Adaptation"), function () { return _this.requestAdaptation(); }, null, null, 'gray');
                    }
                    break;
                case 'rerollDice':
                    this.addActionButton('rerollDice', _("Reroll selected dice"), function () { return _this.rerollDice(); });
                    break;
                case 'flipDie':
                    this.addActionButton('rerollDice', _("Flip selected die"), function () { return _this.flipDie(); });
                    this.addActionButton('cancel', _("Cancel"), function () { return _this.cancelAdaptation(); }, null, null, 'gray');
                    break;
                case 'swapDice':
                    var swapDiceArgs = args;
                    var SwapDieButtonText = swapDiceArgs.firstDie ? "".concat(dojo.string.substitute(_("Swap selected die value with ${die}"), { die: swapDiceArgs.firstDie.side })) : _('Swap selected die');
                    this.addActionButton('swapDie', SwapDieButtonText, function () { return _this.swapDie(args.firstDie); });
                    if (!swapDiceArgs.firstDie) {
                        this.addActionButton('cancel', _("Cancel"), function () { return _this.cancelSwap(); }, null, null, 'gray');
                    }
                    break;
                case 'performSynchronisation':
                    this.addActionButton('confirmPlacement', _("Confirm"), function () { return _this.confirmPlacement(); });
                    dojo.addClass('confirmPlacement', 'disabled');
                    break;
            }
            if (args === null || args === void 0 ? void 0 : args.canCancelMoves) {
                this.addActionButton('undoLast', _("Undo last"), function () { return _this.undoLast(); }, null, null, 'red');
                this.addActionButton('undoAll', _("Undo all"), function () { return _this.undoAll(); }, null, null, 'red');
            }
        }
        if (!this.isReadOnly()) {
            switch (stateName) {
                case 'dicePlacementSelect':
                case 'performSynchronisation':
                    if (args.canActivateWorkingTogether) {
                        this.addActionButton('useWorkingTogether', _("Use Special Ability: Working Together"), function () { return _this.requestSwap(); }, null, null, 'gray');
                    }
                    if (args.nrOfRerollAvailable > 0) {
                        this.addActionButton('useReroll', "<span>".concat(dojo.string.substitute(_("Use ${token} to reroll dice"), { token: this.tokenIcon('reroll') }), "</span>"), function () { return _this.requestReroll(); }, null, null, 'gray');
                    }
                    break;
            }
        }
    };
    SkyTeam.prototype.confirmReadyStrategy = function () {
        this.takeAction('confirmReadyStrategy');
    };
    SkyTeam.prototype.confirmPlacement = function () {
        var _this = this;
        var actionSpaceId = this.actionSpaceManager.selectedActionSpaceId;
        var diceId = this.diceManager.playerDiceStock.getSelection()[0].id;
        var diceValue = this.spendCoffee.currentDie ? this.spendCoffee.currentDie.side : null;
        var confirmMessage = undefined;
        if (actionSpaceId.startsWith('radio') && document.querySelectorAll('.st-approach-overlay-track-slot-highlighted').length === 0) {
            confirmMessage = _('Your Radio reach is outside of the Approach Track. This action has no effect.');
        }
        else if (actionSpaceId.startsWith('concentration') && this.reserveManager.reserveCoffeeStock.getCards().length === 0) {
            confirmMessage = _('No Coffee tokens remaining. This action has no effect.');
        }
        var runnable = function () {
            _this.actionSpaceManager.selectedActionSpaceId = null;
            _this.actionSpaceManager.setActionSpacesSelectable({}, null);
            _this.diceManager.setSelectionMode('none', null);
            _this.spendCoffee.destroy();
            _this.takeAction('confirmPlacement', {
                placement: JSON.stringify({ actionSpaceId: actionSpaceId, diceId: diceId, diceValue: diceValue })
            });
        };
        if (confirmMessage) {
            this.wrapInConfirm(runnable, confirmMessage);
        }
        else {
            runnable();
        }
    };
    SkyTeam.prototype.confirmPlayerSetup = function (args) {
        if (!this.playerSetup.selectedRole) {
            this.showMessage(_("You need to select a role"), 'error');
            return;
        }
        if (this.playerSetup.selectedSpecialAbilities.length != args.nrOfSpecialAbilitiesToSelect) {
            this.showMessage(_("You need to select a special ability card(s)"), 'error');
            return;
        }
        this.takeAction('confirmPlayerSetup', {
            settings: JSON.stringify({
                activePlayerRole: this.playerSetup.selectedRole,
                specialAbilityCardIds: this.playerSetup.selectedSpecialAbilities.map(function (card) { return card.id; })
            })
        });
    };
    SkyTeam.prototype.requestReroll = function () {
        var _this = this;
        this.wrapInConfirm(function () {
            _this.takeAction('requestReroll');
        }, _('This action allows players to use a re-roll token to re-roll any number of their dice. This action cannot be undone.'));
    };
    SkyTeam.prototype.requestAdaptation = function () {
        this.takeAction('requestAdaptation');
    };
    SkyTeam.prototype.requestSwap = function () {
        this.takeAction('requestSwap');
    };
    SkyTeam.prototype.cancelAdaptation = function () {
        this.diceManager.setSelectionMode('none');
        this.takeAction('cancelAdaptation');
    };
    SkyTeam.prototype.cancelSwap = function () {
        this.diceManager.setSelectionMode('none');
        this.takeAction('cancelSwap');
    };
    SkyTeam.prototype.rerollDice = function () {
        var _this = this;
        var selectedDieIds = this.diceManager.playerDiceStock.getSelection().map(function (die) { return die.id; });
        this.wrapInConfirm(function () {
            _this.diceManager.setSelectionMode('none');
            _this.takeNoLockAction('rerollDice', { payload: JSON.stringify({ selectedDieIds: selectedDieIds }) });
        }, dojo.string.substitute(_("You have chosen to re-roll ${nrOfSelectedDice} dice. This action cannot be undone."), { nrOfSelectedDice: selectedDieIds.length + '' }));
    };
    SkyTeam.prototype.flipDie = function () {
        var _this = this;
        var selectedDice = this.diceManager.playerDiceStock.getSelection();
        if (selectedDice.length !== 1) {
            this.showMessage(_("You need to select a die to flip"), 'error');
            return;
        }
        var selectedDie = selectedDice[0];
        var selectedDieId = selectedDie.id;
        this.wrapInConfirm(function () {
            _this.diceManager.setSelectionMode('none');
            _this.takeNoLockAction('flipDie', { payload: JSON.stringify({ selectedDieId: selectedDieId }) });
        }, dojo.string.substitute(_('Do you want to flip ${originalDie} to ${newDie}? This action cannot be undone.'), { originalDie: this.diceIcon(selectedDie), newDie: this.diceIcon(__assign(__assign({}, selectedDie), { side: 7 - selectedDie.side })) }));
    };
    SkyTeam.prototype.swapDie = function (firstDie) {
        var _this = this;
        var selectedDice = this.diceManager.playerDiceStock.getSelection();
        if (selectedDice.length !== 1) {
            this.showMessage(_("You need to select a die to swap"), 'error');
            return;
        }
        var selectedDie = selectedDice[0];
        var selectedDieId = selectedDie.id;
        var confirmText = dojo.string.substitute(_('Do you want to swap ${die}? This action cannot be undone.'), { die: this.diceIcon(selectedDie) });
        if (firstDie) {
            confirmText = dojo.string.substitute(_('Do you want to swap the values of ${die} and ${firstDie}? This action cannot be undone.'), { die: this.diceIcon(selectedDie), firstDie: this.diceIcon(firstDie) });
        }
        this.wrapInConfirm(function () {
            _this.diceManager.setSelectionMode('none');
            _this.takeNoLockAction('swapDie', { payload: JSON.stringify({ selectedDieId: selectedDieId }) });
        }, confirmText);
    };
    SkyTeam.prototype.undoLast = function () {
        this.takeNoLockAction('undoLast');
    };
    SkyTeam.prototype.undoAll = function () {
        this.takeNoLockAction('undoAll');
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    SkyTeam.prototype.setFinalRound = function () {
        dojo.place("<p>".concat(_('This is the final round!'), "</p>"), $('st-final-round-notice'));
    };
    SkyTeam.prototype.unsetFinalRound = function () {
        dojo.empty($('st-final-round-notice'));
    };
    SkyTeam.prototype.getFailureReasonTitle = function (failureReason) {
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
    };
    SkyTeam.prototype.getFailureReasonText = function (failureReason) {
        switch (failureReason) {
            case 'failure-axis':
                return _('If the Axis Arrow reaches or goes past an X, the plane goes into a spin; you have lost the game!');
            case 'failure-collision':
                return _('If there are Airplane tokens in the Current Position space and you have to advance the Approach Track, you have had a collision; you have lost the game!');
            case 'failure-overshoot':
                return _('If the airport is in the Current Position space and you have to advance the Approach Track, you have overshot the airport; you have lost the game!');
            case 'failure-crash-landed':
                return _('You have crash landed before reaching the airport; you have lost the game!');
            case 'failure-turn':
                return _('When you advance the Approach Track, if the airplane’s Axis is not in one of the permitted positions, you lose the game. This also applies to both spaces you fly through if you advance 2 spaces during the round. If you do not advance the Approach Track (you move 0 spaces), you do not need to follow these constraints.');
            case 'failure-kerosene':
                return _('At any time during the game, even in the final round, if you hit the X space on the Kerosene track, you have run out of kerosene and you’ve lost the game!');
        }
        return '';
    };
    SkyTeam.prototype.disableActionButtons = function () {
        var buttons = document.querySelectorAll('.action-button');
        buttons.forEach(function (button) {
            button.classList.add('disabled');
        });
    };
    SkyTeam.prototype.isReadOnly = function () {
        return this.isSpectator || typeof g_replayFrom != 'undefined' || g_archive_mode;
    };
    SkyTeam.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    SkyTeam.prototype.getPlayer = function (playerId) {
        return Object.values(this.gamedatas.players).find(function (player) { return Number(player.id) == playerId; });
    };
    SkyTeam.prototype.takeAction = function (action, data, onComplete) {
        if (onComplete === void 0) { onComplete = function () { }; }
        if (this.checkLock()) {
            data = data || {};
            data.lock = true;
            this.ajaxcall("/skyteam/skyteam/".concat(action, ".html"), data, this, onComplete);
        }
    };
    SkyTeam.prototype.takeNoLockAction = function (action, data, onComplete) {
        if (onComplete === void 0) { onComplete = function () { }; }
        this.disableActionButtons();
        data = data || {};
        this.ajaxcall("/skyteam/skyteam/".concat(action, ".html"), data, this, onComplete);
    };
    SkyTeam.prototype.setTooltip = function (id, html) {
        this.addTooltipHtml(id, html, TOOLTIP_DELAY);
    };
    SkyTeam.prototype.setTooltipToClass = function (className, html) {
        this.addTooltipHtmlToClass(className, html, TOOLTIP_DELAY);
    };
    SkyTeam.prototype.setScore = function (playerId, score) {
        var _a;
        (_a = this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.toValue(score);
    };
    SkyTeam.prototype.isAskForConfirmation = function () {
        return true; // For now always ask for confirmation, might make this a preference later on.
    };
    SkyTeam.prototype.wrapInConfirm = function (runnable, message) {
        if (message === void 0) { message = _("This action can not be undone. Are you sure?"); }
        if (this.checkLock()) {
            if (this.isAskForConfirmation()) {
                this.confirmationDialog(message, function () {
                    runnable();
                });
            }
            else {
                runnable();
            }
        }
    };
    SkyTeam.prototype.setAlwaysFixTopActions = function (alwaysFixed, maximum) {
        if (alwaysFixed === void 0) { alwaysFixed = true; }
        if (maximum === void 0) { maximum = 30; }
        this.alwaysFixTopActions = alwaysFixed;
        this.alwaysFixTopActionsMaximum = maximum;
        this.adaptStatusBar();
    };
    SkyTeam.prototype.adaptStatusBar = function () {
        this.inherited(arguments);
        if (this.alwaysFixTopActions) {
            var afterTitleElem = document.getElementById('after-page-title');
            var titleElem = document.getElementById('page-title');
            //@ts-ignore
            var zoom = getComputedStyle(titleElem).zoom;
            if (!zoom) {
                zoom = 1;
            }
            var titleRect = afterTitleElem.getBoundingClientRect();
            if (titleRect.top < 0 && (titleElem.offsetHeight < (window.innerHeight * this.alwaysFixTopActionsMaximum / 100))) {
                var afterTitleRect = afterTitleElem.getBoundingClientRect();
                titleElem.classList.add('fixed-page-title');
                titleElem.style.width = ((afterTitleRect.width - 10) / zoom) + 'px';
                afterTitleElem.style.height = titleRect.height + 'px';
            }
            else {
                titleElem.classList.remove('fixed-page-title');
                titleElem.style.width = 'auto';
                afterTitleElem.style.height = '0px';
            }
        }
    };
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications
    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    SkyTeam.prototype.setupNotifications = function () {
        var _this = this;
        log('notifications subscriptions setup');
        var notifs = [
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
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, function (notifDetails) {
                log("notif_".concat(notif[0]), notifDetails.args);
                var promise = _this["notif_".concat(notif[0])](notifDetails.args);
                // tell the UI notification ends
                promise === null || promise === void 0 ? void 0 : promise.then(function () { return _this.notifqueue.onSynchronousNotificationEnd(); });
            });
            // make all notif as synchronous
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    SkyTeam.prototype.notif_newPhaseStarted = function (args) {
        this.communicationInfoManager.update(args.newPhase);
    };
    SkyTeam.prototype.notif_playerRoleAssigned = function (args) {
        var promise = this.playerRoleManager.setRole(args.playerId, args.role, args.roleColor);
        if (args.playerId === this.getPlayerId()) {
            this.diceManager.playerDiceStock.addCards(args.dice);
        }
        return promise;
    };
    SkyTeam.prototype.notif_specialAbilitiesSelected = function (args) {
        return this.planeManager.specialAbilityCardStock.addCards(args.cards);
    };
    SkyTeam.prototype.notif_tokenReceived = function (args) {
        if (args.token.type == 'reroll') {
            return this.planeManager.rerollTokenStock.addCard(args.token);
        }
        else if (args.token.type == 'coffee') {
            return this.planeManager.coffeeTokenStock.addCard(args.token);
        }
        return Promise.resolve();
    };
    SkyTeam.prototype.notif_diceRolled = function (args) {
        var _this = this;
        this.diceManager.toggleShowPlayerDice(true);
        var promises = args.dice.map(function (die) {
            var cardStock = _this.diceManager.getCardStock(die);
            if (!cardStock) {
                _this.diceManager.playerDiceStock.addCard(die);
                cardStock = _this.diceManager.getCardStock(die);
            }
            var originalDie = cardStock.getCards().find(function (originalDie) { return originalDie.id === die.id; });
            _this.diceManager.updateDieValue(__assign(__assign({}, originalDie), { side: 7 - die.side }));
            return _this.delay(500).then(function () { return _this.diceManager.updateDieValue(die); });
        });
        return Promise.all(promises);
    };
    SkyTeam.prototype.notif_playerUsedAdaptation = function (args) {
        this.specialAbilityCardManager.updateRolesThatUsedCard(this.planeManager.specialAbilityCardStock.getCards().find(function (card) { return card.type === 2; }), args.rolesThatUsedAdaptation);
    };
    SkyTeam.prototype.notif_diePlaced = function (args) {
        return this.actionSpaceManager.moveDieToActionSpace(args.die);
    };
    SkyTeam.prototype.notif_planeAxisChanged = function (args) {
        return this.planeManager.updateAxis(args.axis);
    };
    SkyTeam.prototype.notif_planeFailure = function (args) {
        return this.endGameInfo.setFailureReason(args.failureReason);
    };
    SkyTeam.prototype.notif_planeApproachChanged = function (args) {
        return this.planeManager.updateApproach(args.approach);
    };
    SkyTeam.prototype.notif_planeTokenRemoved = function (args) {
        if (args.plane) {
            return this.reserveManager.reservePlaneStock.addCard(args.plane, {});
        }
        return Promise.resolve();
    };
    SkyTeam.prototype.notif_planeSwitchChanged = function (args) {
        return this.planeManager.updateSwitch(args.planeSwitch);
    };
    SkyTeam.prototype.notif_planeAerodynamicsChanged = function (args) {
        if (args.aerodynamicsBlue) {
            return this.planeManager.updateAerodynamicsBlue(args.aerodynamicsBlue);
        }
        if (args.aerodynamicsOrange) {
            return this.planeManager.updateAerodynamicsOrange(args.aerodynamicsOrange);
        }
        return Promise.resolve();
    };
    SkyTeam.prototype.notif_planeBrakeChanged = function (args) {
        return this.planeManager.updateBrake(args.brake);
    };
    SkyTeam.prototype.notif_coffeeUsed = function (args) {
        return this.reserveManager.reserveCoffeeStock.addCards(args.tokens);
    };
    SkyTeam.prototype.notif_rerollTokenUsed = function (args) {
        return this.reserveManager.reserveRerollStock.addCard(args.token);
    };
    SkyTeam.prototype.notif_planeAltitudeChanged = function (args) {
        return this.planeManager.updateAltitude(args.altitude);
    };
    SkyTeam.prototype.notif_diceReturnedToPlayer = function (args) {
        this.diceManager.toggleShowPlayerDice(false);
        this.actionSpaceManager.resetActionSpaceOccupied();
        if (args.playerId == this.getPlayerId()) {
            return this.diceManager.playerDiceStock.addCards(args.dice);
        }
        else {
            return this.diceManager.otherPlayerDiceStock.addCards(args.dice);
        }
    };
    SkyTeam.prototype.notif_victoryConditionsUpdated = function (args) {
        this.victoryConditions.updateVictoryConditions(args.victoryConditions);
    };
    SkyTeam.prototype.notif_planeLanded = function (args) {
        var _this = this;
        return this.endGameInfo.setEndGameInfo(args.victoryConditions).then(function () { return Object.keys(_this.gamedatas.players).forEach(function (playerId) { return _this.setScore(Number(playerId), args.score); }); });
    };
    SkyTeam.prototype.notif_newRoundStarted = function (args) {
        if (args.finalRound) {
            this.setFinalRound();
        }
    };
    SkyTeam.prototype.notif_trafficDieRolled = function (args) {
        var _this = this;
        return this.diceManager.trafficDiceStock.addCard(__assign(__assign({}, args.trafficDie), { side: args.trafficDie.side == 1 ? 6 : 1 }))
            .then(function () { return _this.diceManager.updateDieValue(args.trafficDie); })
            .then(function () { return _this.planeManager.approachTokenStock.addCard(args.planeToken, { fromElement: $(DiceManager.TRAFFIC_DICE) }); });
    };
    SkyTeam.prototype.notif_trafficDiceReturned = function () {
        this.diceManager.trafficDiceStock.removeAll();
    };
    SkyTeam.prototype.notif_planeKeroseneChanged = function (args) {
        return this.planeManager.updateKerosene(args.kerosene);
    };
    SkyTeam.prototype.notif_diceRemoved = function (args) {
        this.actionSpaceManager.removeDice(args.dice);
    };
    SkyTeam.prototype.notif_windChanged = function (args) {
        return this.planeManager.updateWind(args.wind);
    };
    SkyTeam.prototype.format_string_recursive = function (log, args) {
        var _this = this;
        try {
            if (log && args && !args.processed) {
                Object.keys(args).forEach(function (argKey) {
                    if (argKey.startsWith('token_') && typeof args[argKey] == 'string') {
                        args[argKey] = _this.tokenIcon(args[argKey]);
                    }
                    else if (argKey.startsWith('icon_dice') && typeof args[argKey] == 'object') {
                        var diceIcons = args[argKey].map(function (die) { return _this.diceIcon(die); });
                        args[argKey] = diceIcons.join('');
                    }
                    else if (argKey.startsWith('icon_tokens') && typeof args[argKey] == 'object') {
                        var tokenIcons = args[argKey].map(function (token) { return _this.tokenIcon(token.type); });
                        args[argKey] = tokenIcons.join(' ');
                    }
                    else if (argKey.startsWith('icon_plane_marker') && typeof args[argKey] == 'string') {
                        args[argKey] = _this.planeMarkerIcon(args[argKey]);
                    }
                    else if (argKey.startsWith('icon_switch') && typeof args[argKey] == 'number') {
                        args[argKey] = _this.switchIcon();
                    }
                    else if (argKey.startsWith('icon_kerosene_marker') && typeof args[argKey] == 'string') {
                        args[argKey] = _this.keroseneMarkerIcon();
                    }
                });
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return this.inherited(arguments);
    };
    SkyTeam.prototype.updatePlayerOrdering = function () {
        this.inherited(arguments);
        dojo.place("<div id=\"st-victory-conditions-panel\" class=\"player-board st-victory-conditions\" style=\"height: auto;\"></div>", "player_boards", 'first');
        this.victoryConditions = new VictoryConditions(this, 'st-victory-conditions-panel');
        this.victoryConditions.updateVictoryConditions(this.gamedatas.victoryConditions);
    };
    SkyTeam.prototype.formatWithIcons = function (description) {
        //@ts-ignore
        // return bga_format(_(description), {
        //     '_': (t) => this.tokenIcon(t.replace('icon-', ''))
        // });
        return '';
    };
    SkyTeam.prototype.tokenIcon = function (type) {
        return "<span class=\"st-token token small\" data-type=\"".concat(type, "\"></span>");
    };
    SkyTeam.prototype.planeMarkerIcon = function (type) {
        return "<span class=\"st-plane-marker token small\" data-type=\"".concat(type, "\"></span>");
    };
    SkyTeam.prototype.switchIcon = function () {
        return "<span class=\"st-plane-switch small\"></span>";
    };
    SkyTeam.prototype.keroseneMarkerIcon = function () {
        return "<span class=\"st-kerosene-marker small\"></span>";
    };
    SkyTeam.prototype.diceIcon = function (die, additionalStyle) {
        if (additionalStyle === void 0) { additionalStyle = ''; }
        return "<span class=\"st-dice small\" data-type=\"".concat(die.typeArg, "\" data-value=\"").concat(die.side, "\" style=\"").concat(additionalStyle, "\">\n                    <span class=\"side\" data-side=\"1\"></span>\n                    <span class=\"side\" data-side=\"2\"></span>\n                    <span class=\"side\" data-side=\"3\"></span>\n                    <span class=\"side\" data-side=\"4\"></span>\n                    <span class=\"side\" data-side=\"5\"></span>\n                    <span class=\"side\" data-side=\"6\"></span>\n               </span>");
    };
    return SkyTeam;
}());
