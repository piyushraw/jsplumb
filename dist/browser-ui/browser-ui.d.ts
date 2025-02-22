/**
 * This package is a renderer for the jsPlumb Community edition that uses a single SVG element per connection, and can
 * connect HTML/SVG elements in the DOM.  For users of version of jsPlumb prior to 5.x, this package is the equivalent to
 * what used to just be known as "jsPlumb".
 *
 * In actual fact only this renderer exists for the 5.x Community edition, but the code in 5.x is now architected in such a way
 * that alternative renderers could be implemented.
 *
 * @packageDocumentation
 */

import { AbstractConnector } from '@jsplumb/core';
import { BehaviouralTypeDescriptor } from '@jsplumb/core';
import { BoundingBox } from '@jsplumb/util';
import { Component } from '@jsplumb/core';
import { Connection } from '@jsplumb/core';
import { DeleteConnectionOptions } from '@jsplumb/core';
import { Dictionary } from '@jsplumb/util';
import { Endpoint } from '@jsplumb/core';
import { Extents } from '@jsplumb/util';
import { Grid } from '@jsplumb/util';
import { JsPlumbDefaults } from '@jsplumb/core';
import { jsPlumbElement } from '@jsplumb/core';
import { JsPlumbInstance } from '@jsplumb/core';
import { LabelOverlay } from '@jsplumb/core';
import { Overlay } from '@jsplumb/core';
import { PaintStyle } from '@jsplumb/common';
import { PointXY } from '@jsplumb/util';
import { RedrawResult } from '@jsplumb/core';
import { Size } from '@jsplumb/util';
import { SourceSelector } from '@jsplumb/core';
import { TypeDescriptor } from '@jsplumb/core';
import { UIGroup } from '@jsplumb/core';

export declare function addClass(el: Element | NodeListOf<Element>, clazz: string): void;

/**
 * @public
 */
export declare const ATTRIBUTE_CONTAINER = "data-jtk-container";

/**
 * @public
 */
export declare const ATTRIBUTE_GROUP_CONTENT = "data-jtk-group-content";

/**
 * @public
 */
export declare const ATTRIBUTE_JTK_ENABLED = "data-jtk-enabled";

/**
 * @public
 */
export declare const ATTRIBUTE_JTK_SCOPE = "data-jtk-scope";

declare abstract class Base {
    protected el: jsPlumbDOMElement;
    protected k: Collicat;
    abstract _class: string;
    uuid: string;
    private enabled;
    scopes: Array<string>;
    protected constructor(el: jsPlumbDOMElement, k: Collicat);
    setEnabled(e: boolean): void;
    isEnabled(): boolean;
    toggleEnabled(): void;
    addScope(scopes: string): void;
    removeScope(scopes: string): void;
    toggleScope(scopes: string): void;
}

export declare interface BeforeStartEventParams extends DragStartEventParams {
}

export declare interface BrowserJsPlumbDefaults extends JsPlumbDefaults<Element> {
    /**
     * Whether or not elements should be draggable. Default value is `true`.
     */
    elementsDraggable?: boolean;
    /**
     * Options for dragging - containment, grid, callbacks etc.
     */
    dragOptions?: DragOptions;
    managedElementsSelector?: string;
}

/**
 * JsPlumbInstance that renders to the DOM in a browser, and supports dragging of elements/connections.
 *
 */
