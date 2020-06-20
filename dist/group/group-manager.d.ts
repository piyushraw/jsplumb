import { Dictionary, jsPlumbInstance, Offset } from "../core";
import { UIGroup } from "./group";
export declare class GroupManager {
    instance: jsPlumbInstance;
    groupMap: Dictionary<UIGroup>;
    _connectionSourceMap: Dictionary<UIGroup>;
    _connectionTargetMap: Dictionary<UIGroup>;
    constructor(instance: jsPlumbInstance);
    private _cleanupDetachedConnection;
    addGroup(params: any): UIGroup;
    getGroup(groupId: string | UIGroup): UIGroup;
    getGroupFor(el: any | string): UIGroup;
    removeGroup(group: string | UIGroup, deleteMembers?: boolean, manipulateDOM?: boolean, doNotFireEvent?: boolean): Dictionary<Offset>;
    removeAllGroups(deleteMembers?: boolean, manipulateDOM?: boolean, doNotFireEvent?: boolean): void;
    forEach(f: (g: UIGroup) => any): void;
    orphan(_el: any): [string, Offset];
    private _setGroupVisible;
    _updateConnectionsForGroup(group: UIGroup): void;
    private _collapseConnection;
    private _expandConnection;
    private isDescendant;
    collapseGroup(group: string | UIGroup): void;
    expandGroup(group: string | UIGroup, doNotFireEvent?: boolean): void;
    toggleGroup(group: string | UIGroup): void;
    repaintGroup(group: string | UIGroup): void;
    addToGroup(group: string | UIGroup, el: any | Array<any>, doNotFireEvent?: boolean): void;
    removeFromGroup(group: string | UIGroup, el: any, doNotFireEvent?: boolean): void;
    reset(): void;
}
