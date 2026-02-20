/**
 * Shared item icon creation for inventory/panels.
 */

export function createItemIcon(scene, itemId) {
  const container = scene.add.container(0, 0);
  const g = scene.add.graphics();
  const s = 12;

  switch (itemId) {
    case 'raw_chicken':
      g.fillStyle(0xcc9966, 1);
      g.fillEllipse(0, 2, s * 1.4, s * 0.9);
      g.lineStyle(1, 0x996633);
      g.strokeEllipse(0, 2, s * 1.4, s * 0.9);
      g.fillStyle(0xeeddcc, 1);
      g.fillEllipse(s * 0.9, 2, s * 0.5, s * 0.6);
      g.lineStyle(1, 0xccbbaa);
      g.strokeEllipse(s * 0.9, 2, s * 0.5, s * 0.6);
      break;
    case 'bones': {
      g.fillStyle(0xeeddcc, 1);
      g.lineStyle(1, 0xccbbaa);
      const lobe = s * 0.3;
      const shaftW = s * 0.24;
      g.fillEllipse(-s * 0.68, -lobe * 0.35, lobe * 1.15, lobe);
      g.fillEllipse(-s * 0.68, lobe * 0.35, lobe * 1.15, lobe);
      g.strokeEllipse(-s * 0.68, -lobe * 0.35, lobe * 1.15, lobe);
      g.strokeEllipse(-s * 0.68, lobe * 0.35, lobe * 1.15, lobe);
      g.fillEllipse(s * 0.68, -lobe * 0.35, lobe * 1.15, lobe);
      g.fillEllipse(s * 0.68, lobe * 0.35, lobe * 1.15, lobe);
      g.strokeEllipse(s * 0.68, -lobe * 0.35, lobe * 1.15, lobe);
      g.strokeEllipse(s * 0.68, lobe * 0.35, lobe * 1.15, lobe);
      g.fillRoundedRect(-s * 0.55, -shaftW / 2, s * 1.1, shaftW, 3);
      g.strokeRoundedRect(-s * 0.55, -shaftW / 2, s * 1.1, shaftW, 3);
      break;
    }
    case 'feathers':
      g.fillStyle(0xf5f5f0, 1);
      g.fillEllipse(-s * 0.3, 0, s * 1.1, s * 1.4);
      g.lineStyle(1, 0xddddcc);
      g.strokeEllipse(-s * 0.3, 0, s * 1.1, s * 1.4);
      g.lineStyle(2, 0xbbaa99);
      g.lineBetween(-s * 0.3, -s * 1.2, -s * 0.3, s * 1.2);
      break;
    case 'egg':
      g.fillStyle(0xfaf8f0, 1);
      g.fillEllipse(0, 0, s * 0.8, s * 1.0);
      g.lineStyle(1, 0xddddcc);
      g.strokeEllipse(0, 0, s * 0.8, s * 1.0);
      break;
    case 'bronze_pickaxe':
      g.fillStyle(0x8b7355, 1);
      g.fillRect(-s * 0.3, -s * 1.2, s * 0.2, s * 2.2);
      g.fillStyle(0xcd7f32, 1);
      g.fillRect(-s * 0.9, s * 0.3, s * 1.4, s * 0.2);
      g.fillRect(-s * 0.85, s * 0.5, s * 0.25, s * 0.6);
      g.fillRect(s * 0.6, s * 0.5, s * 0.25, s * 0.6);
      break;
    case 'copper_ore':
      g.fillStyle(0xb87333, 1);
      g.fillEllipse(0, 0, s * 1.0, s * 0.8);
      g.lineStyle(1, 0x8b5a2b);
      g.strokeEllipse(0, 0, s * 1.0, s * 0.8);
      break;
    case 'tin_ore':
      g.fillStyle(0x808090, 1);
      g.fillEllipse(0, 0, s * 1.0, s * 0.8);
      g.lineStyle(1, 0x606070);
      g.strokeEllipse(0, 0, s * 1.0, s * 0.8);
      break;
    case 'bronze_bar':
      g.fillStyle(0xcd7f32, 1);
      g.fillRoundedRect(-s * 0.9, -s * 0.3, s * 1.8, s * 0.6, 2);
      g.lineStyle(1, 0x8b5a2b);
      g.strokeRoundedRect(-s * 0.9, -s * 0.3, s * 1.8, s * 0.6, 2);
      break;
    case 'bronze_dagger':
      g.fillStyle(0x8b7355, 1);
      g.fillRect(-s * 0.15, -s * 1.2, s * 0.3, s * 2.2);
      g.fillStyle(0xcd7f32, 1);
      g.fillTriangle(-s * 0.5, s * 1.0, 0, s * 1.4, s * 0.5, s * 1.0);
      g.fillRect(-s * 0.5, s * 0.8, s * 1.0, s * 0.3);
      break;
    case 'bronze_cap':
      g.fillStyle(0xcd7f32, 1);
      g.fillEllipse(0, -s * 0.2, s * 1.1, s * 0.7);
      g.lineStyle(1, 0x8b5a2b);
      g.strokeEllipse(0, -s * 0.2, s * 1.1, s * 0.7);
      g.fillStyle(0x8b7355, 0.5);
      g.fillRect(-s * 0.9, s * 0.2, s * 1.8, s * 0.5);
      break;
    case 'bronze_shorts':
      g.fillStyle(0xcd7f32, 1);
      g.fillRoundedRect(-s * 0.9, -s * 0.3, s * 1.8, s * 1.2, 2);
      g.lineStyle(1, 0x8b5a2b);
      g.strokeRoundedRect(-s * 0.9, -s * 0.3, s * 1.8, s * 1.2, 2);
      break;
    case 'bronze_round_shield':
      g.fillStyle(0xcd7f32, 1);
      g.fillCircle(0, 0, s * 1.1);
      g.lineStyle(1, 0x8b5a2b);
      g.strokeCircle(0, 0, s * 1.1);
      g.fillStyle(0x8b7355, 0.8);
      g.fillCircle(0, 0, s * 0.3);
      break;
    default:
      g.fillStyle(0x666688, 0.8);
      g.fillRoundedRect(-s * 0.8, -s * 0.8, s * 1.6, s * 1.6, 2);
  }
  container.add(g);
  return container;
}
