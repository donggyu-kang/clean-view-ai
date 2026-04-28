export function Ico({ name, size = 16, color = 'currentColor', strokeWidth = 1.6 }) {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const p = { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }

  const paths = {
    chat:       <svg style={s} viewBox="0 0 24 24"><path {...p} d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    memory:     <svg style={s} viewBox="0 0 24 24"><ellipse {...p} cx="12" cy="5" rx="9" ry="3"/><path {...p} d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path {...p} d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>,
    chart:      <svg style={s} viewBox="0 0 24 24"><line {...p} x1="18" y1="20" x2="18" y2="10"/><line {...p} x1="12" y1="20" x2="12" y2="4"/><line {...p} x1="6" y1="20" x2="6" y2="14"/></svg>,
    sparkle:    <svg style={s} viewBox="0 0 24 24"><path {...p} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle {...p} cx="12" cy="12" r="3"/></svg>,
    warning:    <svg style={s} viewBox="0 0 24 24"><path {...p} d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line {...p} x1="12" y1="9" x2="12" y2="13"/><line {...p} x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    check:      <svg style={s} viewBox="0 0 24 24"><polyline {...p} points="20 6 9 17 4 12"/></svg>,
    search:     <svg style={s} viewBox="0 0 24 24"><circle {...p} cx="11" cy="11" r="8"/><line {...p} x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    block:      <svg style={s} viewBox="0 0 24 24"><circle {...p} cx="12" cy="12" r="10"/><line {...p} x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
    inbox:      <svg style={s} viewBox="0 0 24 24"><polyline {...p} points="22 12 16 12 14 15 10 15 8 12 2 12"/><path {...p} d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
    cpu:        <svg style={s} viewBox="0 0 24 24"><rect {...p} x="9" y="9" width="6" height="6"/><rect {...p} x="2" y="2" width="20" height="20" rx="2"/><line {...p} x1="9" y1="2" x2="9" y2="6"/><line {...p} x1="15" y1="2" x2="15" y2="6"/><line {...p} x1="9" y1="18" x2="9" y2="22"/><line {...p} x1="15" y1="18" x2="15" y2="22"/><line {...p} x1="2" y1="9" x2="6" y2="9"/><line {...p} x1="2" y1="15" x2="6" y2="15"/><line {...p} x1="18" y1="9" x2="22" y2="9"/><line {...p} x1="18" y1="15" x2="22" y2="15"/></svg>,
    zap:        <svg style={s} viewBox="0 0 24 24"><polygon {...p} points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    clock:      <svg style={s} viewBox="0 0 24 24"><circle {...p} cx="12" cy="12" r="10"/><polyline {...p} points="12 6 12 12 16 14"/></svg>,
    file:       <svg style={s} viewBox="0 0 24 24"><path {...p} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline {...p} points="14 2 14 8 20 8"/><line {...p} x1="16" y1="13" x2="8" y2="13"/><line {...p} x1="16" y1="17" x2="8" y2="17"/></svg>,
    eye:        <svg style={s} viewBox="0 0 24 24"><path {...p} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle {...p} cx="12" cy="12" r="3"/></svg>,
    plus:       <svg style={s} viewBox="0 0 24 24"><line {...p} x1="12" y1="5" x2="12" y2="19"/><line {...p} x1="5" y1="12" x2="19" y2="12"/></svg>,
    chevDown:   <svg style={s} viewBox="0 0 24 24"><polyline {...p} points="6 9 12 15 18 9"/></svg>,
    arrowRight: <svg style={s} viewBox="0 0 24 24"><line {...p} x1="5" y1="12" x2="19" y2="12"/><polyline {...p} points="12 5 19 12 12 19"/></svg>,
    close:      <svg style={s} viewBox="0 0 24 24"><line {...p} x1="18" y1="6" x2="6" y2="18"/><line {...p} x1="6" y1="6" x2="18" y2="18"/></svg>,
    link:       <svg style={s} viewBox="0 0 24 24"><path {...p} d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path {...p} d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    send:       <svg style={s} viewBox="0 0 24 24"><line {...p} x1="22" y1="2" x2="11" y2="13"/><polygon {...p} points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    logout:     <svg style={s} viewBox="0 0 24 24"><path {...p} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline {...p} points="16 17 21 12 16 7"/><line {...p} x1="21" y1="12" x2="9" y2="12"/></svg>,
  }

  return paths[name] ?? null
}
