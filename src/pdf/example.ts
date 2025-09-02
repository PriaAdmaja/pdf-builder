import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

const pdfBuffer = async (body: { title: string; content: string[] }) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  const pageHeight = doc.page.height;
  const topMargin = doc.page.margins.top;
  const bottomMargin = doc.page.margins.bottom;

  let y = topMargin;
  let pageNumber = 0;

  const addFooter = () => {
    pageNumber++;
    doc.fontSize(10).fillColor("gray");
    doc.text(`Page ${pageNumber}`, 0, doc.page.height - 40, {
      align: "center",
    });
    doc.fillColor("black"); // reset color
  };

  const stream = new PassThrough();
  doc.pipe(stream);

  // On every new page, add footer
//   doc.on("pageAdded", () => {
//     addFooter();
//   });

  // Title
  doc.fontSize(20).text(body.title, { align: "center" });
  y = doc.y + 20; // update y after writing title

  // Function to write text with paging
  const writeLine = (text: string, fontSize = 14) => {
    doc.fontSize(fontSize);

    const lineHeight = doc.currentLineHeight();

    // check if content fits, otherwise add page
    if (y + lineHeight > pageHeight - bottomMargin) {
      doc.addPage();
      y = topMargin;
    }

    doc.text(text, 50, y);
    y = doc.y + 10; // update y based on where PDFKit left off
  };

  // Loop content
  body.content.forEach((text) => {
    writeLine(text);
  });

  addFooter();

  doc.end();

  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const pdfBuffer = Buffer.concat(chunks);

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=example.pdf",
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
};

export default pdfBuffer;
