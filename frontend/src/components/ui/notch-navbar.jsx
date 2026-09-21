" use client\;

import React, { useState } from \react\;

/**
 * Notch Navbar Component (Adapted from VengeanceUI for Laguna Athletic)
 */
export function NotchNavbar({
 className = \\,
 logo,
 items = {
 left: [
 { label: \Inicio\, href: \#home\ },
 { label: \Control Diario\, href: \#control\ },
 { label: \Pizarra Táctica\, href: \#tactical\ },
 ],
 right: [
 { label: \Calendario\, href: \#calendar\ },
 { label: \Pagos\, href: \#payments\ },
 { label: \Avisos\, href: \#notices\ },
 ],
 },
 ...props
}) {
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

 return (
 <>
 <header
 className={
otch-navbar-header fixed top-0 inset-x-0 z-50 h-16 flex px-0 }
 {...props}
 >
 {/* Left Side Bar */}
 <div className=\flex-1 h-10 bg-slate-950/90 backdrop-blur z-20 relative min-w-0 border-b border-sky-500/20\>
 <svg className=\absolute inset-0 w-full h-full pointer-events-none\ preserveAspectRatio=\none\>
 <line x1=\0\ y1=\39.5\ x2=\100%\ y2=\39.5\ stroke=\rgba 56 189 248 0.25 \ strokeWidth=\1\ />
 <line x1=\0\ y1=\36.5\ x2=\100%\ y2=\36.5\ stroke=\rgba 251 191 36 0.25 \ strokeWidth=\0.8\ />
 </svg>
 </div>

 {/* Notch Container */}
 <div className=\flex h-16 relative z-10 shrink-0 -ml-px\>
 {/* Left Slice */}
 <div className=\w-[50px] h-full relative shrink-0\>
 <div
 className=\absolute inset-0 bg-slate-950/90 backdrop-blur\
 style={{ clipPath: \path M0 0 H50 V64 C25 64 25 40 0 40 Z \ }}
 />
 <svg className=\absolute inset-0 w-full h-full pointer-events-none\ viewBox=\0 0 50 64\>
 <path d=\M0 39.5 C25 39.5 25 63.5 50 63.5\ fill=\none\ stroke=\rgba 56 189 248 0.35 \ strokeWidth=\1\ />
 <path d=\M0 36.5 C25 36.5 25 60.5 50 60.5\ fill=\none\ stroke=\rgba 251 191 36 0.25 \ strokeWidth=\0.8\ />
 </svg>
 </div>

 {/* Center Slice */}
 <div className=\flex-1 h-full relative min-w-0 -ml-px\>
 <div className=\absolute inset-0 bg-slate-950/90 backdrop-blur border-b border-sky-500/20\>
 <svg className=\absolute inset-0 w-full h-full pointer-events-none\ preserveAspectRatio=\none\>
 <line x1=\0\ y1=\63.5\ x2=\100%\ y2=\63.5\ stroke=\rgba 56 189 248 0.35 \ strokeWidth=\1\ />
 <line x1=\0\ y1=\60.5\ x2=\100%\ y2=\60.5\ stroke=\rgba 251 191 36 0.25 \ strokeWidth=\0.8\ />
 </svg>
 </div>

 <div className=\relative w-full h-full flex items-end justify-between pb-2 px-4 md:px-8 gap-4\>
 {/* Desktop Left Nav */}
 <nav className=\hidden md:flex gap-6 mb-1 shrink-0 items-center\>
 {items.left.map((item) => (
 <a
 key={item.label}
 href={item.href}
 className=\text-xs uppercase tracking-wider font-bold text-slate-300 hover:text-sky-400 transition-colors\
 >
 {item.label}
 </a>
 ))}
 </nav>

 {/* Mobile Menu Button */}
 <button
 type=\button\
 className=\md:hidden mb-1 p-1 text-slate-300 hover:text-sky-400 transition-colors\
 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
 aria-label=\Toggle menu\
 >
 <svg className=\w-5 h-5\ fill=\none\ stroke=\currentColor\ viewBox=\0 0 24 24\>
 <path strokeLinecap=\round\ strokeLinejoin=\round\ strokeWidth=\2\ d=\M4 6h16M4 12h16M4 18h16\ />
 </svg>
 </button>

 {/* Logo / Crest */}
 <div className=\flex justify-center shrink-0 mx-2 md:mx-4\>
 {logo || (
 <img
 src=\./LAGUNA.jpg\
 alt=\Laguna Athletic\
 className=\w-9 h-9 rounded-full border-2 border-amber-400 shadow-lg object-cover\
 />
 )}
 </div>

 {/* Desktop Right Nav */}
 <nav className=\hidden md:flex gap-6 items-center shrink-0 mb-1\>
 {items.right.map((item) => (
 <a
 key={item.label}
 href={item.href}
 className=\text-xs uppercase tracking-wider font-bold text-slate-300 hover:text-sky-400 transition-colors\
 >
 {item.label}
 </a>
 ))}
 </nav>
 </div>
 </div>

 {/* Right Slice */}
 <div className=\w-[50px] h-full relative shrink-0 -ml-px\>
 <div
 className=\absolute inset-0 bg-slate-950/90 backdrop-blur\
 style={{ clipPath: \path M0 0 H50 V40 C25 40 25 64 0 64 Z \ }}
 />
 <svg className=\absolute inset-0 w-full h-full pointer-events-none\ viewBox=\0 0 50 64\>
 <path d=\M0 63.5 C25 63.5 25 39.5 50 39.5\ fill=\none\ stroke=\rgba 56 189 248 0.35 \ strokeWidth=\1\ />
 <path d=\M0 60.5 C25 60.5 25 36.5 50 36.5\ fill=\none\ stroke=\rgba 251 191 36 0.25 \ strokeWidth=\0.8\ />
 </svg>
 </div>
 </div>

 {/* Right Side Bar */}
 <div className=\flex-1 h-10 bg-slate-950/90 backdrop-blur z-20 relative min-w-0 -ml-px border-b border-sky-500/20\>
 <svg className=\absolute inset-0 w-full h-full pointer-events-none\ preserveAspectRatio=\none\>
 <line x1=\0\ y1=\39.5\ x2=\100%\ y2=\39.5\ stroke=\rgba 56 189 248 0.25 \ strokeWidth=\1\ />
 <line x1=\0\ y1=\36.5\ x2=\100%\ y2=\36.5\ stroke=\rgba 251 191 36 0.25 \ strokeWidth=\0.8\ />
 </svg>
 </div>
 </header>

 {/* Mobile Drawer */}
 {isMobileMenuOpen && (
 <div className=\fixed inset-x-0 top-16 z-40 bg-slate-950 border-b border-sky-500/20 p-4 md:hidden shadow-xl\>
 <nav className=\flex flex-col gap-2\>
 {[...items.left, ...items.right].map((item) => (
 <a
 key={item.label}
 href={item.href}
 className=\flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-200 font-semibold\
 onClick={() => setIsMobileMenuOpen(false)}
 >
 {item.label}
 </a>
 ))}
 </nav>
 </div>
 )}
 </>
 );
}

export default NotchNavbar;
