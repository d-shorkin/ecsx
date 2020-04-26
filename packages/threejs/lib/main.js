'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ecsx/core');
var three = require('three');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var ThreeRenderer = /** @class */ (function (_super) {
    __extends(ThreeRenderer, _super);
    function ThreeRenderer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.options = { antialias: true };
        _this.size = new three.Vector2();
        return _this;
    }
    ThreeRenderer.prototype.getRenderer = function () {
        if (!this.getEntity().hasComponent(core.Renderer)) {
            this.getEntity().removeComponent(ThreeRenderer);
            return null;
        }
        var component = this.getEntity().getComponent(core.Renderer);
        if (!this.renderer) {
            this.renderer = new three.WebGLRenderer();
        }
        if (this.container !== component.container) {
            if (this.container) {
                this.container.removeChild(this.renderer.domElement);
            }
            if (component.container) {
                component.container.appendChild(this.renderer.domElement);
            }
            this.container = component.container;
        }
        this.renderer.getSize(this.size);
        if (this.size.x !== component.width || this.size.y !== component.height) {
            this.renderer.setSize(component.width, component.height);
        }
        return this.renderer;
    };
    ThreeRenderer.prototype.setOptions = function (options) {
        this.options = options;
        if (this.renderer && this.container) {
            this.container.removeChild(this.renderer.domElement);
        }
        delete this.renderer;
        delete this.container;
    };
    ThreeRenderer.prototype.destroy = function () {
        if (this.container && this.renderer) {
            this.container.removeChild(this.renderer.domElement);
        }
    };
    return ThreeRenderer;
}(core.Component));

var ThreeScene = /** @class */ (function (_super) {
    __extends(ThreeScene, _super);
    function ThreeScene() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.scene = null;
        return _this;
    }
    ThreeScene.prototype.getScene = function () {
        if (!this.getEntity().hasComponent(core.Scene)) {
            this.getEntity().removeComponent(ThreeScene);
            return null;
        }
        if (!this.scene) {
            this.scene = new three.Scene();
            var hemiLight = new three.HemisphereLight(0xffffff, 0xffffff, 0.6);
            hemiLight.color.setHSL(0.6, 1, 0.6);
            hemiLight.groundColor.setHSL(0.095, 1, 0.75);
            hemiLight.position.set(0, 50, 0);
            this.scene.add(hemiLight);
            var dirLight = new three.DirectionalLight(0xffffff, 1);
            dirLight.color.setHSL(0.1, 1, 0.95);
            dirLight.position.set(-1, 1.75, 1);
            dirLight.position.multiplyScalar(30);
            this.scene.add(dirLight);
        }
        return this.scene;
    };
    return ThreeScene;
}(core.Component));

var ThreeCamera = /** @class */ (function (_super) {
    __extends(ThreeCamera, _super);
    function ThreeCamera() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ThreeCamera.prototype.getCamera = function () {
        if (!this.getEntity().hasComponent(core.Camera)) {
            this.getEntity().removeComponent(ThreeCamera);
            return null;
        }
        var component = this.getEntity().getComponent(core.Camera);
        this.createCameras(component);
        if (component.hasAnyUpdates('perspective', 'fov', 'near', 'aspect', 'far')) {
            if (component.perspective) {
                this.perspectiveCamera.fov = component.fov;
                this.perspectiveCamera.aspect = component.aspect;
                this.perspectiveCamera.near = component.near;
                this.perspectiveCamera.far = component.far;
                this.perspectiveCamera.updateProjectionMatrix();
            }
            else {
                this.orthographicCamera.left = component.fov * component.aspect / -2;
                this.orthographicCamera.right = component.fov * component.aspect / 2;
                this.orthographicCamera.top = component.fov / 2;
                this.orthographicCamera.bottom = component.fov / -2;
                this.orthographicCamera.near = component.near;
                this.orthographicCamera.far = component.far;
                this.orthographicCamera.updateProjectionMatrix();
            }
        }
        if (component.perspective) {
            return this.perspectiveCamera;
        }
        else {
            return this.orthographicCamera;
        }
    };
    ThreeCamera.prototype.createCameras = function (component) {
        if (component.perspective) {
            if (!this.perspectiveCamera) {
                this.perspectiveCamera = new three.PerspectiveCamera(component.fov, component.aspect, component.near, component.far);
            }
        }
        else if (!this.orthographicCamera) {
            this.orthographicCamera = new three.OrthographicCamera(component.fov * component.aspect / -2, component.fov * component.aspect / 2, component.fov / 2, component.fov / -2, component.near, component.far);
        }
    };
    return ThreeCamera;
}(core.Component));

