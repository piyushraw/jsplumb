import { Connection, AbstractConnector, ConnectorComputeParams, PaintGeometry } from "@jsplumb/core";
import { ConnectorOptions } from "@jsplumb/common";
export interface FlowchartConnectorOptions extends ConnectorOptions {
    alwaysRespectStubs?: boolean;
    midpoint?: number;
    cornerRadius?: number;
    loopbackRadius?: number;
}
export declare class FlowchartConnector extends AbstractConnector {
    connection: Connection;
    static type: string;
    type: string;
    private internalSegments;
    midpoint: number;
    alwaysRespectStubs: boolean;
    cornerRadius: number;
    lastx: number;
    lasty: number;
    lastOrientation: any;
    loopbackRadius: number;
    isLoopbackCurrently: boolean;
    getDefaultStubs(): [number, number];
    constructor(connection: Connection, params: FlowchartConnectorOptions);
    private addASegment;
    private writeSegments;
    _compute(paintInfo: PaintGeometry, params: ConnectorComputeParams): void;
}
//# sourceMappingURL=flowchart-connector.d.ts.map