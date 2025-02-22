import {
    JsPlumbDefaults,
    TypeDescriptor,
    JsPlumbInstance,
    AbstractConnector,
    Endpoint,
    Overlay,
    RedrawResult,
    ATTRIBUTE_NOT_DRAGGABLE,
    SELECTOR_MANAGED_ELEMENT,
    CLASS_OVERLAY,
    ATTRIBUTE_MANAGED,
    ABSOLUTE,
    FIXED,
    STATIC,
    isArrowOverlay,
    isPlainArrowOverlay,
    LabelOverlay,
    isLabelOverlay,
    isDiamondOverlay,
    Connection,
    EndpointRepresentation,
    Component,
    CustomOverlay,
    isCustomOverlay,
    DeleteConnectionOptions,
    BehaviouralTypeDescriptor,
    SourceSelector,
    OverlayMouseEventParams,
    UIGroup,
    CLASS_CONNECTOR,
    CLASS_ENDPOINT
} from '@jsplumb/core'

import {
    forEach,
    fromArray,
    log,
    isFunction,
    isString,
    uuid,
    PointXY,
    Dictionary,
    Size,
    BoundingBox,
    Extents, Grid
} from "@jsplumb/util"

import { TRUE,
    FALSE,
    UNDEFINED,
    PaintStyle} from "@jsplumb/common"

import { _attr,
    _node,
    ElementAttributes,
    _pos} from './svg-util'

import {DragManager} from "./drag-manager"
import {ElementDragHandler} from "./element-drag-handler"
import {EndpointDragHandler} from "./endpoint-drag-handler"
import {GroupDragHandler} from "./group-drag-handler"
import { jsPlumbDOMElement} from './element-facade'
import {
    addClass,
    consume,
    findParent,
    getClass,
    getEventSource,
    hasClass, isNodeList, offsetRelativeToRoot,
    removeClass, size,
    toggleClass
} from "./browser-util"
import {EventManager, pageLocation} from "./event-manager"

import {
    DragHandlerOptions,
    DragStartEventParams,
    DragEventParams,
    DragStopEventParams,
    ContainmentType,
    BeforeStartEventParams
} from './collicat'

import {HTMLElementOverlay} from "./html-element-overlay"
import {SVGElementOverlay} from "./svg-element-overlay"
import {paintSvgConnector} from "./svg-element-connector"
import {SvgEndpoint} from "./svg-element-endpoint"
import {
    ATTRIBUTE_CONTAINER,
    EVENT_CONNECTION_MOUSEOUT,
    EVENT_CONNECTION_MOUSEOVER,
    EVENT_DBL_CLICK,
    EVENT_DBL_TAP,
    EVENT_ELEMENT_CLICK,
    EVENT_ELEMENT_DBL_TAP,
    EVENT_ELEMENT_MOUSE_OUT,
    EVENT_ELEMENT_MOUSE_OVER,
    EVENT_ELEMENT_TAP,
    EVENT_ENDPOINT_CLICK,
    EVENT_ENDPOINT_DBL_CLICK,
    EVENT_ENDPOINT_MOUSEOUT,
    EVENT_ENDPOINT_MOUSEOVER,
    EVENT_MOUSEOUT,
    EVENT_MOUSEOVER,
    EVENT_TAP,
    EVENT_ELEMENT_DBL_CLICK,
    EVENT_MOUSEENTER,
    EVENT_MOUSEEXIT,
    SELECTOR_ENDPOINT,
    SELECTOR_GROUP_CONTAINER,
    SELECTOR_OVERLAY,
    SELECTOR_CONNECTOR,
    PROPERTY_POSITION,
    EVENT_CONNECTION_CLICK,
    EVENT_CONNECTION_DBL_CLICK,
    EVENT_CONNECTION_DBL_TAP,
    EVENT_CONNECTION_TAP, EVENT_CLICK, ENDPOINT, CONNECTION, compoundEvent
} from "./constants"
import {DragSelection} from "./drag-selection"

export interface UIComponent {
    canvas: HTMLElement
    svg:SVGElement
}

export type EndpointHelperFunctions<E> = {
    makeNode:(ep:E, paintStyle:PaintStyle) => void,
    updateNode: (ep:E, node:SVGElement) => void
}

const endpointMap:Dictionary<EndpointHelperFunctions<any>> = {}
export function registerEndpointRenderer<C>(name:string, fns:EndpointHelperFunctions<C>) {
    endpointMap[name] = fns
}

export function getPositionOnElement(evt:Event, el:Element, zoom:number):PointXY {
    const jel = el as jsPlumbDOMElement
    let box:any = typeof el.getBoundingClientRect !== UNDEFINED ? el.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 },
        body = document.body,
        docElem = document.documentElement,
        scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop,
        scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft,
        clientTop = docElem.clientTop || body.clientTop || 0,
        clientLeft = docElem.clientLeft || body.clientLeft || 0,
        pst = 0,
        psl = 0,
        top = box.top + scrollTop - clientTop + (pst * zoom),
        left = box.left + scrollLeft - clientLeft + (psl * zoom),
        cl = pageLocation(evt),
        w = box.width || (jel.offsetWidth * zoom),
        h = box.height || (jel.offsetHeight * zoom),
        x = (cl.x - left) / w,
        y = (cl.y  - top) / h

    return { x, y }
}

export interface DragOptions {
    containment?: ContainmentType
    start?: (params:DragStartEventParams) => void
    drag?: (params:DragEventParams) => void
    stop?: (params:DragStopEventParams) => void
    beforeStart?:(params:BeforeStartEventParams) => void
    cursor?: string
    zIndex?: number
    grid?:Grid
    trackScroll?:boolean
}

export interface BrowserJsPlumbDefaults extends JsPlumbDefaults<Element> {
    /**
     * Whether or not elements should be draggable. Default value is `true`.
     */
    elementsDraggable?: boolean
    /**
     * Options for dragging - containment, grid, callbacks etc.
     */
    dragOptions?: DragOptions

    managedElementsSelector?:string
}

export interface jsPlumbDOMInformation {
    connector?:AbstractConnector
    endpoint?:Endpoint
    overlay?:Overlay
}

