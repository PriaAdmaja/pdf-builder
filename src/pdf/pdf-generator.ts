import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

type PdfGeneratorType = {
  filename: string;
  content: (doc: typeof PDFDocument) => void;
  size?: typeof PDFDocument.options.size;
  margin?: typeof PDFDocument.options.margin;
  layout?: typeof PDFDocument.options.layout;
};

const pdfGenerator = async ({
  content,
  filename,
  size = "A4",
  margin = 50,
  layout = "portrait",
}: PdfGeneratorType) => {
  const doc = new PDFDocument({ size, margin, layout, bufferPages: true });
  const stream = new PassThrough();

  doc.pipe(stream);

  content(doc);

  //Global Edits to All Pages (Header/Footer, etc)
  let pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);

    //Footer: Add page number
    let oldBottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0; //Dumb: Have to remove bottom margin in order to write into it
    doc.fontSize(10).text(
      `${i + 1} of ${pages.count}`,
      50,
      doc.page.height - oldBottomMargin / 2, // Centered vertically in bottom margin
      { align: "left" }
    );
    doc.page.margins.bottom = oldBottomMargin; // ReProtect bottom margin
  }

  // manually flush pages that have been buffered
  doc.flushPages();

  doc.end();

  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const pdfBuffer = Buffer.concat(chunks);

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${filename}.pdf`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
};

export default pdfGenerator;