export declare class BrowserJsPlumbInstance extends JsPlumbInstance<ElementType> {
    _instanceIndex: number;
    private dragSelection;
    dragManager: DragManager;
    _connectorClick: Function;
    _connectorDblClick: Function;
    _connectorTap: Function;
    _connectorDblTap: Function;
    _endpointClick: Function;
    _endpointDblClick: Function;
    _overlayClick: Function;
    _overlayDblClick: Function;
    _overlayTap: Function;
    _overlayDblTap: Function;
    _connectorMouseover: Function;
    _connectorMouseout: Function;
    _endpointMouseover: Function;
    _endpointMouseout: Function;
    _overlayMouseover: Function;
    _overlayMouseout: Function;
    _elementClick: Function;
    _elementTap: Function;
    _elementDblTap: Function;
    _elementMouseenter: Function;
    _elementMouseexit: Function;
    eventManager: EventManager;
    draggingClass: string;
    elementDraggingClass: string;
    hoverClass: string;
    sourceElementDraggingClass: string;
    targetElementDraggingClass: string;
    hoverSourceClass: string;
    hoverTargetClass: string;
    dragSelectClass: string;
    managedElementsSelector: string;
    /**
     * Whether or not elements should be draggable. This can be provided in the constructor arguments, or simply toggled on the
     * class. The default value is `true`.
     */
    elementsDraggable: boolean;
    private elementDragHandler;
    private groupDragOptions;
    private elementDragOptions;
    constructor(_instanceIndex: number, defaults?: BrowserJsPlumbDefaults);
    private fireOverlayMethod;
    /**
     * Adds a filter to the list of filters used to determine whether or not a given event should start an element drag.
     * @param filter CSS3 selector, or function that takes an element and returns true/false
     * @param exclude If true, the filter is inverted: anything _but_ this value.
     */
    addDragFilter(filter: Function | string, exclude?: boolean): void;
    /**
     * Removes a filter from the list of filters used to determine whether or not a given event should start an element drag.
     * @param filter CSS3 selector, or function that takes an element and returns true/false
     */
    removeDragFilter(filter: Function | string): void;
    /**
     * Sets the grid that should be used when dragging elements.
     * @param grid [x, y] grid.
     */
    setDragGrid(grid: Grid): void;
    _removeElement(element: Element): void;
    _appendElement(el: Element, parent: Element): void;
    _getAssociatedElements(el: Element): Array<Element>;
    shouldFireEvent(event: string, value: any, originalEvent?: Event): boolean;
    getClass(el: Element): string;
    /**
     * Add one or more classes to the given element or list of elements.
     * @param el Element, or list of elements to which to add the class(es)
     * @param clazz A space separated list of classes to add.
     */
    addClass(el: Element | NodeListOf<Element>, clazz: string): void;
    /**
     * Returns whether or not the given element has the given class.
     * @param el
     * @param clazz
     */
    hasClass(el: Element, clazz: string): boolean;
    /**
     * Remove one or more classes from the given element or list of elements.
     * @param el Element, or list of elements from which to remove the class(es)
     * @param clazz A space separated list of classes to remove.
     */
    removeClass(el: Element | NodeListOf<Element>, clazz: string): void;
    /**
     * Toggles one or more classes on the given element or list of elements.
     * @param el Element, or list of elements on which to toggle the class(es)
     * @param clazz A space separated list of classes to toggle.
     */
    toggleClass(el: Element | NodeListOf<Element>, clazz: string): void;
    setAttribute(el: Element, name: string, value: string): void;
    getAttribute(el: Element, name: string): string;
    setAttributes(el: Element, atts: Dictionary<string>): void;
    removeAttribute(el: Element, attName: string): void;
    /**
     * Bind an event listener to the given element or elements.
     * @param el Element, or elements, to bind the event listener to.
     * @param event Name of the event to bind to.
     * @param callbackOrSelector Either a callback function, or a CSS 3 selector. When this is a selector the event listener is bound as a "delegate", ie. the event listeners
     * listens to events on children of the given `el` that match the selector.
     * @param callback Callback function for event. Only supplied when you're binding a delegated event handler.
     */
    on(el: Document | Element | NodeListOf<Element>, event: string, callbackOrSelector: Function | string, callback?: Function): this;
    /**
     * Remove an event binding from the given element or elements.
     * @param el Element, or elements, from which to remove the event binding.
     * @param event Name of the event to unbind.
     * @param callback The function you wish to unbind.
     */
    off(el: Document | Element | NodeListOf<Element>, event: string, callback: Function): this;
    /**
     * Trigger an event on the given element.
     * @param el Element to trigger the event on.
     * @param event Name of the event to trigger.
     * @param originalEvent Optional event that gave rise to this method being called.
     * @param payload Optional `payload` to set on the Event that is created.
     */
    trigger(el: Document | Element, event: string, originalEvent?: Event, payload?: any, detail?: number): void;
    getOffsetRelativeToRoot(el: Element): PointXY;
    getOffset(el: Element): PointXY;
    getSize(el: Element): Size;
    getStyle(el: Element, prop: string): any;
    getGroupContentArea(group: UIGroup<any>): ElementType["E"];
    getSelector(ctx: string | Element, spec?: string): ArrayLike<jsPlumbDOMElement>;
    /**
     * Sets the position of the given element.
     * @param el Element to change position for
     * @param p New location for the element.
     */
    setPosition(el: Element, p: PointXY): void;
    setDraggable(element: Element, draggable: boolean): void;
    isDraggable(el: Element): boolean;
    toggleDraggable(el: Element): boolean;
    private _attachEventDelegates;
    private _detachEventDelegates;
    setContainer(newContainer: Element): void;
    reset(): void;
    destroy(): void;
    unmanage(el: Element, removeElement?: boolean): void;
    addToDragSelection(...el: Array<Element>): void;
    clearDragSelection(): void;
    removeFromDragSelection(...el: Array<Element>): void;
    toggleDragSelection(...el: Array<Element>): void;
    /**
     * Adds the given element(s) to the given drag group.
     * @param spec Either the ID of some drag group, in which case the elements are all added as 'active', or an object of the form
     * { id:"someId", active:boolean }. In the latter case, `active`, if true, which is the default, indicates whether
     * dragging the given element(s) should cause all the elements in the drag group to be dragged. If `active` is false it means the
     * given element(s) is "passive" and should only move when an active member of the drag group is dragged.
     * @param els Elements to add to the drag group.
     */
    addToDragGroup(spec: DragGroupSpec, ...els: Array<Element>): void;
    /**
     * Removes the given element(s) from any drag group they may be in. You don't need to supply the drag group id, as elements
     * can only be in one drag group anyway.
     * @param els Elements to remove from drag groups.
     */
    removeFromDragGroup(...els: Array<Element>): void;
    /**
     * Sets the active/passive state for the given element(s).You don't need to supply the drag group id, as elements
     * can only be in one drag group anyway.
     * @param state true for active, false for passive.
     * @param els
     */
    setDragGroupState(state: boolean, ...els: Array<Element>): void;
    /**
     * Consumes the given event.
     * @param e
     * @param doNotPreventDefault
     */
    consume(e: Event, doNotPreventDefault?: boolean): void;
    rotate(element: Element, rotation: number, doNotRepaint?: boolean): RedrawResult;
    svg: {
        node: (name: string, attributes?: Dictionary<string | number>) => SVGElement;
        attr: (node: SVGElement, attributes: Dictionary<string | number>) => void;
        pos: (d: [number, number]) => string;
    };
    addOverlayClass(o: Overlay, clazz: string): void;
    removeOverlayClass(o: Overlay, clazz: string): void;
    paintOverlay(o: Overlay, params: any, extents: any): void;
    setOverlayVisible(o: Overlay, visible: boolean): void;
    reattachOverlay(o: Overlay, c: Component): void;
    setOverlayHover(o: Overlay, hover: boolean): void;
    destroyOverlay(o: Overlay): void;
    drawOverlay(o: Overlay, component: any, paintStyle: PaintStyle, absolutePosition?: PointXY): any;
    updateLabel(o: LabelOverlay): void;
    setHover(component: Component, hover: boolean): void;
    paintConnector(connector: AbstractConnector, paintStyle: PaintStyle, extents?: Extents): void;
    setConnectorHover(connector: AbstractConnector, h: boolean, doNotCascade?: boolean): void;
    destroyConnector(connection: Connection): void;
    addConnectorClass(connector: AbstractConnector, clazz: string): void;
    removeConnectorClass(connector: AbstractConnector, clazz: string): void;
    getConnectorClass(connector: AbstractConnector): string;
    setConnectorVisible(connector: AbstractConnector, v: boolean): void;
    applyConnectorType(connector: AbstractConnector, t: TypeDescriptor): void;
    addEndpointClass(ep: Endpoint, c: string): void;
    applyEndpointType<C>(ep: Endpoint, t: TypeDescriptor): void;
    destroyEndpoint(ep: Endpoint): void;
    renderEndpoint(ep: Endpoint, paintStyle: PaintStyle): void;
    removeEndpointClass(ep: Endpoint, c: string): void;
    getEndpointClass(ep: Endpoint): string;
    setEndpointHover(endpoint: Endpoint, h: boolean, doNotCascade?: boolean): void;
    setEndpointVisible(ep: Endpoint, v: boolean): void;
    setGroupVisible(group: UIGroup<Element>, state: boolean): void;
    deleteConnection(connection: Connection, params?: DeleteConnectionOptions): boolean;
    addSourceSelector(selector: string, params?: BehaviouralTypeDescriptor, exclude?: boolean): SourceSelector;
    removeSourceSelector(selector: SourceSelector): void;
}