export type ElementType = {E:Element}

function isSVGElementOverlay(o:Overlay): o is SVGElementOverlay {
    return isArrowOverlay(o) || isDiamondOverlay(o) || isPlainArrowOverlay(o)
}

export type DragGroupSpec = string | { id:string, active:boolean }

function setVisible(component: UIComponent, v:boolean) {
    if (component.canvas) {
        component.canvas.style.display = v ? "block" : "none"
    }
}

function cleanup(component: UIComponent) {
    if (component.canvas) {
        component.canvas.parentNode.removeChild(component.canvas)
    }

    delete component.canvas
    delete component.svg
}

function getEndpointCanvas<C>(ep:EndpointRepresentation<C>):any {
    return (ep as any).canvas
}

function getLabelElement(o:LabelOverlay):jsPlumbDOMElement{
    return HTMLElementOverlay.getElement(o as any) as jsPlumbDOMElement
}

function getCustomElement(o:CustomOverlay):jsPlumbDOMElement {
    return HTMLElementOverlay.getElement(o as any, o.component, (c:Component) => {
        const el = o.create(c)
        o.instance.addClass(el, o.instance.overlayClass)
        return el
    }) as jsPlumbDOMElement
}

export function groupDragConstrain (desiredLoc:PointXY, dragEl:jsPlumbDOMElement, constrainRect:BoundingBox, size:Size):PointXY {
    let x = desiredLoc.x, y = desiredLoc.y

    if (dragEl._jsPlumbParentGroup && dragEl._jsPlumbParentGroup.constrain) {
        x = Math.max(desiredLoc.x, 0)
        y = Math.max(desiredLoc.y, 0)
        x = Math.min(x, constrainRect.w - size.w)
        y = Math.min(y, constrainRect.h - size.h)
    }

    return {x, y}
}

// ------------------------------------------------------------------------------------------------------------

/**
 * JsPlumbInstance that renders to the DOM in a browser, and supports dragging of elements/connections.
 *
 */
export class BrowserJsPlumbInstance extends JsPlumbInstance<ElementType> {

    private dragSelection:DragSelection
    dragManager:DragManager
    _connectorClick:Function
    _connectorDblClick:Function
    _connectorTap:Function
    _connectorDblTap:Function

    _endpointClick:Function
    _endpointDblClick:Function

    _overlayClick:Function
    _overlayDblClick:Function
    _overlayTap:Function
    _overlayDblTap:Function

    _connectorMouseover:Function
    _connectorMouseout:Function
    _endpointMouseover:Function
    _endpointMouseout:Function

    _overlayMouseover:Function
    _overlayMouseout:Function

    _elementClick:Function
    _elementTap:Function
    _elementDblTap:Function
    _elementMouseenter:Function
    _elementMouseexit:Function

    eventManager:EventManager

    draggingClass = "jtk-dragging"

    elementDraggingClass = "jtk-element-dragging"
    hoverClass = "jtk-hover"
    sourceElementDraggingClass = "jtk-source-element-dragging"
    targetElementDraggingClass = "jtk-target-element-dragging"

    hoverSourceClass = "jtk-source-hover"
    hoverTargetClass = "jtk-target-hover"

    dragSelectClass = "jtk-drag-select"

    managedElementsSelector:string

    /**
     * Whether or not elements should be draggable. This can be provided in the constructor arguments, or simply toggled on the
     * class. The default value is `true`.
     */
    elementsDraggable:boolean

    private elementDragHandler :ElementDragHandler

    private groupDragOptions:DragHandlerOptions
    private elementDragOptions:DragHandlerOptions

