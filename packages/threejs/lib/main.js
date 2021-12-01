'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ecsx/core');
var THREE = require('three');

var Renderer = /** @class */ (function () {
    function Renderer() {
    }
    Renderer.tag = 'ThreeJs/Renderer';
    return Renderer;
}());
var Scene = /** @class */ (function () {
    function Scene() {
    }
    Scene.tag = 'ThreeJs/Scene';
    return Scene;
}());
var Camera = /** @class */ (function () {
    function Camera() {
    }
    Camera.tag = 'ThreeJs/Camera';
    return Camera;
}());
var Object3D = /** @class */ (function () {
    function Object3D() {
    }
    Object3D.tag = 'ThreeJs/Object3D';
    return Object3D;
}());
var ParentObject3D = /** @class */ (function () {
    function ParentObject3D() {
    }
    ParentObject3D.tag = 'ThreeJs/ParentObject3D';
    return ParentObject3D;
}());
var Raycast = /** @class */ (function () {
    function Raycast() {
    }
    Raycast.tag = 'ThreeJs/Raycast';
    return Raycast;
}());

var RendererSystem = /** @class */ (function () {
    function RendererSystem() {
    }
    RendererSystem.prototype.onAttach = function (engine) {
        this.updatedObjects = new core.EntityCompositeCollection(new core.EntityCompositeCollection(engine.createFamily(core.Created(Object3D), ParentObject3D), engine.createFamily(core.Updated(Object3D), ParentObject3D)), new core.EntityCompositeCollection(engine.createFamily(Object3D, core.Created(ParentObject3D)), engine.createFamily(Object3D, core.Updated(ParentObject3D))));
        this.removedObjects = engine.createFamily(core.Removed(Object3D));
        this.removedParent = engine.createFamily(core.Removed(ParentObject3D), Object3D);
        this.renderers = engine.createFamily(Renderer, Scene, Camera);
    };
    RendererSystem.prototype.execute = function (engine, delta) {
        this.updatedObjects.getEntities().forEach(function (entity) {
            var prevParent = entity.hasPrevComponent(ParentObject3D) ? entity.getPrevComponent(ParentObject3D) : entity.getComponent(ParentObject3D);
            var prevObject = entity.hasPrevComponent(Object3D) ? entity.getPrevComponent(Object3D) : entity.getComponent(Object3D);
            prevParent.object3D.remove(prevObject.object3D);
            entity.getComponent(ParentObject3D).object3D.add(entity.getComponent(Object3D).object3D);
        });
        this.removedObjects.getEntities().forEach(function (entity) {
            var parent = entity.getPrevComponent(Object3D).object3D.parent;
            if (parent) {
                parent.remove(entity.getPrevComponent(Object3D).object3D);
            }
        });
        this.removedParent.getEntities().forEach(function (entity) {
            entity.getPrevComponent(ParentObject3D).object3D.remove(entity.getComponent(Object3D).object3D);
        });
        this.renderers.getEntities().forEach(function (entity) {
            entity
                .getComponent(Renderer)
                .renderer
                .render(entity.getComponent(Scene).scene, entity.getComponent(Camera).camera);
        });
    };
    return RendererSystem;
}());

var MouseRaycastSystem = /** @class */ (function () {
    function MouseRaycastSystem() {
    }
    MouseRaycastSystem.prototype.onAttach = function (engine) {
        var _this = this;
        this.raycaster = new THREE.Raycaster();
        this.renderers = engine.createFamily(Renderer, Scene, Camera);
        this.objects = engine.createFamily(Object3D);
        this.renderers.getEntities().forEach(function (e) {
            e.getComponent(Renderer).renderer.domElement.onclick = function (event) {
                var _a = e.getComponent(Renderer).renderer.domElement, offsetWidth = _a.offsetWidth, offsetHeight = _a.offsetHeight;
                var cords = {
                    x: event.offsetX / offsetWidth * 2 - 1,
                    y: -event.offsetY / offsetHeight * 2 + 1
                };
                _this.raycaster.setFromCamera(cords, e.getComponent(Camera).camera);
                var intersects = _this.raycaster.intersectObjects(_this.objects.getEntities().map(function (e) { return e.getComponent(Object3D).object3D; }), true);
                e.setComponent(Raycast, { entities: _this.objects.getEntities().filter(function (e) { return !!intersects.find(function (i) { return i.object === e.getComponent(Object3D).object3D; }); }) });
            };
        });
    };
    MouseRaycastSystem.prototype.execute = function (engine, delta) {
    };
    return MouseRaycastSystem;
}());

exports.Camera = Camera;
exports.MouseRaycastSystem = MouseRaycastSystem;
exports.Object3D = Object3D;
exports.ParentObject3D = ParentObject3D;
exports.Raycast = Raycast;
exports.Renderer = Renderer;
exports.RendererSystem = RendererSystem;
exports.Scene = Scene;