export declare class Collicat implements jsPlumbDragManager {
    eventManager: EventManager;
    private zoom;
    css: Dictionary<string>;
    inputFilterSelector: string;
    constructor(options?: CollicatOptions);
    getZoom(): number;
    setZoom(z: number): void;
    private _prepareParams;
    /**
     * Gets the selector identifying which input elements to filter from drag events.
     * @returns Current input filter selector.
     */
    getInputFilterSelector(): string;
    /**
     * Sets the selector identifying which input elements to filter from drag events.
     * @param selector Input filter selector to set.
     * @returns Current instance; method may be chained.
     */
    setInputFilterSelector(selector: string): this;
    draggable(el: jsPlumbDOMElement, params: DragParams): Drag;
    destroyDraggable(el: jsPlumbDOMElement): void;
}

export declare interface CollicatOptions {
    zoom?: number;
    css?: Dictionary<string>;
    inputFilterSelector?: string;
}

export declare function compoundEvent(stem: string, event: string, subevent?: string): string;

/**
 * @public
 */
export declare const CONNECTION = "connection";

export declare type ConstrainFunction = (desiredLoc: PointXY, dragEl: HTMLElement, constrainRect: Size, size: Size) => PointXY;

export declare function consume(e: Event, doNotPreventDefault?: boolean): void;