    constructor(public _instanceIndex:number, defaults?:BrowserJsPlumbDefaults) {
        super(_instanceIndex, defaults)


        // by default, elements are draggable
        this.elementsDraggable = defaults && defaults.elementsDraggable !== false

        this.managedElementsSelector = defaults ? (defaults.managedElementsSelector || SELECTOR_MANAGED_ELEMENT) : SELECTOR_MANAGED_ELEMENT

        this.eventManager = new EventManager()
        this.dragSelection = new DragSelection(this)
        this.dragManager = new DragManager(this, this.dragSelection,defaults && defaults.dragOptions ? defaults.dragOptions : null)

        this.dragManager.addHandler(new EndpointDragHandler(this))
        this.groupDragOptions = {
            constrainFunction: groupDragConstrain
        }
        this.dragManager.addHandler(new GroupDragHandler(this, this.dragSelection), this.groupDragOptions)

        this.elementDragHandler = new ElementDragHandler(this, this.dragSelection)

        this.elementDragOptions = (defaults && defaults.dragOptions) || {}

        this.dragManager.addHandler(this.elementDragHandler, this.elementDragOptions)

        // ---

        const _connClick = function(event:string, e:MouseEvent) {
            if (!e.defaultPrevented) {
                let connectorElement = findParent(getEventSource(e), SELECTOR_CONNECTOR, this.getContainer(), true)
                this.fire(event, connectorElement.jtk.connector.connection, e)
            }
        }
        this._connectorClick = _connClick.bind(this, EVENT_CONNECTION_CLICK)
        this._connectorDblClick = _connClick.bind(this, EVENT_CONNECTION_DBL_CLICK)
        this._connectorTap = _connClick.bind(this, EVENT_CONNECTION_TAP)
        this._connectorDblTap = _connClick.bind(this, EVENT_CONNECTION_DBL_TAP)

        const _connectorHover = function(state:boolean, e:MouseEvent) {
            const el = getEventSource(e).parentNode
            if (el.jtk && el.jtk.connector) {
                this.setConnectorHover(el.jtk.connector, state)
                this.fire(state ? EVENT_CONNECTION_MOUSEOVER : EVENT_CONNECTION_MOUSEOUT, el.jtk.connector.connection, e)
            }
        }

        this._connectorMouseover = _connectorHover.bind(this, true)
        this._connectorMouseout = _connectorHover.bind(this, false)

        // ---

        const _epClick = function(event:string, e:MouseEvent, endpointElement:jsPlumbDOMElement) {
            if (!e.defaultPrevented) {
                this.fire(event, endpointElement.jtk.endpoint, e)
            }
        }

        this._endpointClick = _epClick.bind(this, EVENT_ENDPOINT_CLICK)
        this._endpointDblClick = _epClick.bind(this, EVENT_ENDPOINT_DBL_CLICK)

        const _endpointHover = function(state: boolean, e:MouseEvent) {
            const el = getEventSource(e)
            if (el.jtk && el.jtk.endpoint) {
                this.setEndpointHover(el.jtk.endpoint, state)
                this.fire(state ? EVENT_ENDPOINT_MOUSEOVER : EVENT_ENDPOINT_MOUSEOUT, el.jtk.endpoint, e)
            }
        }
        this._endpointMouseover = _endpointHover.bind(this, true)
        this._endpointMouseout = _endpointHover.bind(this, false)

        // ---

        const _oClick = function(method:string, e:MouseEvent) {
            consume(e)
            let overlayElement = findParent(getEventSource(e), SELECTOR_OVERLAY, this.getContainer(), true)
            let overlay = overlayElement.jtk.overlay
            if (overlay) {
                this.fireOverlayMethod(overlay, method, e)
            }
        }.bind(this)

        this._overlayClick = _oClick.bind(this, EVENT_CLICK)
        this._overlayDblClick = _oClick.bind(this, EVENT_DBL_CLICK)
        this._overlayTap = _oClick.bind(this, EVENT_TAP)
        this._overlayDblTap = _oClick.bind(this, EVENT_DBL_TAP)

        const _overlayHover = function(state:boolean, e:MouseEvent) {
            let overlayElement = findParent(getEventSource(e), SELECTOR_OVERLAY, this.getContainer(), true)
            let overlay = overlayElement.jtk.overlay
            if (overlay) {
                this.setOverlayHover(overlay, state)
            }
        }

        this._overlayMouseover = _overlayHover.bind(this, true)
        this._overlayMouseout = _overlayHover.bind(this, false)

        // ---

        const _elementClick = function(event:string, e:MouseEvent, target:HTMLElement) {
            if (!e.defaultPrevented) {
                this.fire(e.detail === 1 ? EVENT_ELEMENT_CLICK : EVENT_ELEMENT_DBL_CLICK, target, e)
            }
        }
        this._elementClick = _elementClick.bind(this, EVENT_ELEMENT_CLICK)

        const _elementTap = function(event:string, e:MouseEvent, target:HTMLElement) {
            if (!e.defaultPrevented) {
                this.fire(EVENT_ELEMENT_TAP, target, e)
            }
        }
        this._elementTap = _elementTap.bind(this, EVENT_ELEMENT_TAP)

        const _elementDblTap = function(event:string, e:MouseEvent, target:HTMLElement) {
            if (!e.defaultPrevented) {
                this.fire(EVENT_ELEMENT_DBL_TAP, target, e)
            }
        }
        this._elementDblTap = _elementDblTap.bind(this, EVENT_ELEMENT_DBL_TAP)

        const _elementHover = function(state:boolean, e:MouseEvent) {
            this.fire(state ? EVENT_ELEMENT_MOUSE_OVER : EVENT_ELEMENT_MOUSE_OUT, getEventSource(e), e)
        }

        this._elementMouseenter = _elementHover.bind(this, true)
        this._elementMouseexit = _elementHover.bind(this, false)

        this._attachEventDelegates()
    }



    private fireOverlayMethod(overlay:Overlay, event:string, e:MouseEvent) {
        const stem = overlay.component instanceof Connection ? CONNECTION : ENDPOINT
        const mappedEvent = compoundEvent(stem, event)
        overlay.fire<OverlayMouseEventParams>(event, { e, overlay })
        this.fire(mappedEvent, overlay.component, e)
    }

    /**
     * Adds a filter to the list of filters used to determine whether or not a given event should start an element drag.
     * @param filter CSS3 selector, or function that takes an element and returns true/false
     * @param exclude If true, the filter is inverted: anything _but_ this value.
     */
    addDragFilter(filter:Function|string, exclude?:boolean) {
        this.dragManager.addFilter(filter, exclude)
    }

    /**
     * Removes a filter from the list of filters used to determine whether or not a given event should start an element drag.
     * @param filter CSS3 selector, or function that takes an element and returns true/false
     */
    removeDragFilter(filter:Function|string) {
        this.dragManager.removeFilter(filter)
    }

    /**
     * Sets the grid that should be used when dragging elements.
     * @param grid [x, y] grid.
     */
    setDragGrid(grid:Grid) {
        this.dragManager.setOption(this.elementDragHandler, {
            grid:grid
        })
    }

    _removeElement(element:Element):void {
        element.parentNode && element.parentNode.removeChild(element)
    }

    _appendElement(el:Element, parent:Element):void {
        if (parent) {
            parent.appendChild(el)
        }
    }

    _getAssociatedElements(el: Element): Array<Element> {
        let a:Array<Element> = []
        if ((el as any).nodeType !== 3 && (el as any).nodeType !== 8) {
            let els = el.querySelectorAll(SELECTOR_MANAGED_ELEMENT)
            Array.prototype.push.apply(a, els)
        }
        return a.filter((_a:Element) => (_a as any).nodeType !== 3 && (_a as any).nodeType !== 8 )
    }

    shouldFireEvent(event: string, value: any, originalEvent?: Event): boolean {
        return true
    }

    getClass(el:Element):string { return getClass(el) }

    /**
     * Add one or more classes to the given element or list of elements.
     * @param el Element, or list of elements to which to add the class(es)
     * @param clazz A space separated list of classes to add.
     */
    addClass(el:Element | NodeListOf<Element>, clazz:string):void {
        addClass(el, clazz)
    }

    /**
     * Returns whether or not the given element has the given class.
     * @param el
     * @param clazz
     */
    hasClass(el:Element, clazz:string):boolean {
        return hasClass(el, clazz)
    }

    /**
     * Remove one or more classes from the given element or list of elements.
     * @param el Element, or list of elements from which to remove the class(es)
     * @param clazz A space separated list of classes to remove.
     */
    removeClass(el:Element | NodeListOf<Element>, clazz:string):void {
        removeClass(el, clazz)
    }

