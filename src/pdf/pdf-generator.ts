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
  const doc = new PDFDocument({ size, margin, layout });
  const stream = new PassThrough();

  doc.pipe(stream);

  content(doc);

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
