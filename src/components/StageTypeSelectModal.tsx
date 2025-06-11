import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface StageTypeSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: 'basic' | 't' | 'arch' | 'round') => void;
}

const stageTypes = [
  { key: 'basic', label: '기본형', color: 0x3b82f6 },
  { key: 't', label: 'T자형', color: 0x6366f1 },
  { key: 'arch', label: '아치형', color: 0x10b981 },
  { key: 'round', label: '원형', color: 0xf59e42 },
] as const;

type StageTypeKey = typeof stageTypes[number]['key'];

const StageTypeSelectModal: React.FC<StageTypeSelectModalProps> = ({ open, onClose, onSelect }) => {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    // Render a simple 3D preview for each stage type
    stageTypes.forEach((type, idx) => {
      const canvas = canvasRefs.current[idx];
      if (!canvas) return;
      // Clean up previous renderer if any
      (canvas as any)._renderer && (canvas as any)._renderer.dispose && (canvas as any)._renderer.dispose();
      canvas.width = 180;
      canvas.height = 120;
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      (canvas as any)._renderer = renderer;
      renderer.setClearColor(0xffffff, 0);
      renderer.setSize(180, 120, false);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 180 / 120, 0.1, 100);
      camera.position.set(2, 2, 4);
      camera.lookAt(0, 0, 0);
      // Light
      const ambient = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambient);
      const dir = new THREE.DirectionalLight(0xffffff, 0.7);
      dir.position.set(2, 5, 2);
      scene.add(dir);
      // Geometry for preview
      let mesh: THREE.Mesh | THREE.Group;
      switch (type.key) {
        case 'basic':
          mesh = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.4, 1.5),
            new THREE.MeshStandardMaterial({ color: type.color })
          );
          break;
        case 't': {
          const group = new THREE.Group();
          group.add(new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.4, 1.0),
            new THREE.MeshStandardMaterial({ color: type.color })
          ));
          const tBar = new THREE.Mesh(
            new THREE.BoxGeometry(1.0, 0.4, 0.5),
            new THREE.MeshStandardMaterial({ color: type.color })
          );
          tBar.position.set(0, 0, 0.75);
          group.add(tBar);
          mesh = group;
          break;
        }
        case 'arch': {
          // 반원형 무대 생성
          const archRadius = 1.25;
          const archGeometry = new THREE.CylinderGeometry(archRadius, archRadius, 0.4, 32, 1, false, 0, Math.PI);
          mesh = new THREE.Mesh(archGeometry, new THREE.MeshStandardMaterial({ color: type.color }));
          // 반원형 무대를 올바른 방향으로 회전
          mesh.rotation.y = Math.PI / 2;
          break;
        }
        case 'round':
          mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(1.0, 1.0, 0.4, 32),
            new THREE.MeshStandardMaterial({ color: type.color })
          );
          break;
        default:
          mesh = new THREE.Mesh();
      }
      scene.add(mesh);
      renderer.render(scene, camera);
      // Clean up on close
      return () => {
        renderer.dispose();
      };
    });
    // eslint-disable-next-line
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 min-w-[400px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">무대 타입 선택</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {stageTypes.map((type, idx) => (
            <button
              key={type.key}
              className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-500 transition-all bg-gray-50"
              onClick={() => onSelect(type.key as StageTypeKey)}
            >
              <canvas
                ref={el => (canvasRefs.current[idx] = el)}
                style={{ width: 180, height: 120, borderRadius: 8, background: '#f3f4f6' }}
              />
              <span className="mt-2 font-semibold text-gray-800">{type.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StageTypeSelectModal;
