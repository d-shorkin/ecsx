'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

(function (ComponentStatus) {
    ComponentStatus[ComponentStatus["NoChanges"] = 0] = "NoChanges";
    ComponentStatus[ComponentStatus["Created"] = 1] = "Created";
    ComponentStatus[ComponentStatus["Updated"] = 2] = "Updated";
    ComponentStatus[ComponentStatus["Removed"] = 3] = "Removed";
    ComponentStatus[ComponentStatus["NotFound"] = 4] = "NotFound";
})(exports.ComponentStatus || (exports.ComponentStatus = {}));

function castComponent(component, componentClass) {
    return !!(component && component instanceof componentClass);
}
var EntityCompositeCollection = /** @class */ (function () {
    function EntityCompositeCollection() {
        var collections = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            collections[_i] = arguments[_i];
        }
        this.collections = [];
        this.collections = collections;
    }
    EntityCompositeCollection.prototype.getEntities = function () {
        return this.collections.reduce(function (acc, collection) {
            collection.getEntities().forEach(function (e) {
                if (!acc.includes(e)) {
                    acc.push(e);
                }
            });
            return acc;
        }, []);
    };
    return EntityCompositeCollection;
}());
function composeCollections() {
    var collections = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        collections[_i] = arguments[_i];
    }
    return new (EntityCompositeCollection.bind.apply(EntityCompositeCollection, __spreadArrays([void 0], collections)))();
}
function Not(componentClass) {
    return { not: componentClass };
}
function Created(componentClass) {
    return { created: componentClass };
}
function Updated(componentClass) {
    return { updated: componentClass };
}
function Removed(componentClass) {
    return { removed: componentClass };
}

var EventEmitter = /** @class */ (function () {
    function EventEmitter() {
        this.listeners = {};
    }
    EventEmitter.prototype.addListener = function (event, listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        if (!this.listeners[event].find(function (l) { return l === listener; })) {
            this.listeners[event].push(listener);
        }
        return this;
    };
    EventEmitter.prototype.on = function (event, listener) {
        return this.addListener(event, listener);
    };
    EventEmitter.prototype.removeListener = function (event, listener) {
        if (!this.listeners[event]) {
            return this;
        }
        this.listeners[event] = this.listeners[event].filter(function (callback) { return callback !== listener; });
        return this;
    };
    EventEmitter.prototype.off = function (event, listener) {
        return this.removeListener(event, listener);
    };
    EventEmitter.prototype.removeAllListeners = function (event) {
        if (!event) {
            this.listeners = {};
            return this;
        }
        this.listeners[event] = [];
        return this;
    };
    EventEmitter.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!this.listeners[event]) {
            return true;
        }
        for (var _a = 0, _b = this.listeners[event]; _a < _b.length; _a++) {
            var listener = _b[_a];
            // @ts-ignore
            if (listener.apply(void 0, args) === false) {
                return false;
            }
        }
        return true;
    };
    EventEmitter.prototype.hasListener = function (event, listener) {
        return this.listeners[event].includes(listener);
    };
    return EventEmitter;
}());