    /**
     * Toggles one or more classes on the given element or list of elements.
     * @param el Element, or list of elements on which to toggle the class(es)
     * @param clazz A space separated list of classes to toggle.
     */
    toggleClass(el:Element | NodeListOf<Element>, clazz:string):void {
        toggleClass(el, clazz)
    }

    setAttribute(el:Element, name:string, value:string):void {
        el.setAttribute(name, value)
    }

    getAttribute(el:Element, name:string):string {
        return el.getAttribute(name)
    }

    setAttributes(el:Element, atts:Dictionary<string>) {
        for (let i in atts) {
            el.setAttribute(i, atts[i])
        }
    }

    removeAttribute(el:Element, attName:string) {
        el.removeAttribute && el.removeAttribute(attName)
    }

    /**
     * Bind an event listener to the given element or elements.
     * @param el Element, or elements, to bind the event listener to.
     * @param event Name of the event to bind to.
     * @param callbackOrSelector Either a callback function, or a CSS 3 selector. When this is a selector the event listener is bound as a "delegate", ie. the event listeners
     * listens to events on children of the given `el` that match the selector.
     * @param callback Callback function for event. Only supplied when you're binding a delegated event handler.
     */
    on (el:Document | Element | NodeListOf<Element>, event:string, callbackOrSelector:Function|string, callback?:Function) {

        const _one = (_el:Document|Element) => {
            if (callback == null) {
                this.eventManager.on(_el, event, callbackOrSelector)
            } else {
                this.eventManager.on(_el, event, callbackOrSelector, callback)
            }
        }

        if (isNodeList(el)) {
            forEach(el, (el:Element) => _one(el))
        } else {
            _one(el)
        }

        return this
    }

    /**
     * Remove an event binding from the given element or elements.
     * @param el Element, or elements, from which to remove the event binding.
     * @param event Name of the event to unbind.
     * @param callback The function you wish to unbind.
     */
    off (el:Document | Element | NodeListOf<Element>, event:string, callback:Function) {
        if (isNodeList(el)) {
            forEach(el, (_el:Element) => this.eventManager.off(_el, event, callback))
        } else {
            this.eventManager.off(el, event, callback)
        }
        return this
    }

    /**
     * Trigger an event on the given element.
     * @param el Element to trigger the event on.
     * @param event Name of the event to trigger.
     * @param originalEvent Optional event that gave rise to this method being called.
     * @param payload Optional `payload` to set on the Event that is created.
     */
    trigger(el:Document | Element, event:string, originalEvent?:Event, payload?:any, detail?:number) {
        this.eventManager.trigger(el, event, originalEvent, payload, detail)
    }

    getOffsetRelativeToRoot(el:Element) {
        return offsetRelativeToRoot(el)
    }

    getOffset(el:Element):PointXY {
        const jel = el as unknown as jsPlumbDOMElement
        const container = this.getContainer()
        let out: PointXY = {
                x: jel.offsetLeft,
                y: jel.offsetTop
            },
            op = ((el !== container && jel.offsetParent !== container) ? jel.offsetParent : null) as HTMLElement,
            _maybeAdjustScroll = (offsetParent: HTMLElement) => {
                if (offsetParent != null && offsetParent !== document.body && (offsetParent.scrollTop > 0 || offsetParent.scrollLeft > 0)) {
                    out.x -= offsetParent.scrollLeft
                    out.y -= offsetParent.scrollTop
                }
            }

        while (op != null) {
            out.x += op.offsetLeft
            out.y += op.offsetTop
            _maybeAdjustScroll(op)
            op = (op.offsetParent === container ? null : op.offsetParent) as HTMLElement
        }

        // if container is scrolled and the element (or its offset parent) is not absolute or fixed, adjust accordingly.
        if (container != null && (container.scrollTop > 0 || container.scrollLeft > 0)) {
            let pp = jel.offsetParent != null ? this.getStyle(jel.offsetParent as HTMLElement, PROPERTY_POSITION) : STATIC,
                p = this.getStyle(jel, PROPERTY_POSITION)
            if (p !== ABSOLUTE && p !== FIXED && pp !== ABSOLUTE && pp !== FIXED) {
                out.x -= container.scrollLeft
                out.y -= container.scrollTop
            }
        }

        return out
    }

    getSize(el:Element):Size {
        return size(el as any)
    }

    getStyle(el:Element, prop:string):any {
        if (typeof window.getComputedStyle !== UNDEFINED) {
            return getComputedStyle(el, null).getPropertyValue(prop)
        } else {
            return (<any>el).currentStyle[prop]
        }
    }

    getGroupContentArea(group: UIGroup<any>): ElementType["E"] {
        let da = this.getSelector(group.el, SELECTOR_GROUP_CONTAINER)
        return da && da.length > 0 ? da[0] : group.el
    }


    getSelector(ctx:string | Element, spec?:string):ArrayLike<jsPlumbDOMElement> {

        let sel:Array<jsPlumbDOMElement> = null
        if (arguments.length === 1) {
            if (!isString(ctx)) {

                let nodeList = document.createDocumentFragment()
                nodeList.appendChild(ctx as Element)
                return fromArray(nodeList.childNodes) as Array<jsPlumbDOMElement>
            }

            sel = fromArray(document.querySelectorAll(<string>ctx))
        }
        else {
            sel = fromArray((<Element>ctx).querySelectorAll(<string>spec))  as Array<jsPlumbDOMElement>
        }

        return sel
    }

    /**
     * Sets the position of the given element.
     * @param el Element to change position for
     * @param p New location for the element.
     */
    setPosition(el:Element, p:PointXY):void {
        const jel = el as jsPlumbDOMElement
        jel.style.left = p.x + "px"
        jel.style.top = p.y + "px"
    }

    setDraggable(element:Element, draggable:boolean) {
        if (draggable) {
            this.removeAttribute(element, ATTRIBUTE_NOT_DRAGGABLE)
        } else {
            this.setAttribute(element, ATTRIBUTE_NOT_DRAGGABLE, TRUE)
        }
    }