export declare enum ContainmentType {
    notNegative = "notNegative",
    parent = "parent",
    parentEnclosed = "parentEnclosed"
}

export declare function createElement(tag: string, style?: Dictionary<any>, clazz?: string, atts?: Dictionary<string>): jsPlumbDOMElement;

export declare function createElementNS(ns: string, tag: string, style?: Dictionary<any>, clazz?: string, atts?: Dictionary<string | number>): jsPlumbDOMElement;

export declare class Drag extends Base {
    _class: string;
    rightButtonCanDrag: boolean;
    consumeStartEvent: boolean;
    clone: boolean;
    scroll: boolean;
    trackScroll: boolean;
    private _downAt;
    private _posAtDown;
    private _pagePosAtDown;
    private _pageDelta;
    private _moving;
    private _lastPosition;
    private _lastScrollValues;
    private _initialScroll;
    _size: Size;
    private _currentParentPosition;
    private _ghostParentPosition;
    private _dragEl;
    private _multipleDrop;
    private _ghostProxyOffsets;
    private _ghostDx;
    private _ghostDy;
    _isConstrained: boolean;
    _ghostProxyParent: jsPlumbDOMElement;
    _useGhostProxy: Function;
    _ghostProxyFunction: GhostProxyGenerator;
    _activeSelectorParams: DragParams;
    _availableSelectors: Array<DragParams>;
    _canDrag: Function;
    private _consumeFilteredEvents;
    private _parent;
    private _ignoreZoom;
    _filters: Dictionary<[Function, boolean]>;
    _constrainRect: {
        w: number;
        h: number;
    };
    _elementToDrag: jsPlumbDOMElement;
    downListener: (e: MouseEvent) => void;
    moveListener: (e: MouseEvent) => void;
    upListener: (e?: MouseEvent) => void;
    listeners: Dictionary<Array<Function>>;
    constructor(el: jsPlumbDOMElement, params: DragParams, k: Collicat);
    on(evt: string, fn: Function): void;
    off(evt: string, fn: Function): void;
    private _upListener;
    private _downListener;
    private _moveListener;
    private mark;
    private unmark;
    moveBy(dx: number, dy: number, e?: MouseEvent): void;
    abort(): void;
    getDragElement(retrieveOriginalElement?: boolean): jsPlumbDOMElement;
    stop(e?: MouseEvent, force?: boolean): void;
    private _dispatch;
    private resolveGrid;
    /**
     * Snap the given position to a grid, if the active selector has declared a grid.
     * @param pos
     */
    private toGrid;
    setUseGhostProxy(val: boolean): void;
    private _doConstrain;
    _testFilter(e: any): boolean;
    addFilter(f: Function | string, _exclude?: boolean): void;
    removeFilter(f: Function | string): void;
    clearAllFilters(): void;
    addSelector(params: DragHandlerOptions, atStart?: boolean): void;
    destroy(): void;
}

