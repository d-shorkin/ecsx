'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ecsx/core');
var three = require('three');

var RendererSystem = /** @class */ (function () {
    function RendererSystem(renderersRepository, sceneRepository, cameraRepository) {
        this.renderers = core.NullFamily;
        this.renderersRepository = renderersRepository;
        this.sceneRepository = sceneRepository;
        this.cameraRepository = cameraRepository;
    }
    RendererSystem.prototype.onAttach = function (engine) {
        this.renderers = engine.createFamily(core.Renderer);
    };
    RendererSystem.prototype.execute = function (engine, delta) {
        var _this = this;
        this.renderers.getEntities().forEach(function (entity) {
            if (!_this.renderersRepository.hasBy(entity)) {
                return;
            }
            var renderer = _this.renderersRepository.getBy(entity);
            entity.getComponent(core.Renderer).items.forEach(function (_a) {
                var camera = _a.camera, scene = _a.scene;
                if (!_this.cameraRepository.hasBy(camera) || !_this.sceneRepository.hasBy(scene)) {
                    return;
                }
                renderer.render(_this.sceneRepository.getBy(scene), _this.cameraRepository.getBy(camera));
            });
        });
    };
    return RendererSystem;
}());

var Colliders2dDebugSystem = /** @class */ (function () {
    function Colliders2dDebugSystem(repository, z) {
        if (z === void 0) { z = 0; }
        this.repository = repository;
        this.z = z;
    }
    Colliders2dDebugSystem.prototype.onAttach = function (engine) {
        this.entities = engine.createFamily(core.Collider2d);
    };
    Colliders2dDebugSystem.prototype.execute = function (engine, delta) {
        var _this = this;
        this.entities.getEntities().forEach(function (e) {
            if (!_this.repository.hasBy(e)) {
                return;
            }
            var group = _this.repository.getBy(e).group;
            group.position.z = _this.z;
            if (!e.hasComponent(core.Transform)) {
                return;
            }
            var transform = e.getComponent(core.Transform);
            group.position.x = transform.getWorld("positionX");
            group.position.y = transform.getWorld("positionY");
            group.rotation.z = transform.getWorld("rotationZ");
            group.scale.x = transform.getWorld("scaleX");
            group.scale.y = transform.getWorld("scaleY");
        });
    };
    return Colliders2dDebugSystem;
}());

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

var Mesh = /** @class */ (function (_super) {
    __extends(Mesh, _super);
    function Mesh() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Mesh;
}(core.Component));

var Object3dTransformSystem = /** @class */ (function () {
    function Object3dTransformSystem(repository) {
        this.objects = core.NullFamily;
        this.repository = repository;
    }
    Object3dTransformSystem.prototype.onAttach = function (engine) {
        this.objects = new core.CompositeFamily(engine.createFamily(core.Camera), engine.createFamily(core.Scene), engine.createFamily(Mesh));
    };
    Object3dTransformSystem.prototype.execute = function (engine, delta) {
        var _this = this;
        this.objects.getEntities().forEach(function (e) {
            if (!e.hasComponent(core.Transform) || !_this.repository.hasBy(e)) {
                return;
            }
            var o = _this.repository.getBy(e);
            var transform = e.getComponent(core.Transform);
            o.position.x = transform.getWorld("positionX");
            o.position.y = transform.getWorld("positionY");
            o.position.z = transform.getWorld("positionZ");
            o.rotation.x = transform.getWorld("rotationX");
            o.rotation.y = transform.getWorld("rotationY");
            o.rotation.z = transform.getWorld("rotationZ");
            o.scale.x = transform.getWorld("scaleX");
            o.scale.y = transform.getWorld("scaleY");
            o.scale.z = transform.getWorld("scaleZ");
        });
    };
    return Object3dTransformSystem;
}());

