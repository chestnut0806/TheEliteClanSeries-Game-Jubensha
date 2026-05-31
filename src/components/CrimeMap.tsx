import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoomRect {
  id: string;
  label: string;
  sublabel?: string;
  x: number; y: number; w: number; h: number;
  fill: string;
  stroke: string;
  isKey?: boolean;
}

interface Connection {
  from: [number, number];
  to: [number, number];
  dashed?: boolean;
  label?: string;
  color?: string;
}

interface Marker {
  id: string;
  x: number; y: number;
  type: 'body' | 'evidence' | 'key-evidence';
  label: string;
}

const W = 800;
const H = 500;

const ROOMS: (RoomRect & { description: string; evidence: Marker[] })[] = [
  {
    id: 'corridor', label: '8楼走廊', sublabel: '电梯在左端',
    description: '顶层走廊——红绒地毯，黄铜壁灯。电梯在走廊东端，防火楼梯在西端。消火栓玻璃有裂缝——万能钥匙曾藏于此。',
    x: 30, y: 390, w: 430, h: 80,
    fill: '#faf6f0', stroke: '#c4b5a5',
    evidence: [],
  },
  {
    id: 'main_door', label: '801正门', sublabel: '发现时自内闩死',
    description: '套房正门。发现尸体时此门自内闩死——内侧为一道木制滑动门闩。门闩表面有数道浅而细的划痕。门缝底部嵌有极细的白色纤维。电梯员在21:05听到走廊方向传来一声短促的"咔嗒"声。',
    x: 120, y: 340, w: 100, h: 50,
    fill: '#faf0f0', stroke: '#c44', isKey: true,
    evidence: [
      { id: 'mk_bolt_d', x: 155, y: 355, type: 'key-evidence' as const, label: '★ 门闩划痕' },
      { id: 'mk_thread_d', x: 155, y: 375, type: 'key-evidence' as const, label: '★ 棉线纤维' },
    ],
  },
  {
    id: 'living', label: '801 客厅', sublabel: '方仲远套房 · 宴会厅',
    description: '顶层套房客厅。水晶吊灯低垂，波斯地毯上散落着打翻的酒水。订婚宴在此举行——方仲远在此饮下毒酒。沙发垫下发现了马维仁的左轮手枪（哑弹）。',
    x: 50, y: 140, w: 280, h: 200,
    fill: '#fdf9f2', stroke: '#b8a590',
    evidence: [],
  },
  {
    id: 'bedroom', label: '801 卧室', sublabel: '方仲远卧室 · 尸体发现处',
    description: '方仲远的私人卧室。丝绒窗帘半掩——窗外黄浦江船灯隐约可辨。遗体倒在壁炉旁——后脑有撞击伤，壁炉大理石边角残留暗色印迹。床垫下发现一支玻璃注射器和一份侦探报告。床头柜上摆有三只药瓶，排列整齐。',
    x: 360, y: 60, w: 220, h: 220,
    fill: '#fef8f5', stroke: '#b8a590',
    evidence: [],
  },
  {
    id: 'connecting', label: '连接门', sublabel: '801↔802 未锁',
    description: '连接801卧室与802化妆间的内门。锁具老旧——表面有锈迹。案发后此门虚掩，未锁。沈若兰当晚曾从此门通过。',
    x: 580, y: 200, w: 80, h: 80,
    fill: '#fef5f5', stroke: '#c88', isKey: true,
    evidence: [],
  },
  {
    id: 'dressing', label: '802 化妆间', sublabel: '沈若兰暂住 · 躲藏处',
    description: '沈若兰的化妆间兼更衣室。梳妆台、衣架、首饰盒。案发后沈若兰在此躲藏约一小时——直到被众人发现。首饰盒夹层中藏有育婴堂信件和"林先生"字条。',
    x: 660, y: 200, w: 120, h: 120,
    fill: '#fdf9f6', stroke: '#b8a590',
    evidence: [],
  },
  {
    id: 'pantry', label: '配餐间', sublabel: '毒药准备处',
    description: '套房附带的小型备餐间。料理台上散落厨具——研钵翻倒，周围有白色细粒。储物柜深处有一只棕色皮制旧医疗箱。水槽内壁有一层未冲净的薄渍。',
    x: 30, y: 30, w: 150, h: 100,
    fill: '#faf8f0', stroke: '#c4a860',
    evidence: [],
  },
  {
    id: 'terrace', label: '露台', sublabel: '俯瞰黄浦江',
    description: '半月形露台，可俯瞰黄浦江。栀子花花盆下藏有哑弹弹壳和威胁信。两只烟蒂在栏杆上——一只染深红唇印（柳如烟），一只无唇印（马维仁？）。两人在此交谈过的痕迹。',
    x: 510, y: 20, w: 130, h: 40,
    fill: '#f6faf8', stroke: '#a0b8b0',
    evidence: [],
  },
];

