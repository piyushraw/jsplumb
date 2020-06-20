import { PaintStyle } from "../styles";
import { Dictionary, jsPlumbInstance, Timestamp, TypeDescriptor, PointArray, PointXY } from "../core";
import { EventGenerator } from "../event-generator";
import { Connection } from "../connector/connection-impl";
import { Endpoint } from "../endpoint/endpoint-impl";
import { Overlay, OverlaySpec } from "../overlay/overlay";
import { EndpointSpec } from "../endpoint/endpoint";
import { ConnectorSpec } from "../connector/abstract-connector";
export declare type ComponentConfig = {
    paintStyle?: PaintStyle;
    hoverPaintStyle?: PaintStyle;
    types: string[];
    instance: jsPlumbInstance;
    paintStyleInUse?: PaintStyle;
    cssClass?: string;
    hoverClass?: string;
    parameters: ComponentParameters;
    typeCache: {};
    overlays?: Dictionary<Overlay>;
    overlayPlacements?: Dictionary<any>;
    overlayPositions?: Dictionary<PointArray>;
    hover?: boolean;
    beforeDetach?: Function;
    beforeDrop?: Function;
    params?: any;
    lastPaintedAt?: string;
    directed?: boolean;
    cost?: number;
    connectionCost?: number;
    connectionsDirected?: boolean;
    visible?: boolean;
    detachable?: boolean;
    reattach?: boolean;
    maxConnections?: number;
    uuids?: [string, string];
    endpoint?: EndpointSpec;
    endpoints?: [EndpointSpec, EndpointSpec];
    endpointStyle?: PaintStyle;
    endpointHoverStyle?: PaintStyle;
    endpointStyles?: [PaintStyle, PaintStyle];
    endpointHoverStyles?: [PaintStyle, PaintStyle];
    enabled?: boolean;
    currentAnchorClass?: string;
    uuid?: string;
    floatingEndpoint?: Endpoint;
    events?: any;
    connectorStyle?: PaintStyle;
    connectorHoverStyle?: PaintStyle;
    connector?: ConnectorSpec;
    connectorOverlays?: Array<OverlaySpec>;
    scope?: string;
};
export declare type ComponentParameters = Dictionary<any>;
export declare function _removeTypeCssHelper<E>(component: Component, typeIndex: number): void;
export declare function _updateHoverStyle<E>(component: Component): void;
export declare type RepaintOptions = {
    timestamp?: Timestamp;
    recalc?: boolean;
};
export interface ComponentOptions {
    _jsPlumb?: jsPlumbInstance;
    parameters?: any;
    beforeDetach?: Function;
    beforeDrop?: Function;
    hoverClass?: string;
    overlays?: Array<OverlaySpec>;
    events?: Dictionary<Function>;
    scope?: string;
    cssClass?: string;
}
export declare abstract class Component extends EventGenerator {
    instance: jsPlumbInstance;
    abstract getTypeDescriptor(): string;
    abstract getDefaultOverlayKey(): string;
    abstract getIdPrefix(): string;
    abstract getXY(): PointXY;
    clone: () => Component;
    segment?: number;
    x: number;
    y: number;
    w: number;
    h: number;
    id: string;
    visible: boolean;
    typeId: string;
    paintStyle: PaintStyle;
    hoverPaintStyle: PaintStyle;
    paintStyleInUse: PaintStyle;
    data: any;
    _defaultType: any;
    _jsPlumb: ComponentConfig;
    cssClass: string;
    constructor(instance: jsPlumbInstance, params?: ComponentOptions);
    abstract paint(params?: any): any;
    isDetachAllowed(connection: Connection): boolean;
    isDropAllowed(sourceId: string, targetId: string, scope: string, connection: Connection, dropEndpoint: Endpoint, source?: any, target?: any): any;
    getDefaultType(): TypeDescriptor;
    appendToDefaultType(obj: any): void;
    getId(): string;
    cacheTypeItem(key: string, item: any, typeId: string): void;
    getCachedTypeItem(key: string, typeId: string): any;
    setType(typeId: string, params?: any, doNotRepaint?: boolean): void;
    getType(): string[];
    reapplyTypes(params?: any, doNotRepaint?: boolean): void;
    hasType(typeId: string): boolean;
    addType(typeId: string, params?: any, doNotRepaint?: boolean): void;
    removeType(typeId: string, params?: any, doNotRepaint?: boolean): void;
    clearTypes(params?: any, doNotRepaint?: boolean): void;
    toggleType(typeId: string, params?: any, doNotRepaint?: boolean): void;
    applyType(t: TypeDescriptor, doNotRepaint?: boolean, params?: any): void;
    setPaintStyle(style: PaintStyle, doNotRepaint?: boolean): void;
    getPaintStyle(): PaintStyle;
    setHoverPaintStyle(style: PaintStyle, doNotRepaint?: boolean): void;
    getHoverPaintStyle(): PaintStyle;
    destroy(force?: boolean): void;
    isHover(): boolean;
    getParameter(name: string): any;
    setParameter(name: string, value: any): void;
    getParameters(): ComponentParameters;
    setParameters(p: ComponentParameters): void;
    setVisible(v: boolean): void;
    isVisible(): boolean;
    addClass(clazz: string, dontUpdateOverlays?: boolean): void;
    removeClass(clazz: string, dontUpdateOverlays?: boolean): void;
    getClass(): string;
    shouldFireEvent(event: string, value: any, originalEvent?: Event): boolean;
    getData(): any;
    setData(d: any): void;
    mergeData(d: any): void;
}
