const base = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
export const SearchIcon = () => <svg {...base}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
export const PlusIcon = () => <svg {...base}><path d="M12 5v14M5 12h14" /></svg>;
export const ChevronIcon = ({ open }: { open: boolean }) => <svg {...base} style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform .2s" }}><path d="m6 9 6 6 6-6" /></svg>;
export const CheckIcon = () => <svg {...base} width={16} height={16} strokeWidth={3}><path d="m5 12 5 5L20 7" /></svg>;
export const CloseIcon = () => <svg {...base}><path d="M18 6 6 18M6 6l12 12" /></svg>;
export const BackIcon = () => <svg {...base}><path d="m15 18-6-6 6-6" /></svg>;
export const TrashIcon = () => <svg {...base}><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" /></svg>;
export const ClockIcon = () => <svg {...base} width={14} height={14}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