const CONNECTIONS: Connection[] = [
  // Main door → corridor
  { from: [170, 340], to: [170, 390], label: '正门入口' },
  // Living room → bedroom
  { from: [330, 200], to: [360, 200], label: '室内通道' },
  // Bedroom → connecting door
  { from: [580, 220], to: [580, 200] },
  // Connecting door → dressing room
  { from: [660, 240], to: [660, 200], dashed: true, label: '连接门（密室通道）', color: '#c44' },
  // Pantry → living
  { from: [100, 130], to: [100, 140] },
  // Terrace → bedroom/living side
  { from: [580, 60], to: [580, 45] },
  // Elevator at corridor left
  { from: [30, 430], to: [30, 390], label: '电梯' },
  // Fire stairs at corridor right
  { from: [460, 430], to: [460, 390], label: '防火楼梯' },
  // Connecting door → living (path through)
  { from: [500, 280], to: [500, 340] },
];

const MARKERS: { roomId: string; marker: Marker }[] = [
  { roomId: 'bedroom', marker: { id: 'mk_body', x: 520, y: 240, type: 'body', label: '▉ 方仲远遗体' } },
  { roomId: 'bedroom', marker: { id: 'mk_blood', x: 540, y: 245, type: 'evidence', label: '壁炉血迹' } },
  { roomId: 'bedroom', marker: { id: 'mk_syringe', x: 440, y: 170, type: 'key-evidence', label: '★ 注射器' } },
  { roomId: 'bedroom', marker: { id: 'mk_pills', x: 410, y: 140, type: 'evidence', label: '药瓶' } },
  { roomId: 'living', marker: { id: 'mk_wine', x: 200, y: 250, type: 'key-evidence', label: '★ 破碎酒杯' } },
  { roomId: 'living', marker: { id: 'mk_gun', x: 120, y: 260, type: 'evidence', label: '沙发垫下手枪' } },
  { roomId: 'pantry', marker: { id: 'mk_mortar', x: 80, y: 70, type: 'key-evidence', label: '★ 研钵残渣' } },
  { roomId: 'pantry', marker: { id: 'mk_medkit', x: 150, y: 90, type: 'key-evidence', label: '旧医疗箱' } },
  { roomId: 'pantry', marker: { id: 'mk_salt', x: 100, y: 90, type: 'evidence', label: '洒落的盐' } },
  { roomId: 'main_door', marker: { id: 'mk_bolt', x: 170, y: 355, type: 'key-evidence', label: '★ 门闩划痕' } },
  { roomId: 'main_door', marker: { id: 'mk_thread', x: 170, y: 375, type: 'key-evidence', label: '★ 棉线纤维' } },
  { roomId: 'corridor', marker: { id: 'mk_elev_log', x: 280, y: 420, type: 'evidence', label: '电梯记录' } },
  { roomId: 'corridor', marker: { id: 'mk_key', x: 380, y: 420, type: 'key-evidence', label: '消火栓·钥匙' } },
  { roomId: 'terrace', marker: { id: 'mk_cig', x: 570, y: 35, type: 'evidence', label: '烟蒂' } },
  { roomId: 'terrace', marker: { id: 'mk_flower', x: 590, y: 45, type: 'key-evidence', label: '花盆·弹壳' } },
  { roomId: 'dressing', marker: { id: 'mk_hairpin_origin', x: 690, y: 230, type: 'evidence', label: '发簪来源' } },
  { roomId: 'dressing', marker: { id: 'mk_jewelry', x: 730, y: 270, type: 'evidence', label: '首饰盒信件' } },
];

