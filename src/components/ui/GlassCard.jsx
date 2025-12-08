export default function GlassCard({ children, className = "", hoverEffect = true, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`
        relative overflow-hidden
        backdrop-blur-md bg-slate-900/60 border border-white/10 shadow-xl
        rounded-xl transition-all duration-300
        ${hoverEffect ? 'hover:border-white/30 hover:shadow-cyan-500/20 hover:-translate-y-1 group cursor-pointer' : ''}
        ${className}
      `}
        >
            {/* Shimmer Effect on Hover */}
            {hoverEffect && (
                <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]" />
            )}

            {children}
        </div>
    );
}