    isDraggable(el:Element):boolean {
        let d = this.getAttribute(el, ATTRIBUTE_NOT_DRAGGABLE)
        return d == null || d === FALSE
    }

    /*
     * toggles the draggable state of the given element(s).
     * el is either an id, or an element object, or a list of ids/element objects.
     */
    toggleDraggable (el:Element):boolean {
        let state = this.isDraggable(el)
        this.setDraggable(el, !state)
        return !state
    }

    private _attachEventDelegates() {
        let currentContainer = this.getContainer()
        this.eventManager.on(currentContainer, EVENT_CLICK, SELECTOR_OVERLAY, this._overlayClick)
        this.eventManager.on(currentContainer, EVENT_DBL_CLICK, SELECTOR_OVERLAY, this._overlayDblClick)
        this.eventManager.on(currentContainer, EVENT_TAP, SELECTOR_OVERLAY, this._overlayTap)
        this.eventManager.on(currentContainer, EVENT_DBL_TAP, SELECTOR_OVERLAY, this._overlayDblTap)

        this.eventManager.on(currentContainer, EVENT_CLICK, SELECTOR_CONNECTOR, this._connectorClick)
        this.eventManager.on(currentContainer, EVENT_DBL_CLICK, SELECTOR_CONNECTOR, this._connectorDblClick)
        this.eventManager.on(currentContainer, EVENT_TAP, SELECTOR_CONNECTOR, this._connectorTap)
        this.eventManager.on(currentContainer, EVENT_DBL_TAP, SELECTOR_CONNECTOR, this._connectorDblTap)

        this.eventManager.on(currentContainer, EVENT_CLICK, SELECTOR_ENDPOINT, this._endpointClick)
        this.eventManager.on(currentContainer, EVENT_DBL_CLICK, SELECTOR_ENDPOINT, this._endpointDblClick)

        this.eventManager.on(currentContainer, EVENT_CLICK, this.managedElementsSelector, this._elementClick)
        this.eventManager.on(currentContainer, EVENT_TAP, this.managedElementsSelector, this._elementTap)
        this.eventManager.on(currentContainer, EVENT_DBL_TAP, this.managedElementsSelector, this._elementDblTap)

        this.eventManager.on(currentContainer, EVENT_MOUSEOVER, SELECTOR_CONNECTOR, this._connectorMouseover)
        this.eventManager.on(currentContainer, EVENT_MOUSEOUT, SELECTOR_CONNECTOR, this._connectorMouseout)

        this.eventManager.on(currentContainer, EVENT_MOUSEOVER, SELECTOR_ENDPOINT, this._endpointMouseover)
        this.eventManager.on(currentContainer, EVENT_MOUSEOUT, SELECTOR_ENDPOINT, this._endpointMouseout)

        this.eventManager.on(currentContainer, EVENT_MOUSEOVER, SELECTOR_OVERLAY, this._overlayMouseover)
        this.eventManager.on(currentContainer, EVENT_MOUSEOUT, SELECTOR_OVERLAY, this._overlayMouseout)

        this.eventManager.on(currentContainer, EVENT_MOUSEOVER, SELECTOR_MANAGED_ELEMENT, this._elementMouseenter)
        this.eventManager.on(currentContainer, EVENT_MOUSEOUT, SELECTOR_MANAGED_ELEMENT, this._elementMouseexit)
    }

    private _detachEventDelegates() {
        let currentContainer = this.getContainer()
        if (currentContainer) {

            this.eventManager.off(currentContainer, EVENT_CLICK, this._connectorClick)
            this.eventManager.off(currentContainer, EVENT_DBL_CLICK, this._connectorDblClick)
            this.eventManager.off(currentContainer, EVENT_TAP, this._connectorTap)
            this.eventManager.off(currentContainer, EVENT_DBL_TAP, this._connectorDblTap)

            this.eventManager.off(currentContainer, EVENT_CLICK, this._endpointClick)
            this.eventManager.off(currentContainer, EVENT_DBL_CLICK, this._endpointDblClick)

            this.eventManager.off(currentContainer, EVENT_CLICK, this._overlayClick)
            this.eventManager.off(currentContainer, EVENT_DBL_CLICK, this._overlayDblClick)
            this.eventManager.off(currentContainer, EVENT_TAP, this._overlayTap)
            this.eventManager.off(currentContainer, EVENT_DBL_TAP, this._overlayDblTap)

            this.eventManager.off(currentContainer, EVENT_CLICK, this._elementClick)
            this.eventManager.off(currentContainer, EVENT_TAP, this._elementTap)
            this.eventManager.off(currentContainer, EVENT_DBL_TAP, this._elementDblTap)

            this.eventManager.off(currentContainer, EVENT_MOUSEOVER, this._connectorMouseover)
            this.eventManager.off(currentContainer, EVENT_MOUSEOUT, this._connectorMouseout)

            this.eventManager.off(currentContainer, EVENT_MOUSEOVER, this._endpointMouseover)
            this.eventManager.off(currentContainer, EVENT_MOUSEOUT, this._endpointMouseout)

            this.eventManager.off(currentContainer, EVENT_MOUSEOVER, this._overlayMouseover)
            this.eventManager.off(currentContainer, EVENT_MOUSEOUT, this._overlayMouseout)

            this.eventManager.off(currentContainer, EVENT_MOUSEENTER, this._elementMouseenter)
            this.eventManager.off(currentContainer, EVENT_MOUSEEXIT, this._elementMouseexit)
        }
    }


