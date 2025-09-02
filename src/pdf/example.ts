import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

const pdfBuffer = async (body: { title: string; content: string[] }) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = new PassThrough();

  doc.pipe(stream);

  // Title
  doc.fontSize(18).text(body.title, { align: "center" });
  doc.moveDown()

  // Write content
  body.content.forEach((text) => {
    doc.fontSize(12).text(text, 50)
    doc.text(text, 50);
  });

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
