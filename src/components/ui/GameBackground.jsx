export default function GameBackground({ children, className = "" }) {
    return (
        <div className="relative w-full h-full min-h-[100dvh] bg-slate-900 overflow-hidden font-sans select-none">
            {/* 3D Grid Floor */}
            <div
                className="absolute inset-0 origin-bottom pointer-events-none"
                style={{
                    transform: 'perspective(1000px) rotateX(20deg) scale(1.5)',
                    background: `
            linear-gradient(to bottom, transparent 0%, rgba(14, 165, 233, 0.05) 100%),
            linear-gradient(rgba(14, 165, 233, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14, 165, 233, 0.05) 1px, transparent 1px)
          `,
                    backgroundSize: '100% 100%, 60px 60px, 60px 60px',
                    backgroundPosition: 'center bottom'
                }}
            />

            {/* Ambient Glows */}
            <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Content */}
            <div className={`relative z-10 w-full h-full ${className}`}>
                {children}
            </div>
        </div>
    );
}