export declare interface DragEventParams extends DragStartEventParams {
    originalPos: PointXY;
}

export declare type DraggedElement = {
    el: jsPlumbDOMElement;
    id: string;
    pos: PointXY;
    originalPos: PointXY;
    originalGroup: UIGroup;
    redrawResult: RedrawResult;
    reverted: boolean;
    dropGroup: UIGroup;
};

export declare type DragGroupSpec = string | {
    id: string;
    active: boolean;
};

declare interface DragHandler {
    selector: string;
    onStart: (params: DragStartEventParams) => boolean;
    onDrag: (params: DragEventParams) => void;
    onStop: (params: DragStopEventParams) => void;
    onDragInit: (el: Element) => Element;
    onDragAbort: (el: Element) => void;
    reset: () => void;
    init: (drag: Drag) => void;
    onBeforeStart?: (beforeStartParams: BeforeStartEventParams) => void;
}

export declare interface DragHandlerOptions {
    selector?: string;
    start?: (p: DragStartEventParams) => any;
    stop?: (p: DragStopEventParams) => any;
    drag?: (p: DragEventParams) => any;
    beforeStart?: (beforeStartParams: BeforeStartEventParams) => void;
    dragInit?: (el: Element) => any;
    dragAbort?: (el: Element) => any;
    ghostProxy?: GhostProxyGenerator | boolean;
    makeGhostProxy?: GhostProxyGenerator;
    useGhostProxy?: (container: any, dragEl: jsPlumbDOMElement) => boolean;
    ghostProxyParent?: Element;
    constrainFunction?: ConstrainFunction | boolean;
    revertFunction?: RevertFunction;
    filter?: string;
    filterExclude?: boolean;
    snapThreshold?: number;
    grid?: Grid;
    containment?: ContainmentType;
    containmentPadding?: number;
}

declare class DragManager {
    protected instance: BrowserJsPlumbInstance;
    protected dragSelection: DragSelection;
    private collicat;
    private drag;
    _draggables: Dictionary<any>;
    _dlist: Array<any>;
    _elementsWithEndpoints: Dictionary<any>;
    _draggablesForElements: Dictionary<any>;
    handlers: Array<{
        handler: DragHandler;
        options: DragHandlerOptions;
    }>;
    private _trackScroll;
    private _filtersToAdd;
    constructor(instance: BrowserJsPlumbInstance, dragSelection: DragSelection, options?: DragManagerOptions);
    addHandler(handler: DragHandler, dragOptions?: DragHandlerOptions): void;
    addFilter(filter: Function | string, exclude?: boolean): void;
    removeFilter(filter: Function | string): void;
    setFilters(filters: Array<[string, boolean]>): void;
    reset(): Array<[string, boolean]>;
    setOption(handler: DragHandler, options: DragHandlerOptions): void;
}

declare interface DragManagerOptions {
    trackScroll?: boolean;
}

/**
 * Payload for `drag:move` event.
 */
export declare interface DragMovePayload extends DragPayload {
}

export declare interface DragOptions {
    containment?: ContainmentType;
    start?: (params: DragStartEventParams) => void;
    drag?: (params: DragEventParams) => void;
    stop?: (params: DragStopEventParams) => void;
    beforeStart?: (params: BeforeStartEventParams) => void;
    cursor?: string;
    zIndex?: number;
    grid?: Grid;
    trackScroll?: boolean;
}

export declare interface DragParams extends DragHandlerOptions {
    rightButtonCanDrag?: boolean;
    consumeStartEvent?: boolean;
    clone?: boolean;
    scroll?: boolean;
    trackScroll?: boolean;
    multipleDrop?: boolean;
    canDrag?: Function;
    consumeFilteredEvents?: boolean;
    events?: Dictionary<Function>;
    parent?: any;
    ignoreZoom?: boolean;
    scope?: string;
}

/**
 * Base payload for drag events. Contains the element being dragged, the corresponding mouse event, the current position, and the position when drag started.
 */
