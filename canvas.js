/****************************************************************
 * drawing canvas (for client and board)
 */
export class Canvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.width = null;
    this.height = null;

    // resize canvas to full screen
    this.adaptSize = this.adaptSize.bind(this);
    window.addEventListener("resize", this.adaptSize);
    this.adaptSize();
  }

  // paint a stroke of the given color
  stroke(startX, startY, endX, endY, thickness, color) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const context = this.context;
    const lineWidth = 4 + 20 * thickness;

    context.beginPath();
    context.moveTo(startX * width, startY * height);
    context.lineTo(endX * width, endY * height);
    context.lineWidth = lineWidth;
    context.strokeStyle = color;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
  }

  adaptSize() {
    const rect = document.body.getBoundingClientRect();
    this.width = this.canvas.width = rect.width;
    this.height = this.canvas.height = rect.height;
  }
}
