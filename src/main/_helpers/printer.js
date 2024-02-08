const escpos = require('escpos');

let device;
let printer;

const alignLeftAndRight = (leftText, rightText) => {
  const spaces = 32 - (leftText.length + rightText.length);
  if (spaces < 0) { return (leftText + rightText).substring(0, 31); }
  return leftText + (new Array(spaces + 1).join(' ')) + rightText;
};

module.exports = {
  printReceipt(receiptData) {
    device = new escpos.USB();
    printer = new escpos.Printer(device);

    device.open(() => {
      receiptData.products.forEach(el => {
        printer
          .font('a')
          .encode('utf8')
          .align('lt')
          .text(el.title)
          .align('lt')
          .text(alignLeftAndRight('  ' + el.quantityText, el.priceText));
      });

      printer
        .text('................................')
        .text(alignLeftAndRight('Valor Total', receiptData.totalPrice))
        .text(alignLeftAndRight('Pagado', receiptData.payment))
        .text(alignLeftAndRight('Cambio', receiptData.change))
        .text(alignLeftAndRight('Fecha', receiptData.date))
        .text('\n\n\n') // This instead of .cut() because cut prints a random M
        .close();
    });
  }
};