export declare interface DragPayload {
    el: Element;
    e: Event;
    pos: PointXY;
    originalPosition: PointXY;
    payload?: Record<string, any>;
}

declare class DragSelection {
    private instance;
    private _dragSelection;
    private _dragSizes;
    private _dragElements;
    private _dragElementStartPositions;
    private _dragElementPositions;
    private __activeSet;
    private readonly _activeSet;
    constructor(instance: BrowserJsPlumbInstance);
    readonly length: number;
    filterActiveSet(fn: (p: {
        id: string;
        jel: jsPlumbDOMElement;
    }) => boolean): void;
    /**
     * Reset all computed values and remove all elements from the selection.
     */
    clear(): void;
    /**
     * Reset all computed values. Does not remove elements from the selection. Use `clear()` for that. This method is intended for
     * use after (or before) a drag.
     * @internal
     */
    reset(): void;
    initialisePositions(): void;
    updatePositions(currentPosition: PointXY, originalPosition: PointXY, callback: (el: jsPlumbDOMElement, id: string, s: Size, b: BoundingBox) => any): void;
    /**
     * Iterate through the contents of the drag selection and execute the given function on each entry.
     * @param f
     */
    each(f: (el: jsPlumbDOMElement, id: string, o: PointXY, s: Size, originalPosition: PointXY) => any): void;
    add(el: Element, id?: string): void;
    remove(el: Element): void;
    toggle(el: Element): void;
}

export declare interface DragStartEventParams {
    e: MouseEvent;
    el: jsPlumbDOMElement;
    pos: PointXY;
    drag: Drag;
    size: Size;
}

/**
 * Payload for `drag:start` event.
 */
export declare interface DragStartPayload extends DragPayload {
}

export declare interface DragStopEventParams extends DragEventParams {
    finalPos: PointXY;
    selection: Array<[jsPlumbDOMElement, PointXY, Drag, Size]>;
}

/**
 * Payload for `drag:stop` event. In addition to the base payload, contains a redraw result object, listing all the connections and endpoints that were affected by the drag.
 */
export declare interface DragStopPayload {
    elements: Array<DraggedElement>;
    e: Event;
    el: Element;
    payload?: Record<string, any>;
}

/**
 * @public
 */
export declare const ELEMENT = "element";

/**
 * @public
 */
export declare const ELEMENT_DIV = "div";

export declare class ElementDragHandler implements DragHandler {
    protected instance: BrowserJsPlumbInstance;
    protected _dragSelection: DragSelection;
    selector: string;
    private _dragOffset;
    private _groupLocations;
    protected _intersectingGroups: Array<IntersectingGroup>;
    private _currentDragParentGroup;
    private _dragGroupByElementIdMap;
    private _dragGroupMap;
    private _currentDragGroup;
    private _currentDragGroupOffsets;
    private _currentDragGroupSizes;
    private _dragPayload;
    protected drag: Drag;
    originalPosition: PointXY;
    constructor(instance: BrowserJsPlumbInstance, _dragSelection: DragSelection);
    onDragInit(el: Element): Element;
    onDragAbort(el: Element): void;
    protected getDropGroup(): IntersectingGroup | null;
    onStop(params: DragStopEventParams): void;
    private _cleanup;
    reset(): void;
    init(drag: Drag): void;
    onDrag(params: DragEventParams): void;
    onStart(params: {
        e: MouseEvent;
        el: jsPlumbDOMElement;
        pos: PointXY;
        drag: Drag;
    }): boolean;
    addToDragGroup(spec: DragGroupSpec, ...els: Array<Element>): void;
    removeFromDragGroup(...els: Array<Element>): void;
    setDragGroupState(state: boolean, ...els: Array<Element>): void;
    /**
     * Perhaps prune or orphan the element represented by the given drag params.
     * @param params
     * @param doNotTransferToAncestor Used when dealing with nested groups. When true, it means remove the element from any groups; when false, which is
     * the default, elements that are orphaned will be added to this group's ancestor, if it has one.
     * @param isDefinitelyNotInsideParent Used internally when this method is called and we've already done an intersections test. This flag saves us repeating the calculation.
     * @internal
     */
    private _pruneOrOrphan;
}

