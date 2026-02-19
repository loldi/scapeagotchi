/**
 * Renders text using the Monogram bitmap font format.
 * Font data: each char maps to 12 rows of 5-bit values (0-31).
 * Glyph size: 5×12px, 6px advance per character.
 */

export default class MonogramText extends Phaser.GameObjects.Graphics {
  static CHAR_WIDTH = 5;
  static CHAR_HEIGHT = 12;
  static CHAR_SPACING = 6;

  constructor(scene, x, y, text, fontData, color = 0xffffff) {
    super(scene, { x, y });
    scene.add.existing(this);
    this.setDepth(0);
    this._text = '';
    this._fontData = fontData || {};
    this._color = color;
    if (text) this.setText(text);
  }

  setText(text) {
    if (this._text === String(text)) return this;
    this._text = String(text);
    this.redraw();
    return this;
  }

  setColor(color) {
    if (this._color === color) return this;
    this._color = color;
    this.redraw();
    return this;
  }

  redraw() {
    this.clear();
    if (!this._text) return;

    const data = this._fontData;
    let x = 0;

    for (let i = 0; i < this._text.length; i++) {
      const char = this._text[i];
      const rows = data[char] || data['?'] || data[' '] || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      for (let row = 0; row < 12; row++) {
        const bits = rows[row] || 0;
        const drawY = 11 - row; // Font data row 0 = visual bottom; flip for canvas
        for (let col = 0; col < 5; col++) {
          if (bits & (1 << (4 - col))) {
            this.fillStyle(this._color, 1);
            this.fillRect(x + (4 - col), drawY, 1, 1); // Mirror x: font bit order is right-to-left
          }
        }
      }
      x += MonogramText.CHAR_SPACING;
    }
  }

  get width() {
    return this._text.length * MonogramText.CHAR_SPACING;
  }

  get height() {
    return MonogramText.CHAR_HEIGHT;
  }
}