interface Props {
  highlightedRoom?: string;
}

export function CrimeMap({ highlightedRoom }: Props) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const selectedRoom = ROOMS.find(r => r.id === selectedRoomId);
  const selectedMarkers = MARKERS.filter(m => m.roomId === selectedRoomId);

  return (
    <div className="paper-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🗺️</span>
          <span className="text-sm font-title font-bold text-ink">案发现场平面图</span>
          <span className="text-[10px] text-sepia-light/60 font-ui">华懋饭店 8 楼 · 点击房间查看详情</span>
        </div>
        <div className="flex gap-3 text-[10px] font-ui text-sepia-light">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-vermilion/10 border border-vermilion/30 rounded-sm" /> 密室关键</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-vermilion" /> 关键证据</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brass/50" /> 线索</span>
          <span className="flex items-center gap-1"><span className="text-vermilion font-bold">✕</span> 遗体</span>
        </div>
      </div>

      {/* SVG Map */}
      <div className="relative w-full bg-cream/40 border border-sepia-light/15 rounded-lg overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ minHeight: '400px' }}>
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#c4b5a5" strokeWidth="0.3" opacity="0.3" />
            </pattern>
            <filter id="shadow">
              <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="#3a2a1a" floodOpacity="0.1" />
            </filter>
          </defs>
          <rect width={W} height={H} fill="url(#grid)" />

          {/* Title/compass */}
          <text x={W - 20} y={18} textAnchor="end" className="text-[10px]" fill="#9a8a7a" fontFamily="ui-monospace">↑ 北 · 外滩方向 →</text>

          {/* Connections */}
          {CONNECTIONS.map((c, i) => (
            <g key={`conn-${i}`}>
              <line
                x1={c.from[0]} y1={c.from[1]} x2={c.to[0]} y2={c.to[1]}
                stroke={c.color || '#b8a590'}
                strokeWidth={c.dashed ? 1.5 : 2}
                strokeDasharray={c.dashed ? '6,4' : undefined}
                opacity={0.7}
              />
              {c.label && (
                <text
                  x={(c.from[0] + c.to[0]) / 2 + 6}
                  y={(c.from[1] + c.to[1]) / 2 - 4}
                  fontSize="8" fill={c.color || '#9a8a7a'} fontFamily="ui-monospace"
                >
                  {c.label}
                </text>
              )}
            </g>
          ))}

          {/* 801 Suite boundary (dashed outline grouping living + bedroom) */}
          <rect
            x={46} y={56} width={538} height={288}
            fill="none"
            stroke="#6a5a4a" strokeWidth="1.5" strokeDasharray="12,6"
            opacity="0.25" rx="4"
          />
          <text x={56} y={66} fontSize="9" fill="#6a5a4a" opacity="0.4" fontFamily="serif">801 方仲远套房</text>

          {/* Rooms */}
          {ROOMS.map(room => (
            <g
              key={room.id}
              className="cursor-pointer transition-all duration-200"
              onClick={() => setSelectedRoomId(room.id === selectedRoomId ? null : room.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Room rect */}
              <rect
                x={room.x} y={room.y} width={room.w} height={room.h}
                rx={4} ry={4}
                fill={room.fill}
                stroke={selectedRoomId === room.id ? '#8b0000' : (highlightedRoom === room.id ? '#a44' : room.stroke)}
                strokeWidth={selectedRoomId === room.id ? 2.5 : (room.isKey ? 1.5 : 1)}
                filter={selectedRoomId === room.id ? 'url(#shadow)' : undefined}
                opacity={highlightedRoom && highlightedRoom !== room.id ? 0.5 : 1}
              />

              {/* Room label */}
              <text
                x={room.x + room.w / 2}
                y={room.y + room.h / 2 - (room.sublabel ? 6 : 0)}
                textAnchor="middle"
                fontSize={room.id === 'connecting' ? 9 : 10}
                fontWeight="bold"
                fill={room.isKey ? '#a33' : '#3a2a1a'}
                fontFamily="serif"
              >
                {room.label}
              </text>
              {room.sublabel && (
                <text
                  x={room.x + room.w / 2}
                  y={room.y + room.h / 2 + 8}
                  textAnchor="middle"
                  fontSize="7"
                  fill="#9a8a7a"
                  fontFamily="ui-monospace"
                >
                  {room.sublabel}
                </text>
              )}

            </g>
          ))}

          {/* Markers */}
          {MARKERS.map(({ roomId, marker }) => {
            const room = ROOMS.find(r => r.id === roomId);
            if (!room) return null;
            const isRoomSelected = selectedRoomId === roomId;
            const isAnySelected = selectedRoomId !== null;

            return (
              <g key={marker.id} opacity={isAnySelected && !isRoomSelected ? 0.4 : 1}>
                {marker.type === 'body' ? (
                  <>
                    {/* Body X mark */}
                    <line x1={marker.x - 8} y1={marker.y - 8} x2={marker.x + 8} y2={marker.y + 8}
                      stroke="#c00" strokeWidth="2.5" />
                    <line x1={marker.x + 8} y1={marker.y - 8} x2={marker.x - 8} y2={marker.y + 8}
                      stroke="#c00" strokeWidth="2.5" />
                    <text x={marker.x + 12} y={marker.y + 4}
                      fontSize="7" fill="#c00" fontWeight="bold" fontFamily="serif">
                      {marker.label}
                    </text>
                  </>
                ) : marker.type === 'key-evidence' ? (
                  <>
                    <circle cx={marker.x} cy={marker.y} r="3.5" fill="#c44" stroke="#fff" strokeWidth="1" />
                    <text x={marker.x + 6} y={marker.y + 4}
                      fontSize="6.5" fill="#a33" fontFamily="ui-monospace">
                      {marker.label}
                    </text>
                  </>
                ) : (
                  <>
                    <circle cx={marker.x} cy={marker.y} r="2.5" fill="#b8a060" stroke="#fff" strokeWidth="0.8" />
                    <text x={marker.x + 5} y={marker.y + 3.5}
                      fontSize="6.5" fill="#9a8a7a" fontFamily="ui-monospace">
                      {marker.label}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Entrance arrow for orientation */}
          <g transform="translate(265, 415)">
            <text fontSize="7" fill="#9a8a7a" fontFamily="ui-monospace">← 电梯间</text>
          </g>
          <g transform="translate(365, 415)">
            <text fontSize="7" fill="#9a8a7a" fontFamily="ui-monospace">防火楼梯 →</text>
          </g>
        </svg>

        {/* Selected room detail */}
        <AnimatePresence>
          {selectedRoom && (
            <motion.div
              className="m-3 p-4 border border-burgundy/15 bg-burgundy/[0.02] rounded-lg"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-title font-bold text-sm text-ink">{selectedRoom.label}</span>
                {selectedRoom.sublabel && <span className="text-[10px] text-sepia-light">— {selectedRoom.sublabel}</span>}
                <button
                  onClick={() => setSelectedRoomId(null)}
                  className="ml-auto text-[10px] text-sepia-light/40 hover:text-sepia"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-sepia leading-relaxed">{selectedRoom.description}</p>
              {selectedMarkers.length > 0 && (
                <div className="mt-2 pt-2 border-t border-sepia-light/10">
                  <div className="text-[10px] font-ui text-ink mb-1">证据标记：</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {selectedMarkers.map(m => (
                      <div key={m.marker.id} className="text-xs text-sepia-light flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          m.marker.type === 'body' ? 'w-2 h-2 bg-transparent border border-vermilion relative after:content-[""] after:absolute after:inset-0 after:bg-vermilion after:rotate-45' :
                          m.marker.type === 'key-evidence' ? 'bg-vermilion' : 'bg-brass/50'
                        }`} />
                        {m.marker.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
