// BASINÇ VANASI (sürekli ilgi ister): Devreye girince basınç 0'dan 100'e yükselir. Göstergede
// yeşil bir bölge var. TAHLİYE düğmesine basınç yeşil bölgedeyken basılmalı. Erken basmak ya da
// 100'e ulaşmasına izin vermek hata yazdırır. Kılavuz gerektirmez; dikkat ister.

export const PRESSURE_ZONE = 16;
const TOLERANCE = 2; // gecikme payı (yüzde puanı)

export default {
  type: 'pressure',
  needy: true,
  activeFor: 30000,
  generate() {
    return { active: false, zone: null };
  },
  activate(s, rng) {
    s.active = true;
    const start = rng.int(38, 72);
    s.zone = [start, start + PRESSURE_ZONE];
  },
  view(s) {
    return { active: s.active, zone: s.active ? s.zone.slice() : null, durationMs: this.activeFor };
  },
  action(s, a, ctx) {
    if (!s.active || !a || !a.vent) return {};
    const p = (ctx.needyProgress || 0) * 100;
    const ok = p >= s.zone[0] - TOLERANCE && p <= s.zone[1] + TOLERANCE;
    return ok ? { deactivate: true } : { strike: true, deactivate: true };
  },
};
