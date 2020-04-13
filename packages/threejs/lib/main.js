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

var ThreeJsObject = /** @class */ (function (_super) {
    __extends(ThreeJsObject, _super);
    function ThreeJsObject() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ThreeJsObject;
}(core.TagComponent));
var ThreeJsRenderingSystem = /** @class */ (function () {
    function ThreeJsRenderingSystem(scene) {
        this.objects = {};
        this.scene = scene;
    }
    ThreeJsRenderingSystem.prototype.onAttach = function (engine) {
        this.elements = engine.createFamily([ThreeJsObject]);
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
    };
    ThreeJsRenderingSystem.prototype.execute = function (engine, delta) {
        var _this = this;
        this.elements.getEntities().forEach(function (e) {
            if (!_this.objects[e.getId()]) {
                var geometry = new three.BoxGeometry(2, 2, 2);
                var material = new three.MeshStandardMaterial({ color: 0xFF6666 });
                var cube = new three.Mesh(geometry, material);
                _this.scene.add(cube);
                _this.objects[e.getId()] = cube;
            }
            var mesh = _this.objects[e.getId()];
            if (!e.hasComponent(core.Transform)) {
                return;
            }
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
        });
    };
    return ThreeJsRenderingSystem;
}());

exports.ThreeJsObject = ThreeJsObject;
exports.ThreeJsRenderingSystem = ThreeJsRenderingSystem;
