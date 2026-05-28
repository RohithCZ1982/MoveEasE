export default function TruckLoader() {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="240" height="100" viewBox="0 0 240 100" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes truckBounce {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-5px); }
          }
          @keyframes wheelSpin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes roadScroll {
            from { transform: translateX(0px); }
            to   { transform: translateX(-70px); }
          }
          @keyframes smokePuff {
            0%         { opacity: 0.7; transform: translateY(0px) scale(1); }
            100%       { opacity: 0;   transform: translateY(-12px) scale(1.6); }
          }
          .truck-g       { animation: truckBounce 0.75s ease-in-out infinite; }
          .wheel-rear    { transform-box: fill-box; transform-origin: center; animation: wheelSpin 0.9s linear infinite; }
          .wheel-front   { transform-box: fill-box; transform-origin: center; animation: wheelSpin 0.9s linear infinite; }
          .road-lines    { animation: roadScroll 0.9s linear infinite; }
          .smoke1        { animation: smokePuff 1.0s ease-out infinite 0.0s; }
          .smoke2        { animation: smokePuff 1.0s ease-out infinite 0.3s; }
          .smoke3        { animation: smokePuff 1.0s ease-out infinite 0.6s; }
        `}</style>

        {/* Full truck bounces together */}
        <g className="truck-g">
          {/* Cargo trailer */}
          <rect x="4"   y="8"  width="138" height="54" rx="5" fill="#1e3a5f"/>
          <rect x="8"   y="12" width="130" height="46" rx="3" fill="#1e40af" opacity="0.2"/>
          <text x="73"  y="38" textAnchor="middle" fill="white"   fontSize="11" fontFamily="Helvetica-Bold" fontWeight="bold">Move EasE</text>
          <text x="73"  y="51" textAnchor="middle" fill="#93c5fd" fontSize="7.5" fontFamily="Helvetica">PACKERS &amp; MOVERS</text>

          {/* Cab body */}
          <rect x="142" y="18" width="72"  height="44" rx="5" fill="#1e3a5f"/>
          {/* Windshield */}
          <rect x="170" y="21" width="38"  height="28" rx="3" fill="#bfdbfe" opacity="0.85"/>
          {/* Front bumper */}
          <rect x="210" y="44" width="8"   height="18" rx="2" fill="#1e40af"/>
          {/* Exhaust pipe */}
          <rect x="213" y="10" width="4"   height="22" rx="2" fill="#6b7280"/>

          {/* Rear wheel */}
          <g className="wheel-rear">
            <circle cx="44" cy="72" r="15" fill="#111827"/>
            <circle cx="44" cy="72" r="9"  fill="#374151"/>
            <line x1="44" y1="57" x2="44" y2="87" stroke="#6b7280" strokeWidth="2.5"/>
            <line x1="29" y1="72" x2="59" y2="72" stroke="#6b7280" strokeWidth="2.5"/>
            <line x1="33" y1="61" x2="55" y2="83" stroke="#6b7280" strokeWidth="1.5"/>
            <line x1="55" y1="61" x2="33" y2="83" stroke="#6b7280" strokeWidth="1.5"/>
            <circle cx="44" cy="72" r="3.5" fill="#9ca3af"/>
          </g>

          {/* Front wheel */}
          <g className="wheel-front">
            <circle cx="178" cy="72" r="15" fill="#111827"/>
            <circle cx="178" cy="72" r="9"  fill="#374151"/>
            <line x1="178" y1="57" x2="178" y2="87" stroke="#6b7280" strokeWidth="2.5"/>
            <line x1="163" y1="72" x2="193" y2="72" stroke="#6b7280" strokeWidth="2.5"/>
            <line x1="167" y1="61" x2="189" y2="83" stroke="#6b7280" strokeWidth="1.5"/>
            <line x1="189" y1="61" x2="167" y2="83" stroke="#6b7280" strokeWidth="1.5"/>
            <circle cx="178" cy="72" r="3.5" fill="#9ca3af"/>
          </g>
        </g>

        {/* Exhaust smoke (outside bounce group so it drifts up independently) */}
        <circle className="smoke1" cx="215" cy="9"  r="3.5" fill="#d1d5db"/>
        <circle className="smoke2" cx="218" cy="7"  r="3"   fill="#d1d5db"/>
        <circle className="smoke3" cx="216" cy="5"  r="2.5" fill="#d1d5db"/>

        {/* Static road base */}
        <rect x="0" y="87" width="240" height="3" rx="1.5" fill="#e5e7eb"/>

        {/* Scrolling road dashes */}
        <g className="road-lines">
          <rect x="5"   y="92" width="35" height="3" rx="1.5" fill="#d1d5db"/>
          <rect x="75"  y="92" width="35" height="3" rx="1.5" fill="#d1d5db"/>
          <rect x="145" y="92" width="35" height="3" rx="1.5" fill="#d1d5db"/>
          <rect x="215" y="92" width="35" height="3" rx="1.5" fill="#d1d5db"/>
          <rect x="285" y="92" width="35" height="3" rx="1.5" fill="#d1d5db"/>
        </g>
      </svg>
      <p className="text-sm text-gray-500 font-medium">Loading…</p>
    </div>
  )
}
