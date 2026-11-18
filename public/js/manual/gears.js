import { MOTOR_RPM, MOTOR_COLORS, gearAnswer } from '/shared/modules/gears.js';
import { swatch, ident, needs, steps, example, warn, mark } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  const motor = MOTOR_COLORS.map((c) => `<tr><td class="nowrap">${swatch(c, L)}</td><td class="center"><b>${MOTOR_RPM[c]}</b></td></tr>`).join('');
  // Örnek oyunun kendi hesabıyla doğrulanır
  const ex = { motor: 'red', teeth: [12, 20, 8, 30], links: ['mesh', 'belt', 'mesh'] };
  const exAns = gearAnswer(ex, { serial: 'BC12D7', batteryHolders: [], indicators: [], portPlates: [] });
  const arrow = exAns.dir === 'cw' ? '↻' : '↺';
  return `
    ${ident(
      L,
      tr
        ? 'Solda lambalı bir motor, yan yana 3–4 dişli (her birinin üstünde diş sayısı), altta <b>↻/↺ ve bir sayı</b> yazan dört düğme.'
        : 'A motor with a lamp on the left, 3–4 gears side by side (each showing its tooth count), and four buttons with <b>↻/↺ and a number</b>.'
    )}
    ${needs(L, 'gears')}
    <p>${
      tr
        ? `Görev: ${mark('en sağdaki dişlinin')} hangi yöne (↻ saat yönü, ↺ tersi) ve dakikada kaç devirle döndüğünü bulmak. İmhacı ikisini birlikte yazan düğmeye basar.`
        : `Goal: find which way (↻ clockwise, ↺ anticlockwise) and how many revolutions per minute ${mark('the rightmost gear')} turns. The defuser presses the button showing both.`
    }</p>
    ${steps(
      tr
        ? [
            `<b>Motor:</b> hızı lambanın rengine göre tablodadır. Motor ${mark('saat yönünde')} döner; seri numarasında ${mark('sesli harf varsa tersine')}. En soldaki dişli motorla aynı yön ve hızda döner.`,
            `<b>Yön:</b> dişleri birbirine ${mark('değen')} dişliler zıt yöne döner. ${mark('Düz kayış')} yönü korur, ${mark('çapraz kayış')} (X) çevirir.`,
            `<b>Hız:</b> bağlı iki dişlide ${mark('hız × diş sayısı')} aynıdır. 12 dişli 60 devirle dönüyorsa, ona bağlı 24 dişli 60 × 12 ÷ 24 = 30 devirle döner.`,
            'Soldan sağa dişli dişli ilerleyin; her bağlantıyı imhacıya sorun: "değiyor mu, düz kayış mı, çapraz kayış mı?"',
          ]
        : [
            `<b>Motor:</b> its speed depends on the lamp colour (table). It turns ${mark('clockwise')}; if the serial ${mark('has a vowel, anticlockwise')}. The leftmost gear turns exactly like the motor.`,
            `<b>Direction:</b> gears whose teeth ${mark('touch')} turn opposite ways. A ${mark('straight belt')} keeps the direction, a ${mark('crossed belt')} (X) reverses it.`,
            `<b>Speed:</b> for two connected gears, ${mark('speed × teeth')} is equal. A 12-tooth gear at 60 rpm turns a connected 24-tooth gear at 60 × 12 ÷ 24 = 30 rpm.`,
            'Work left to right, gear by gear; ask about every link: "touching, straight belt or crossed belt?"',
          ]
    )}
    <table class="rules narrow"><thead><tr><th>${tr ? 'Motor lambası' : 'Motor lamp'}</th><th class="center">${tr ? 'Devir / dakika' : 'rpm'}</th></tr></thead><tbody>${motor}</tbody></table>
    ${example(
      L,
      tr
        ? `Lamba kırmızı (60), sesli harf yok → motor ↻. Dişliler: <b>12</b> –değiyor– <b>20</b> –düz kayış– <b>8</b> –değiyor– <b>30</b>.<br>
           Yön: değiyor → ↺, düz kayış → ↺, değiyor → ↻.<br>
           Hız: 60 × 12 = 720 → 20 dişli 36 devir; 36 × 20 = 720 → 8 dişli 90 devir; 90 × 8 = 720 → 30 dişli <b>24</b> devir. → <b>${arrow} ${exAns.rpm}</b>`
        : `Lamp red (60), no vowel → motor ↻. Gears: <b>12</b> –touching– <b>20</b> –straight belt– <b>8</b> –touching– <b>30</b>.<br>
           Direction: touching → ↺, straight belt → ↺, touching → ↻.<br>
           Speed: 60 × 12 = 720 → 20-tooth at 36 rpm; 36 × 20 = 720 → 8-tooth at 90; 90 × 8 = 720 → 30-tooth at <b>24</b>. → <b>${arrow} ${exAns.rpm}</b>`
    )}
    ${warn(
      L,
      tr
        ? ['Örnekteki 720’ye dikkat edin; işinizi kısaltabilir.', 'Düğmelerde aynı sayının iki yönü ve sık yapılan hatalardan çıkan yanlış hızlar vardır. Yanlış düğme hata yazdırır.']
        : ['Notice the 720 in the example; it may save you work.', 'The buttons hold both directions of a number and speeds from common mistakes. A wrong button causes a strike.']
    )}`;
};