var CameraWrapper = /** @class */ (function () {
    function CameraWrapper() {
    }
    return CameraWrapper;
}());
var CameraComparator = /** @class */ (function (_super) {
    __extends(CameraComparator, _super);
    function CameraComparator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.fuse = [core.Camera];
        return _this;
    }
    CameraComparator.prototype.create = function (entity) {
        return this.update(entity, new CameraWrapper());
    };
    CameraComparator.prototype.update = function (entity, obj) {
        var component = entity.getComponent(core.Camera);
        if (component.perspective) {
            if (!obj.perspectiveCamera) {
                obj.perspectiveCamera = new three.PerspectiveCamera(component.fov, component.aspect, component.near, component.far);
            }
            obj.camera = obj.perspectiveCamera;
        }
        else if (!obj.orthographicCamera) {
            obj.orthographicCamera = new three.OrthographicCamera(component.fov * component.aspect / -2, component.fov * component.aspect / 2, component.fov / 2, component.fov / -2, component.near, component.far);
        }
        else {
            obj.camera = obj.orthographicCamera;
        }
        if (component.hasAnyUpdates('perspective', 'fov', 'near', 'aspect', 'far')) {
            if (component.perspective) {
                obj.perspectiveCamera.fov = component.fov;
                obj.perspectiveCamera.aspect = component.aspect;
                obj.perspectiveCamera.near = component.near;
                obj.perspectiveCamera.far = component.far;
                obj.perspectiveCamera.updateProjectionMatrix();
            }
            else {
                obj.orthographicCamera.left = component.fov * component.aspect / -2;
                obj.orthographicCamera.right = component.fov * component.aspect / 2;
                obj.orthographicCamera.top = component.fov / 2;
                obj.orthographicCamera.bottom = component.fov / -2;
                obj.orthographicCamera.near = component.near;
                obj.orthographicCamera.far = component.far;
                obj.orthographicCamera.updateProjectionMatrix();
            }
        }
        return obj;
    };
    CameraComparator.prototype.destroy = function (entity, obj) {
        // do nothing ...
    };
    return CameraComparator;
}(core.Comparator));
var CameraRepository = /** @class */ (function () {
    function CameraRepository(comparator) {
        this.comparator = comparator;
    }
    CameraRepository.prototype.getAll = function () {
        return this.comparator.getAll().map(function (_a) {
            var entity = _a.entity, item = _a.item;
            return ({ entity: entity, item: item.camera });
        });
    };
    CameraRepository.prototype.getBy = function (entity) {
        return this.comparator.getBy(entity).camera;
    };
    CameraRepository.prototype.hasBy = function (entity) {
        return this.comparator.hasBy(entity);
    };
    return CameraRepository;
}());

var MeshComparator = /** @class */ (function (_super) {
    __extends(MeshComparator, _super);
    function MeshComparator(scenes) {
        var _this = _super.call(this) || this;
        _this.fuse = [Mesh, core.RootScene];
        _this.scenes = scenes;
        return _this;
    }
    MeshComparator.prototype.create = function (entity) {
        if (!entity.getComponent(core.RootScene).scene || !this.scenes.hasBy(entity.getComponent(core.RootScene).scene)) {
            return null;
        }
        var component = entity.getComponent(Mesh);
        var mesh = new three.Mesh(component.geometry, component.material);
        var scene = this.scenes.getBy(entity.getComponent(core.RootScene).scene);
        scene.add(mesh);
        return {
            mesh: mesh, scene: scene
        };
    };
    MeshComparator.prototype.update = function (entity, obj) {
        if (!entity.getComponent(core.RootScene).scene || !this.scenes.hasBy(entity.getComponent(core.RootScene).scene)) {
            return null;
        }
        var component = entity.getComponent(Mesh);
        if ((obj.mesh.geometry !== component.geometry || obj.mesh.material !== component.material)) {
            this.destroy(entity, obj);
            return this.create(entity);
        }
        var scene = this.scenes.getBy(entity.getComponent(core.RootScene).scene);
        if (obj.scene !== scene) {
            obj.scene.remove(obj.mesh);
            scene.add(obj.mesh);
            obj.scene = scene;
        }
        return obj;
    };
    MeshComparator.prototype.destroy = function (entity, obj) {
        obj.scene.remove(obj.mesh);
    };
    return MeshComparator;
}(core.Comparator));
var MeshRepository = /** @class */ (function () {
    function MeshRepository(comparator) {
        this.comparator = comparator;
    }
    MeshRepository.prototype.getAll = function () {
        return this.comparator.getAll().map(function (_a) {
            var item = _a.item, entity = _a.entity;
            return ({ entity: entity, item: item.mesh });
        });
    };
    MeshRepository.prototype.getBy = function (entity) {
        return this.comparator.getBy(entity).mesh;
    };
    MeshRepository.prototype.hasBy = function (entity) {
        return this.comparator.hasBy(entity);
    };
    return MeshRepository;
}());

