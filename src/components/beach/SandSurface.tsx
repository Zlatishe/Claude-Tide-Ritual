'use client';

export function SandSurface() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base sand color — dot texture is now handled by the interactive canvas */}
      <div className="absolute inset-0" style={{ backgroundColor: '#FFE3D5' }} />
    </div>
  );
}
