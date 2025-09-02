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

  // Content of pdf file
  content(doc);

  //Global Edits to All Pages (Header/Footer, etc)
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);

    const oldBottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    const formattedDate = new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    });

    const createdAt = formattedDate.replace(".", ":") + " WIB";

    // Left footer
    doc
      .fontSize(10)
      .text(
        `Dicetak pada: ${createdAt}`,
        50,
        doc.page.height - oldBottomMargin / 2,
        { align: "left" }
      );

    // Right footer
    doc
      .fontSize(10)
      .text(
        `${i + 1} dari ${pages.count}`,
        50,
        doc.page.height - oldBottomMargin / 2,
        { align: "right" }
      );

    doc.page.margins.bottom = oldBottomMargin; // restore
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