var ExtendsWebGLRenderer = /** @class */ (function (_super) {
    __extends(ExtendsWebGLRenderer, _super);
    function ExtendsWebGLRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ExtendsWebGLRenderer;
}(three.WebGLRenderer));
var RendererComparator = /** @class */ (function (_super) {
    __extends(RendererComparator, _super);
    function RendererComparator(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.size = new three.Vector2();
        _this.fuse = [core.Renderer];
        _this.options = __assign({ antialias: true }, options);
        return _this;
    }
    RendererComparator.prototype.create = function (entity) {
        var renderer = entity.getComponent(core.Renderer);
        var r = new ExtendsWebGLRenderer(this.options);
        if (renderer.container) {
            r.currentDomContainer = renderer.container;
            r.currentDomContainer.appendChild(r.domElement);
        }
        r.setSize(renderer.width, renderer.height);
        return r;
    };
    RendererComparator.prototype.destroy = function (entity, obj) {
        if (obj.currentDomContainer) {
            obj.currentDomContainer.removeChild(obj.domElement);
        }
    };
    RendererComparator.prototype.update = function (entity, obj) {
        var renderer = entity.getComponent(core.Renderer);
        if (obj.currentDomContainer !== renderer.container) {
            if (obj.currentDomContainer) {
                obj.currentDomContainer.removeChild(obj.domElement);
            }
            if (renderer.container) {
                renderer.container.appendChild(obj.domElement);
            }
            obj.currentDomContainer = renderer.container;
        }
        obj.getSize(this.size);
        if (this.size.x !== renderer.width || this.size.y !== renderer.height) {
            obj.setSize(renderer.width, renderer.height);
        }
        return obj;
    };
    return RendererComparator;
}(core.Comparator));

var SceneComparator = /** @class */ (function (_super) {
    __extends(SceneComparator, _super);
    function SceneComparator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.fuse = [core.Scene];
        return _this;
    }
    SceneComparator.prototype.create = function (entity) {
        return new three.Scene();
    };
    SceneComparator.prototype.destroy = function (entity, obj) {
        // nothing...
    };
    SceneComparator.prototype.update = function (entity, obj) {
        return obj;
    };
    return SceneComparator;
}(core.Comparator));

var Collider2dComparator = /** @class */ (function (_super) {
    __extends(Collider2dComparator, _super);
    function Collider2dComparator(scenes) {
        var _this = _super.call(this) || this;
        _this.fuse = [core.Collider2d, core.RootScene];
        _this.scenes = scenes;
        return _this;
    }
    Collider2dComparator.prototype.create = function (entity) {
        if (!entity.getComponent(core.RootScene).scene || !this.scenes.hasBy(entity.getComponent(core.RootScene).scene)) {
            return null;
        }
        var scene = this.scenes.getBy(entity.getComponent(core.RootScene).scene);
        var items = entity.getComponent(core.Collider2d).vertices.map(function (item) { return (new three.BufferGeometry()).setFromPoints(item.map(function (_a) {
            var x = _a.x, y = _a.y;
            return new three.Vector2(x, y);
        })); });
        var group = new three.Group();
        items.forEach(function (item) { return group.add(new three.Line(item, new three.LineBasicMaterial({ color: 0xffffff }))); });
        scene.add(group);
        return { scene: scene, group: group };
    };
    Collider2dComparator.prototype.update = function (entity, obj) {
        if (!entity.getComponent(core.Collider2d).hasUpdate('vertices')) {
            return obj;
        }
        this.destroy(entity, obj);
        return this.create(entity);
    };
    Collider2dComparator.prototype.destroy = function (entity, obj) {
        obj.scene.remove(obj.group);
    };
    return Collider2dComparator;
}(core.Comparator));

exports.CameraComparator = CameraComparator;
exports.CameraRepository = CameraRepository;
exports.CameraWrapper = CameraWrapper;
exports.Collider2dComparator = Collider2dComparator;
exports.Colliders2dDebugSystem = Colliders2dDebugSystem;
exports.ExtendsWebGLRenderer = ExtendsWebGLRenderer;
exports.Mesh = Mesh;
exports.MeshComparator = MeshComparator;
exports.MeshRepository = MeshRepository;
exports.Object3dTransformSystem = Object3dTransformSystem;
exports.RendererComparator = RendererComparator;
exports.RendererSystem = RendererSystem;
exports.SceneComparator = SceneComparator;
