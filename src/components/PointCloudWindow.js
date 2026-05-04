import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function PointCloudWindow({ wsUrl, isCameraOn  }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101214);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.01,
      200
    );

    camera.position.set(0, -2.2, 1.4);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 1.2);
    controls.enableDamping = true;

    const grid = new THREE.GridHelper(10, 20, 0x3a4248, 0x252b30);
    grid.rotation.x = Math.PI / 2;
    scene.add(grid);

    const material = new THREE.PointsMaterial({
      size: 0.015,
      vertexColors: true,
      sizeAttenuation: true,
    });

    let cloud = null;
    let socket = null;
    let animationId = null;

    const setCloud = (buffer) => {
      const data = new Float32Array(buffer);
      const count = Math.floor(data.length / 6);

      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      for (let i = 0, p = 0, c = 0; i < count; i++) {
        const offset = i * 6;

        positions[p++] = data[offset + 0];
        positions[p++] = -data[offset + 1];
        positions[p++] = -data[offset + 2];

        colors[c++] = data[offset + 3];
        colors[c++] = data[offset + 4];
        colors[c++] = data[offset + 5];
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3)
      );
      geometry.computeBoundingSphere();

      if (cloud) {
        cloud.geometry.dispose();
        cloud.geometry = geometry;
      } else {
        cloud = new THREE.Points(geometry, material);
        scene.add(cloud);
      }
    };

    socket = new WebSocket(wsUrl);
    socket.binaryType = "arraybuffer";

    socket.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        setCloud(event.data);
      }
    };

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (socket) socket.close();
      if (animationId) cancelAnimationFrame(animationId);

      window.removeEventListener("resize", handleResize);

      if (cloud) {
        cloud.geometry.dispose();
        cloud.material.dispose();
      }

      material.dispose();
      renderer.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [wsUrl, isCameraOn]);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#101214",
      }}
    />
  );
}