export declare type ElementType = {
    E: Element;
};

/**
 * @public
 */
export declare const ENDPOINT = "endpoint";

export declare type EndpointHelperFunctions<E> = {
    makeNode: (ep: E, paintStyle: PaintStyle) => void;
    updateNode: (ep: E, node: SVGElement) => void;
};

export declare const EVENT_BEFORE_START = "beforeStart";

/**
 * @public
 */
export declare const EVENT_CLICK = "click";

/**
 * @public
 */
export declare const EVENT_CONNECTION_ABORT = "connection:abort";

/**
 * @public
 */
export declare const EVENT_CONNECTION_CLICK: string;

/**
 * @public
 */
export declare const EVENT_CONNECTION_DBL_CLICK: string;

/**
 * @public
 */
export declare const EVENT_CONNECTION_DBL_TAP: string;

/**
 * @public
 */
export declare const EVENT_CONNECTION_DRAG = "connection:drag";

/**
 * @public
 */
export declare const EVENT_CONNECTION_MOUSEOUT: string;

/**
 * @public
 */
export declare const EVENT_CONNECTION_MOUSEOVER: string;

/**
 * @public
 */
export declare const EVENT_CONNECTION_TAP: string;

/**
 * @public
 */
export declare const EVENT_CONTEXTMENU = "contextmenu";

/**
 * @public
 */
export declare const EVENT_DBL_CLICK = "dblclick";

/**
 * @public
 */
export declare const EVENT_DBL_TAP = "dbltap";

export declare const EVENT_DRAG = "drag";

/**
 * @public
 */
export declare const EVENT_DRAG_MOVE = "drag:move";

/**
 * @public
 */
export declare const EVENT_DRAG_START = "drag:start";

/**
 * @public
 */
export declare const EVENT_DRAG_STOP = "drag:stop";

export declare const EVENT_DROP = "drop";

/**
 * @public
 */
export declare const EVENT_ELEMENT_CLICK: string;

/**
 * @public
 */
export declare const EVENT_ELEMENT_DBL_CLICK: string;

/**
 * @public
 */
export declare const EVENT_ELEMENT_DBL_TAP: string;

/**
 * @public
 */
export declare const EVENT_ELEMENT_MOUSE_OUT: string;

/**
 * @public
 */
export declare const EVENT_ELEMENT_MOUSE_OVER: string;

/**
 * @public
 */
export declare const EVENT_ELEMENT_TAP: string;

/**
 * @public
 */
export declare const EVENT_ENDPOINT_CLICK: string;

/**
 * @public
 */
export declare const EVENT_ENDPOINT_DBL_CLICK: string;

/**
 * @public
 */
export declare const EVENT_ENDPOINT_DBL_TAP: string;

/**
 * @public
 */
export declare const EVENT_ENDPOINT_MOUSEOUT: string;

/**
 * @public
 */
export declare const EVENT_ENDPOINT_MOUSEOVER: string;

/**
 * @public
 */
export declare const EVENT_ENDPOINT_TAP: string;

/**
 * @public
 */
export declare const EVENT_FOCUS = "focus";

/**
 * @public
 */
export declare const EVENT_MOUSEDOWN = "mousedown";

/**
 * @public
 */
export declare const EVENT_MOUSEENTER = "mouseenter";

/**
 * @public
 */
export declare const EVENT_MOUSEEXIT = "mouseexit";

/**
 * @public
 */
export declare const EVENT_MOUSEMOVE = "mousemove";

/**
 * @public
 */
export declare const EVENT_MOUSEOUT = "mouseout";

/**
 * @public
 */
export declare const EVENT_MOUSEOVER = "mouseover";

/**
 * @public
 */
export declare const EVENT_MOUSEUP = "mouseup";

export declare const EVENT_OUT = "out";

export declare const EVENT_OVER = "over";

/**
 * @public
 */
export declare const EVENT_REVERT = "revert";

export declare const EVENT_START = "start";

export declare const EVENT_STOP = "stop";

/**
 * @public
 */
export declare const EVENT_TAP = "tap";