    setContainer(newContainer: Element): void {

        if ((newContainer  as any) === document || newContainer === document.body) {
            throw new Error("Cannot set document or document.body as container element")
        }

        this._detachEventDelegates()
        let dragFilters:Array<[string, boolean]>
        if (this.dragManager != null) {
            dragFilters = this.dragManager.reset()
        }

        this.setAttribute(newContainer, ATTRIBUTE_CONTAINER, uuid().replace("-", ""))

        // move all endpoints, connectors, and managed elements
        const currentContainer = this.getContainer()
        if (currentContainer != null) {
            currentContainer.removeAttribute(ATTRIBUTE_CONTAINER)
            const children = fromArray(currentContainer.childNodes).filter( (cn:Element) => {
                return cn != null && (((this.hasClass(cn, CLASS_CONNECTOR) ||  this.hasClass(cn, CLASS_ENDPOINT) || this.hasClass(cn, CLASS_OVERLAY)) ||
                    cn.getAttribute && cn.getAttribute(ATTRIBUTE_MANAGED) != null)
                )
            })

            forEach(children, (el:Element) => {
                newContainer.appendChild(el)
            })
        }

        super.setContainer(newContainer)
        if (this.eventManager != null) {
            this._attachEventDelegates()
        }
        if (this.dragManager != null) {
            this.dragManager.addHandler(new EndpointDragHandler(this))
            this.dragManager.addHandler(new GroupDragHandler(this, this.dragSelection), this.groupDragOptions)
            this.elementDragHandler = new ElementDragHandler(this, this.dragSelection)
            this.dragManager.addHandler(this.elementDragHandler, this.elementDragOptions)
            if (dragFilters != null) {
                this.dragManager.setFilters(dragFilters)
            }
        }
    }

    reset() {
        super.reset()
        const container = this.getContainer()
        const els = container.querySelectorAll([SELECTOR_MANAGED_ELEMENT, SELECTOR_ENDPOINT, SELECTOR_CONNECTOR, SELECTOR_OVERLAY].join(","))
        forEach(els,(el:any) => el.parentNode && el.parentNode.removeChild(el))
    }

    destroy(): void {

        this._detachEventDelegates()

        if (this.dragManager != null) {
            this.dragManager.reset()
        }

        this.clearDragSelection()

        super.destroy()
    }

    unmanage (el:Element, removeElement?:boolean):void {
        this.removeFromDragSelection(el)
        super.unmanage(el, removeElement)
    }

    addToDragSelection(...el:Array<Element>) {
        forEach(el, (_el) => this.dragSelection.add(_el))
    }

    clearDragSelection() {
        this.dragSelection.clear()
    }

    removeFromDragSelection(...el:Array<Element>) {
        forEach(el, (_el) => this.dragSelection.remove(_el))
    }

    toggleDragSelection(...el:Array<Element>) {
        forEach(el,(_el) => this.dragSelection.toggle(_el))
    }


    // ------------ drag groups

    /**
     * Adds the given element(s) to the given drag group.
     * @param spec Either the ID of some drag group, in which case the elements are all added as 'active', or an object of the form
     * { id:"someId", active:boolean }. In the latter case, `active`, if true, which is the default, indicates whether
     * dragging the given element(s) should cause all the elements in the drag group to be dragged. If `active` is false it means the
     * given element(s) is "passive" and should only move when an active member of the drag group is dragged.
     * @param els Elements to add to the drag group.
     */
    addToDragGroup(spec:DragGroupSpec, ...els:Array<Element>) {
        this.elementDragHandler.addToDragGroup(spec, ...els)
    }

    /**
     * Removes the given element(s) from any drag group they may be in. You don't need to supply the drag group id, as elements
     * can only be in one drag group anyway.
     * @param els Elements to remove from drag groups.
     */
    removeFromDragGroup(...els:Array<Element>) {
        this.elementDragHandler.removeFromDragGroup(...els)
    }

    /**
     * Sets the active/passive state for the given element(s).You don't need to supply the drag group id, as elements
     * can only be in one drag group anyway.
     * @param state true for active, false for passive.
     * @param els
     */
    setDragGroupState (state:boolean, ...els:Array<Element>) {
        this.elementDragHandler.setDragGroupState(state, ...els)
    }

    /**
     * Consumes the given event.
     * @param e
     * @param doNotPreventDefault
     */
    consume (e:Event, doNotPreventDefault?:boolean) {
        consume(e, doNotPreventDefault)
    }

    // /**
    //  * Adds a managed list to the instance.
    //  * @param el Element containing the list.
    //  * @param options
    //  */
    // addList (el:Element, options?:JsPlumbListOptions):JsPlumbList {
    //     return this.listManager.addList(el, options)
    // }
    //
    // /**
    //  * Removes a managed list from the instance
    //  * @param el Element containing the list.
    //  */
    // removeList (el:Element) {
    //     this.listManager.removeList(el)
    // }

    rotate(element: Element, rotation: number, doNotRepaint?: boolean):RedrawResult {
        const elementId = this.getId(element)
        if (this._managedElements[elementId]) {
            (this._managedElements[elementId].el as jsPlumbDOMElement).style.transform = "rotate(" + rotation + "deg)";
            (this._managedElements[elementId].el as jsPlumbDOMElement).style.transformOrigin = "center center"
            return super.rotate(element, rotation, doNotRepaint)
        }

        return { c:new Set(), e:new Set() }
    }

    svg = {
        node: (name:string, attributes?:ElementAttributes) => _node(name, attributes),
        attr:(node:SVGElement, attributes:ElementAttributes) => _attr (node, attributes),
        pos:(d:[number, number]):string => _pos(d)
    }

    addOverlayClass(o: Overlay, clazz: string): void {

        if (isLabelOverlay(o)) {
            o.instance.addClass(getLabelElement(o), clazz)
        } else if (isSVGElementOverlay(o)) {
            o.instance.addClass(SVGElementOverlay.ensurePath(o), clazz)
        } else if (isCustomOverlay(o)) {
            o.instance.addClass(getCustomElement(o), clazz)
        } else {
            throw "Could not add class to overlay of type [" + o.type + "]"
        }
    }

    //
    removeOverlayClass(o: Overlay, clazz: string): void {
        if (isLabelOverlay(o)) {
            o.instance.removeClass(getLabelElement(o), clazz)
        } else if (isSVGElementOverlay(o)) {
            o.instance.removeClass(SVGElementOverlay.ensurePath(o), clazz)
        } else if (isCustomOverlay(o)) {
            o.instance.removeClass(getCustomElement(o), clazz)
        } else {
            throw "Could not remove class from overlay of type [" + o.type + "]"
        }
    }