var tmpVector2 = new three.Vector2();
var RendererSystem = /** @class */ (function () {
    function RendererSystem(options) {
        this.options = __assign({ antialias: true }, options);
    }
    RendererSystem.prototype.onAttach = function (engine) {
        this.newObjects = new core.CompositeFamily(engine.createFamily(core.Renderer, core.Not(ThreeRenderer)), engine.createFamily(core.Scene, core.Not(ThreeScene)), engine.createFamily(core.Camera, core.Not(ThreeCamera)));
        this.renderers = engine.createFamily(core.Renderer, ThreeRenderer);
        this.cameras = engine.createFamily(core.Camera, ThreeCamera);
    };
    RendererSystem.prototype.execute = function (engine, delta) {
        this.newObjects.getEntities().forEach(function (e) {
            if (e.hasComponent(core.Renderer)) {
                e.addComponent(ThreeRenderer);
            }
            if (e.hasComponent(core.Scene)) {
                e.addComponent(ThreeScene);
            }
            if (e.hasComponent(core.Camera)) {
                e.addComponent(ThreeCamera);
            }
        });
        this.cameras.getEntities().forEach(function (e) {
            var cam = e.getComponent(ThreeCamera).getCamera();
            if (cam && e.hasComponent(core.Transform)) {
                cam.position.x = e.getComponent(core.Transform).positionX;
                cam.position.y = e.getComponent(core.Transform).positionY;
                cam.position.z = e.getComponent(core.Transform).positionZ;
                cam.rotation.x = e.getComponent(core.Transform).rotationX;
                cam.rotation.y = e.getComponent(core.Transform).rotationY;
                cam.rotation.z = e.getComponent(core.Transform).rotationZ;
                cam.scale.x = e.getComponent(core.Transform).scaleX;
                cam.scale.y = e.getComponent(core.Transform).scaleY;
                cam.scale.z = e.getComponent(core.Transform).scaleZ;
            }
        });
        this.renderers.getEntities().forEach(function (entity) {
            var renderer = entity.getComponent(ThreeRenderer).getRenderer();
            if (!renderer) {
                return;
            }
            entity.getComponent(core.Renderer).items.forEach(function (_a) {
                var camera = _a.camera, scene = _a.scene;
                if (!scene.getEntity().hasComponent(ThreeScene) || !camera.getEntity().hasComponent(ThreeCamera)) {
                    return;
                }
                var threeScene = scene.getEntity().getComponent(ThreeScene).getScene();
                var threeCamera = camera.getEntity().getComponent(ThreeCamera).getCamera();
                if (threeScene && threeCamera) {
                    renderer.render(threeScene, threeCamera);
                }
            });
        });
    };
    return RendererSystem;
}());

function getScene(e) {
    if (!e.hasComponent(core.RootScene) ||
        !e.getComponent(core.RootScene).scene ||
        !e.getComponent(core.RootScene).scene.getEntity().hasComponent(ThreeScene)) {
        return null;
    }
    return e.getComponent(core.RootScene).scene.getEntity().getComponent(ThreeScene).getScene();
}

var Mesh = /** @class */ (function (_super) {
    __extends(Mesh, _super);
    function Mesh() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.scene = null;
        return _this;
    }
    Mesh.prototype.getMesh = function () {
        this.update();
        return this.mesh;
    };
    Mesh.prototype.update = function () {
        if (!this.geometry || !this.material) {
            throw new Error('geometry and material property is required');
        }
        if (!this.mesh) {
            this.mesh = new three.Mesh(this.geometry, this.material);
        }
        var scene = getScene(this.getEntity());
        if (scene !== this.scene) {
            if (this.scene) {
                this.scene.remove(this.mesh);
            }
            if (scene) {
                scene.add(this.mesh);
            }
            this.scene = scene;
        }
        if ((this.mesh.geometry !== this.geometry || this.mesh.material !== this.material)) {
            var newMesh = new three.Mesh(this.geometry, this.material);
            if (this.scene) {
                this.scene.remove(this.mesh);
                this.scene.add(newMesh);
            }
            this.mesh = newMesh;
        }
    };
    Mesh.prototype.destroy = function () {
        if (!this.mesh) {
            return;
        }
        if (this.scene) {
            this.scene.remove(this.mesh);
        }
    };
    return Mesh;
}(core.Component));

var MeshSystem = /** @class */ (function () {
    function MeshSystem() {
    }
    MeshSystem.prototype.onAttach = function (engine) {
        this.meshes = engine.createFamily(Mesh, core.RootScene);
    };
    MeshSystem.prototype.execute = function (engine, delta) {
        this.meshes.getEntities().forEach(function (e) {
            var mesh = e.getComponent(Mesh).getMesh();
            if (e.hasComponent(core.Transform)) {
                var transform = e.getComponent(core.Transform);
                mesh.position.x = transform.getWorld("positionX");
                mesh.position.y = transform.getWorld("positionY");
                mesh.position.z = transform.getWorld("positionZ");
                mesh.rotation.x = transform.getWorld("rotationX");
                mesh.rotation.y = transform.getWorld("rotationY");
                mesh.rotation.z = transform.getWorld("rotationZ");
                mesh.scale.x = transform.getWorld("scaleX");
                mesh.scale.y = transform.getWorld("scaleY");
                mesh.scale.z = transform.getWorld("scaleZ");
            }
        });
    };
    return MeshSystem;
}());

exports.Mesh = Mesh;
exports.MeshSystem = MeshSystem;
exports.RendererSystem = RendererSystem;
exports.ThreeCamera = ThreeCamera;
exports.ThreeRenderer = ThreeRenderer;
exports.ThreeScene = ThreeScene;
exports.getScene = getScene;