var Entity = /** @class */ (function (_super) {
    __extends(Entity, _super);
    function Entity(id) {
        var _this = _super.call(this) || this;
        _this.components = {};
        _this.componentClasses = {};
        _this.id = 0;
        _this.componentsPrev = {};
        _this.componentsStatus = {};
        _this.firstCommitted = false;
        _this.id = id;
        return _this;
    }
    Entity.prototype.getId = function () {
        return this.id;
    };
    Entity.prototype.listComponents = function () {
        var _this = this;
        return Object.keys(this.components).map(function (tag) { return _this.components[tag]; });
    };
    Entity.prototype.listComponentsWithTypes = function () {
        var _this = this;
        return Object.keys(this.components).map(function (tag) { return ({
            component: _this.components[tag],
            type: _this.componentClasses[tag]
        }); });
    };
    Entity.prototype.listComponentsWithTags = function () {
        var _this = this;
        return Object.keys(this.components).map(function (tag) {
            return Object.freeze({
                tag: tag,
                component: _this.components[tag]
            });
        });
    };
    Entity.prototype.hasComponent = function (componentClass, existsCallback) {
        var tag = componentClass.tag || componentClass.name;
        var component = this.components[tag];
        if (!component)
            return false;
        if (!castComponent(component, componentClass)) {
            throw new Error("There are multiple classes with the same tag or name \"" + tag + "\".\nAdd a different property \"tag\" to one of them.");
        }
        if (existsCallback) {
            existsCallback(component);
        }
        return true;
    };
    Entity.prototype.getComponent = function (componentClass) {
        var tag = componentClass.tag || componentClass.name;
        var component = this.components[tag];
        if (!component) {
            throw new Error("Cannot get component \"" + tag + "\" from entity.");
        }
        if (!castComponent(component, componentClass)) {
            throw new Error("There are multiple classes with the same tag or name \"" + tag + "\".\nAdd a different property \"tag\" to one of them.");
        }
        return component;
    };
    Entity.prototype.setComponent = function (componentClass, data) {
        var _this = this;
        var tag = componentClass.tag || componentClass.name;
        var component = this.components[tag];
        if (component) {
            if (!castComponent(component, componentClass)) {
                throw new Error("There are multiple classes with the same tag or name \"" + tag + "\".\nAdd a different property \"tag\" to one of them.");
            }
            if (this.firstCommitted && !this.componentsPrev[tag]) {
                this.componentsPrev[tag] = component;
                this.components[tag] = new componentClass();
                this.componentsStatus[tag] = exports.ComponentStatus.Updated;
            }
        }
        else {
            this.componentsStatus[tag] = exports.ComponentStatus.Created;
            this.components[tag] = new componentClass();
        }
        Object.keys(data).forEach(function (key) { return _this.components[tag][key] = data[key]; });
        this.componentClasses[tag] = componentClass;
        this.emit("setComponent", { componentClass: componentClass, tag: tag, component: component, entity: this });
        return this.components[tag];
    };
    Entity.prototype.updateComponent = function (componentClass, data) {
        var _this = this;
        var tag = componentClass.tag || componentClass.name;
        var component = this.components[tag];
        if (!component) {
            throw new Error("Cannot find component \"" + tag + "\" for update.");
        }
        if (!castComponent(component, componentClass)) {
            throw new Error("There are multiple classes with the same tag or name \"" + tag + "\".\nAdd a different property \"tag\" to one of them.");
        }
        if (this.firstCommitted && !this.componentsPrev[tag]) {
            this.componentsPrev[tag] = component;
            // clone
            this.components[tag] = new componentClass();
            Object.keys(component).forEach(function (key) { return _this.components[tag][key] = component[key]; });
        }
        this.componentsStatus[tag] = exports.ComponentStatus.Updated;
        Object.keys(data).forEach(function (key) { return _this.components[tag][key] = data[key]; });
        this.componentClasses[tag] = componentClass;
        this.emit("setComponent", { componentClass: componentClass, tag: tag, component: component, entity: this });
        return this.components[tag];
    };
    Entity.prototype.removeComponent = function (componentClass) {
        var tag = componentClass.tag || componentClass.name;
        var component = this.components[tag];
        if (!component) {
            return;
        }
        if (!castComponent(component, componentClass)) {
            throw new Error("There are multiple classes with the same tag or name \"" + tag + "\".\nAdd a different property \"tag\" to one of them.");
        }
        if (this.firstCommitted && !this.componentsPrev[tag]) {
            this.componentsPrev[tag] = this.components[tag];
        }
        delete this.components[tag];
        this.componentsStatus[tag] = exports.ComponentStatus.Removed;
        this.emit("removeComponent", { componentClass: componentClass, tag: tag, component: component, entity: this });
    };
    Entity.prototype.getPrevComponent = function (componentClass) {
        var tag = componentClass.tag || componentClass.name;
        var component = this.componentsPrev[tag];
        if (!component) {
            throw new Error("Cannot get component \"" + tag + "\" from entity.");
        }
        if (!castComponent(component, componentClass)) {
            throw new Error("There are multiple classes with the same tag or name \"" + tag + "\".\nAdd a different property \"tag\" to one of them.");
        }
        return component;
    };
    Entity.prototype.hasPrevComponent = function (componentClass, existsCallback) {
        var tag = componentClass.tag || componentClass.name;
        var component = this.componentsPrev[tag];
        if (!component)
            return false;
        if (!castComponent(component, componentClass)) {
            throw new Error("There are multiple classes with the same tag or name \"" + tag + "\".\nAdd a different property \"tag\" to one of them.");
        }
        if (existsCallback) {
            existsCallback(component);
        }
        return true;
    };
    Entity.prototype.commit = function () {
        this.firstCommitted = true;
        if (Object.keys(this.componentsPrev).length || Object.keys(this.componentsStatus).length) {
            this.componentsPrev = {};
            this.componentsStatus = {};
            this.emit('updateComponents', { entity: this });
        }
    };
    Entity.prototype.getComponentStatus = function (componentClass) {
        var tag = componentClass.tag || componentClass.name;
        if (this.hasPrevComponent(componentClass) && this.componentsStatus[tag] === exports.ComponentStatus.Removed) {
            return exports.ComponentStatus.Removed;
        }
        if (!this.hasComponent(componentClass)) {
            return exports.ComponentStatus.NotFound;
        }
        var component = this.components[tag];
        if (!castComponent(component, componentClass)) {
            throw new Error("There are multiple classes with the same tag or name \"" + tag + "\".\nAdd a different property \"tag\" to one of them.");
        }
        if (!this.componentsStatus[tag]) {
            return exports.ComponentStatus.NoChanges;
        }
        return this.componentsStatus[tag];
    };
    return Entity;
}(EventEmitter));