    paintOverlay(o: Overlay, params:any, extents:any):void {

        //
        if (isLabelOverlay(o)) {

            getLabelElement(o)

            const XY = o.component.getXY();

            (o as any).canvas.style.left = XY.x + params.d.minx + "px";
            (o as any).canvas.style.top = XY.y + params.d.miny + "px"

        } else if (isSVGElementOverlay(o)) {

            const path = (isNaN(params.d.cxy.x) || isNaN(params.d.cxy.y)) ? "M 0 0" : "M" + params.d.hxy.x + "," + params.d.hxy.y +
                " L" + params.d.tail[0].x + "," + params.d.tail[0].y +
                " L" + params.d.cxy.x + "," + params.d.cxy.y +
                " L" + params.d.tail[1].x + "," + params.d.tail[1].y +
                " L" + params.d.hxy.x + "," + params.d.hxy.y

            SVGElementOverlay.paint(o, path, params, extents)

        } else if (isCustomOverlay(o)) {
            getCustomElement(o)

            const XY = o.component.getXY();

            (o as any).canvas.style.left = XY.x + params.d.minx + "px"; // wont work for endpoint. abstracts
            (o as any).canvas.style.top = XY.y + params.d.miny + "px"
        } else {
            throw "Could not paint overlay of type [" + o.type + "]"
        }
    }

    setOverlayVisible(o: Overlay, visible:boolean):void {
        const d = visible ? "block" : "none"
        function s(el:any) {
            if (el != null) {
                el.style.display = d
            }
        }
        if (isLabelOverlay(o)) {
            s(getLabelElement(o))
        }
        else if (isCustomOverlay(o)) {
            s(getCustomElement(o))
        } else if (isSVGElementOverlay(o)) {
            s(o.path)
        }
    }

    reattachOverlay(o: Overlay, c: Component): void {
        if (isLabelOverlay(o)) {
            o.instance._appendElement(getLabelElement(o), this.getContainer())
        } else if (isCustomOverlay(o)) {
            o.instance._appendElement(getCustomElement(o), this.getContainer())
        }
        else if (isSVGElementOverlay(o)){
            this._appendElement(SVGElementOverlay.ensurePath(o), (c as any).connector.canvas)
        }
    }

    setOverlayHover(o: Overlay, hover: boolean): void {

        const method = hover ? "addClass" : "removeClass"
        let canvas:Element

        if (isLabelOverlay(o)) {
            canvas = getLabelElement(o)
        } else if (isCustomOverlay(o)) {
            canvas = getCustomElement(o)
        }
        else if (isSVGElementOverlay(o)){
            canvas = SVGElementOverlay.ensurePath(o)
        }

        if (canvas != null) {
            if (this.hoverClass != null) {
                this[method](canvas, this.hoverClass)
            }

            this.setHover(o.component, hover)
        }
    }

    destroyOverlay(o: Overlay):void {
        if (isLabelOverlay(o)) {
            const el = getLabelElement(o)
            el.parentNode.removeChild(el)
            delete (o as any).canvas
            delete (o as any).cachedDimensions
        } else if (isArrowOverlay(o) || isDiamondOverlay(o) || isPlainArrowOverlay(o)){
            SVGElementOverlay.destroy(o)
        } else if (isCustomOverlay(o)) {
            const el = getCustomElement(o)
            el.parentNode.removeChild(el)
            delete (o as any).canvas
            delete (o as any).cachedDimensions
        }
    }

    // TODO remove `any` here,
    drawOverlay(o: Overlay, component: any, paintStyle: PaintStyle, absolutePosition?: PointXY): any {
        if (isLabelOverlay(o) || isCustomOverlay(o)) {

            //  TO DO - move to a static method, or a shared method, etc.  (? future me doesnt know what that means.)

            let td = HTMLElementOverlay._getDimensions(o as any);
            if (td != null && td.w != null && td.h != null) {

                let cxy = {x: 0, y: 0}
                if (absolutePosition) {
                    cxy = {x: absolutePosition.x, y: absolutePosition.y}
                } else if (component instanceof EndpointRepresentation) {
                    let locToUse:Array<number> = Array.isArray(o.location) ? o.location as Array<number> : [o.location, o.location] as Array<number>
                    cxy = {
                        x: locToUse[0] * component.w,
                        y: locToUse[1] * component.h
                    }
                } else {
                    let loc = o.location, absolute = false
                    if (isString(o.location) || o.location < 0 || o.location > 1) {
                        loc = parseInt("" + o.location, 10)
                        absolute = true
                    }
                    cxy = (<any>component).pointOnPath(loc as number, absolute);  // a connection
                }

                let minx = cxy.x - (td.w / 2),
                    miny = cxy.y - (td.h / 2)

                return {
                    component: o,
                    d: {minx: minx, miny: miny, td: td, cxy: cxy},
                    xmin: minx,
                    xmax: minx + td.w,
                    ymin: miny,
                    ymax: miny + td.h
                }
            }
            else {
                return {xmin: 0, xmax: 0, ymin: 0, ymax: 0}
            }

        } else if (isArrowOverlay(o) || isDiamondOverlay(o) || isPlainArrowOverlay(o)) {
            return o.draw(component, paintStyle, absolutePosition)
        } else {
            throw "Could not draw overlay of type [" + o.type + "]"
        }
    }

    updateLabel(o: LabelOverlay): void {

        if (isFunction(o.label)) {
            let lt = (o.label)(this)
            if (lt != null) {
                getLabelElement(o).innerText = lt
            } else {
                getLabelElement(o).innerText = ""
            }
        }
        else {
            if (o.labelText == null) {
                o.labelText = o.label as string
                if (o.labelText != null) {
                    getLabelElement(o).innerText = o.labelText
                } else {
                    getLabelElement(o).innerText = ""
                }
            }
        }
    }

    setHover(component: Component, hover: boolean): void {
        component._hover = hover
        if (component instanceof Endpoint && (component as Endpoint).endpoint != null) {
            this.setEndpointHover((component as Endpoint), hover)
        } else if (component instanceof Connection && (component as Connection).connector != null) {
            this.setConnectorHover((component as Connection).connector, hover)
        }
    }

    // ------------------------------- connectors ---------------------------------------------------------