export declare class EventManager {
    clickThreshold: number;
    dblClickThreshold: number;
    private readonly tapHandler;
    private readonly mouseEnterExitHandler;
    constructor(params?: EventManagerOptions);
    private _doBind;
    on(el: any, event: string, children?: string | Function, fn?: Function, options?: {
        passive?: boolean;
        capture?: boolean;
        once?: boolean;
    }): this;
    off(el: any, event: string, fn: any): this;
    trigger(el: any, event: string, originalEvent: any, payload?: any, detail?: number): this;
}

declare interface EventManagerOptions {
    clickThreshold?: number;
    dblClickThreshold?: number;
}

export declare function findParent(el: jsPlumbDOMElement, selector: string, container: HTMLElement, matchOnElementAlso: boolean): jsPlumbDOMElement;

export declare function getClass(el: Element): string;

export declare function getEventSource(e: Event): jsPlumbDOMElement;

export declare function getPositionOnElement(evt: Event, el: Element, zoom: number): PointXY;

export declare function getTouch(touches: TouchList, idx: number): Touch;

export declare type GhostProxyGenerator = (el: Element) => Element;

export declare function groupDragConstrain(desiredLoc: PointXY, dragEl: jsPlumbDOMElement, constrainRect: BoundingBox, size: Size): PointXY;

export declare type GroupLocation = {
    el: Element;
    r: BoundingBox;
    group: UIGroup<Element>;
};

export declare function hasClass(el: Element, clazz: string): boolean;

export declare type IntersectingGroup = {
    groupLoc: GroupLocation;
    d: number;
    intersectingElement: Element;
};

export declare function isArrayLike(el: any): el is ArrayLike<Element>;

export declare function isInsideParent(instance: BrowserJsPlumbInstance, _el: HTMLElement, pos: PointXY): boolean;

export declare function isNodeList(el: any): el is NodeListOf<Element>;

export declare interface jsPlumbDOMElement extends HTMLElement, jsPlumbElement<Element> {
    _isJsPlumbGroup: boolean;
    _jsPlumbOrphanedEndpoints: Array<Endpoint>;
    offsetParent: jsPlumbDOMElement;
    parentNode: jsPlumbDOMElement;
    jtk: jsPlumbDOMInformation;
    _jsPlumbScrollHandler?: Function;
    _katavorioDrag?: Drag;
    cloneNode: (deep?: boolean) => jsPlumbDOMElement;
}

export declare interface jsPlumbDOMInformation {
    connector?: AbstractConnector;
    endpoint?: Endpoint;
    overlay?: Overlay;
}

export declare interface jsPlumbDragManager {
    getZoom(): number;
    setZoom(z: number): void;
    getInputFilterSelector(): string;
    setInputFilterSelector(selector: string): void;
    draggable(el: jsPlumbDOMElement, params: DragParams): Drag;
    destroyDraggable(el: jsPlumbDOMElement): void;
}

export declare function matchesSelector(el: jsPlumbDOMElement, selector: string, ctx?: Element): boolean;

export declare function newInstance(defaults?: BrowserJsPlumbDefaults): BrowserJsPlumbInstance;

export declare function offsetRelativeToRoot(el: Element): PointXY;

export declare function pageLocation(e: Event): PointXY;

/**
 * @public
 */
export declare const PROPERTY_POSITION = "position";

export declare function ready(f: Function): void;

export declare function registerEndpointRenderer<C>(name: string, fns: EndpointHelperFunctions<C>): void;

export declare function removeClass(el: Element | NodeListOf<Element>, clazz: string): void;

export declare type RevertEventParams = jsPlumbDOMElement;

export declare type RevertFunction = (dragEl: HTMLElement, pos: PointXY) => boolean;

/**
 * @public
 */
export declare const SELECTOR_CONNECTOR: string;

/**
 * @public
 */
export declare const SELECTOR_ENDPOINT: string;

/**
 * @public
 */
export declare const SELECTOR_GROUP: string;

/**
 * @public
 */
export declare const SELECTOR_GROUP_CONTAINER: string;

/**
 * @public
 */
export declare const SELECTOR_OVERLAY: string;

export declare function size(el: Element): Size;

export declare function toggleClass(el: Element | NodeListOf<Element>, clazz: string): void;

export declare function touchCount(e: Event): number;

export declare function touches(e: any): TouchList;

export declare interface UIComponent {
    canvas: HTMLElement;
    svg: SVGElement;
}

export { }