var Family = /** @class */ (function () {
    function Family(engine, included, excluded, created, updated, removed) {
        var _this = this;
        this.entities = [];
        // Optimisation
        this.removedEntities = {};
        this.updatedEntities = {};
        this.hasRemovedEntities = false;
        this.hasUpdatedEntities = false;
        this.engine = engine;
        this.included = included;
        this.excluded = excluded;
        this.created = created;
        this.updated = updated;
        this.removed = removed;
        this.engine.on("entityAdded", function (entity) {
            if (_this.isIncludedEntity(entity)) {
                _this.entities.push(entity);
            }
        });
        this.engine.on("entityRemoved", function (entity) {
            _this.removedEntities[entity.getId()] = entity;
            _this.hasRemovedEntities = true;
        });
        this.engine.on("entityUpdated", function (entity) {
            _this.updatedEntities[entity.getId()] = entity;
            _this.hasUpdatedEntities = true;
        });
        this.entities = this.engine.getEntities().filter(this.isIncludedEntity.bind(this));
    }
    Family.prototype.getEntities = function () {
        var _this = this;
        if (this.hasRemovedEntities || this.hasUpdatedEntities) {
            this.entities = this.entities.reduce(function (acc, e) {
                if (_this.hasRemovedEntities && _this.removedEntities[e.getId()]) {
                    return acc;
                }
                if (_this.updatedEntities[e.getId()]) {
                    if (!_this.isIncludedEntity(e)) {
                        return acc;
                    }
                    delete _this.updatedEntities[e.getId()];
                }
                acc.push(e);
                return acc;
            }, []);
            if (this.hasUpdatedEntities) {
                Object.values(this.updatedEntities).forEach(function (entity) {
                    if (_this.isIncludedEntity(entity)) {
                        _this.entities.push(entity);
                    }
                });
            }
            this.updatedEntities = {};
            this.removedEntities = {};
            this.hasRemovedEntities = false;
            this.hasUpdatedEntities = false;
        }
        return this.entities;
    };
    Family.prototype.isIncludedEntity = function (entity) {
        if (this.included.some(function (type) { return (!entity.hasComponent(type)); })) {
            return false;
        }
        if (this.excluded.some(function (type) { return (entity.hasComponent(type)); })) {
            return false;
        }
        if (this.created.some(function (type) { return (entity.getComponentStatus(type) !== exports.ComponentStatus.Created); })) {
            return false;
        }
        if (this.updated.some(function (type) { return (entity.getComponentStatus(type) !== exports.ComponentStatus.Updated); })) {
            return false;
        }
        if (this.removed.some(function (type) { return (entity.getComponentStatus(type) !== exports.ComponentStatus.Removed); })) {
            return false;
        }
        return true;
    };
    return Family;
}());