    paintConnector(connector:AbstractConnector, paintStyle:PaintStyle, extents?:Extents):void {
        paintSvgConnector(this, connector, paintStyle, extents)
    }

    setConnectorHover(connector:AbstractConnector, h:boolean, doNotCascade?:boolean):void {
        if (h === false || (!this.currentlyDragging && !this.isHoverSuspended())) {

            const method = h ? "addClass" : "removeClass"
            const canvas = (connector as any).canvas

            if (canvas != null) {
                if (connector.hoverClass != null) {
                    this[method](canvas, connector.hoverClass)
                }

                this[method](canvas, this.hoverClass)
            }
            if (connector.connection.hoverPaintStyle != null) {
                connector.connection.paintStyleInUse = h ? connector.connection.hoverPaintStyle : connector.connection.paintStyle
                if (!this._suspendDrawing) {
                    this.paintConnection(connector.connection)
                }
            }

            if (!doNotCascade) {

                this.setEndpointHover(connector.connection.endpoints[0], h, true)
                this.setEndpointHover(connector.connection.endpoints[1], h, true)
            }
        }
    }

    destroyConnector(connection:Connection):void {
        if (connection.connector != null) {
            cleanup(connection.connector as any)
        }
    }

    addConnectorClass(connector:AbstractConnector, clazz:string):void {
        if ((connector as any).canvas) {
            this.addClass((connector as any).canvas, clazz)
        }
    }

    removeConnectorClass(connector:AbstractConnector, clazz:string):void {
        if ((connector as any).canvas) {
            this.removeClass((connector as any).canvas, clazz)
        }
    }

    getConnectorClass(connector: AbstractConnector): string {
        if ((connector as any).canvas) {
            return (connector as any).canvas.className.baseVal
        } else {
            return ""
        }
    }

    setConnectorVisible(connector:AbstractConnector, v:boolean):void {
        setVisible(connector as any, v)
    }

    applyConnectorType(connector:AbstractConnector, t:TypeDescriptor):void {
        if ((connector as any).canvas && t.cssClass) {
            const classes = Array.isArray(t.cssClass) ? t.cssClass as Array<string> : [ t.cssClass ]
            this.addClass((connector as any).canvas, classes.join(" "))
        }
    }

    addEndpointClass(ep: Endpoint, c: string): void {
        const canvas = getEndpointCanvas(ep.endpoint)
        if (canvas != null) {
            this.addClass(canvas, c)
        }
    }

    applyEndpointType<C>(ep: Endpoint, t: TypeDescriptor): void {
        if(t.cssClass) {
            const canvas = getEndpointCanvas(ep.endpoint)
            if (canvas) {
                const classes = Array.isArray(t.cssClass) ? t.cssClass as Array<string> : [t.cssClass]
                this.addClass(canvas, classes.join(" "))
            }
        }
    }

    destroyEndpoint(ep: Endpoint): void {
        let anchorClass = this.endpointAnchorClassPrefix + (ep.currentAnchorClass ? "-" + ep.currentAnchorClass : "")
        this.removeClass(ep.element, anchorClass)
        cleanup(ep.endpoint as any)
    }

    renderEndpoint(ep: Endpoint, paintStyle: PaintStyle): void {
        const renderer = endpointMap[ep.endpoint.type]
        if (renderer != null) {
            SvgEndpoint.paint(ep.endpoint, renderer, paintStyle)
        } else {
            log("jsPlumb: no endpoint renderer found for type [" + ep.endpoint.type + "]")
        }
    }

    removeEndpointClass(ep: Endpoint, c: string): void {
        const canvas = getEndpointCanvas(ep.endpoint)
        if (canvas != null) {
            this.removeClass(canvas, c)
        }
    }

    getEndpointClass(ep: Endpoint): string {
        const canvas = getEndpointCanvas(ep.endpoint)
        if (canvas != null) {
            return canvas.className
        } else {
            return ""
        }
    }

    setEndpointHover(endpoint: Endpoint, h: boolean, doNotCascade?:boolean): void {

        if (endpoint != null && (h === false || (!this.currentlyDragging && !this.isHoverSuspended()))) {

            const method = h ? "addClass" : "removeClass"
            const canvas = getEndpointCanvas(endpoint.endpoint)

            if (canvas != null) {
                if (endpoint.hoverClass != null) {
                    this[method](canvas, endpoint.hoverClass)
                }
            }
            if (endpoint.hoverPaintStyle != null) {
                endpoint.paintStyleInUse = h ? endpoint.hoverPaintStyle : endpoint.paintStyle
                if (!this._suspendDrawing) {
                    this.renderEndpoint(endpoint, endpoint.paintStyleInUse)
                }
            }

            if (!doNotCascade) {
                // instruct attached connections to set hover, unless doNotCascade was true.
                for(let i = 0; i < endpoint.connections.length; i++) {
                    this.setConnectorHover(endpoint.connections[i].connector, h, true)
                }
            }
        }
    }

    setEndpointVisible(ep: Endpoint, v: boolean): void {
        setVisible(ep.endpoint as any, v)
    }

    setGroupVisible(group: UIGroup<Element>, state: boolean): void {
        let m = group.el.querySelectorAll(SELECTOR_MANAGED_ELEMENT)
        for (let i = 0; i < m.length; i++) {
            if (state) {
                this.show(m[i], true)
            } else {
                this.hide(m[i], true)
            }
        }
    }

    deleteConnection(connection: Connection, params?: DeleteConnectionOptions): boolean {
        if (connection != null && connection.deleted !== true) {
            this.setEndpointHover(connection.endpoints[0], false, true)
            this.setEndpointHover(connection.endpoints[1], false, true)
            return super.deleteConnection(connection, params)
        } else {
            return false
        }
    }

    addSourceSelector(selector: string, params?: BehaviouralTypeDescriptor, exclude?:boolean): SourceSelector {
        this.addDragFilter(selector)
        return super.addSourceSelector(selector, params, exclude)
    }

    removeSourceSelector(selector: SourceSelector) {
        this.removeDragFilter(selector.selector)
        super.removeSourceSelector(selector)
    }
}