var Engine = /** @class */ (function (_super) {
    __extends(Engine, _super);
    function Engine() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.entities = [];
        _this.removingEntities = [];
        _this.systems = [];
        _this.families = {};
        _this.nextEntityId = 1;
        _this.onEntityUpdate = function (data) {
            _this.emit("entityUpdated", data.entity);
        };
        return _this;
    }
    Engine.prototype.getEntities = function () {
        return this.entities;
    };
    Engine.prototype.addEntity = function (entity) {
        this.entities.push(entity);
        this.emit("entityAdded", entity);
        entity.on("setComponent", this.onEntityUpdate);
        entity.on("removeComponent", this.onEntityUpdate);
        entity.on("updateComponents", this.onEntityUpdate);
    };
    Engine.prototype.removeEntity = function (entity) {
        entity.listComponentsWithTypes().forEach(function (_a) {
            var type = _a.type;
            entity.removeComponent(type);
        });
        entity.removeListener("setComponent", this.onEntityUpdate);
        entity.removeListener("removeComponent", this.onEntityUpdate);
        entity.removeListener("updateComponents", this.onEntityUpdate);
        this.removingEntities.push(entity);
    };
    Engine.prototype.addSystem = function (system) {
        system.onAttach(this);
        this.systems.push({ loop: 0, system: system });
    };
    Engine.prototype.getSystems = function () {
        return this.systems.map(function (s) { return s.system; });
    };
    Engine.prototype.update = function (delta) {
        var _this = this;
        this.emit("beforeUpdate", this);
        this.systems.forEach(function (s) { return s.system.execute(_this, delta); });
        this.entities = this.entities.filter(function (entity) {
            if (_this.removingEntities.includes(entity)) {
                _this.emit("entityRemoved", entity);
                return false;
            }
            entity.commit();
            return true;
        });
        this.emit("afterUpdate", this);
    };
    Engine.prototype.createFamily = function () {
        var components = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            components[_i] = arguments[_i];
        }
        var key = '';
        var include = [];
        var exclude = [];
        var created = [];
        var updated = [];
        var removed = [];
        for (var _a = 0, components_1 = components; _a < components_1.length; _a++) {
            var c = components_1[_a];
            if (typeof c === "object") {
                if (c.hasOwnProperty('not')) {
                    exclude.push(c['not']);
                }
                else if (c.hasOwnProperty('created')) {
                    created.push(c['created']);
                }
                else if (c.hasOwnProperty('updated')) {
                    updated.push(c['updated']);
                }
                else if (c.hasOwnProperty('removed')) {
                    removed.push(c['removed']);
                }
            }
            else {
                include.push(c);
            }
        }
        key += 'i:' + include.map(function (c) { return c.tag || c.name; }).join(',');
        key += 'e:' + exclude.map(function (c) { return c.tag || c.name; }).join(',');
        key += 'c:' + created.map(function (c) { return c.tag || c.name; }).join(',');
        key += 'u:' + updated.map(function (c) { return c.tag || c.name; }).join(',');
        key += 'r:' + removed.map(function (c) { return c.tag || c.name; }).join(',');
        if (!this.families[key]) {
            this.families[key] = new Family(this, include, exclude, created, updated, removed);
        }
        return this.families[key];
    };
    Engine.prototype.createNextEntity = function () {
        return new Entity(this.nextEntityId++);
    };
    return Engine;
}(EventEmitter));

exports.Created = Created;
exports.Engine = Engine;
exports.Entity = Entity;
exports.EntityCompositeCollection = EntityCompositeCollection;
exports.EventEmitter = EventEmitter;
exports.Family = Family;
exports.Not = Not;
exports.Removed = Removed;
exports.Updated = Updated;
exports.castComponent = castComponent;
exports.composeCollections = composeCollections;
