import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import md5 from "md5";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import { Vector } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";

let pinecone: Pinecone | null = null;

export const getPineconeClient = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!,
    });
  }
  return pinecone;
};

//Format the object that's returned from S3 into a more usable format
type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(fileKey: string) {
  // 1)Obtain the PDF by downloading and reading from that PDF
  console.log("downloading s3 into file system");
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) {
    throw new Error("Could not download from s3.");
  }
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];
  /**Conversion of type 'Document<Record<string, any>>[]' to type 'PDFPage' may be a mistake
   * because neither type sufficiently overlaps with the other. This can be fixed by adding
   * the "as unknown" part in order for the Loader Object type to convert to PDFPage
   */
  const documents = await Promise.all(pages.map(prepareDocument));
  //.map performs a function on each element in an array

  //3) Vectorise and embed each document
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  //4) Upload the vectors onto PineconeDB
  const client = await getPineconeClient();
  const pineconeIndex = client.Index("pdfchatter");

  console.log("Inserting vectors into pinecone");
  const records = vectors as PineconeRecord[];
  await pineconeIndex.upsert(records);
  return documents[0];
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent); //Creates a hash of each vector
    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as Vector;
  } catch (error) {
    console.log("error embedding documents", error);
    throw error;
  }
}

export const splitStringIntoBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

// 2) Split and segment the PDF into parts. Each part should ideally be 2 sentences long
async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, " "); //Replace newline with empty string

  //Split the doument into many paragraphs
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: splitStringIntoBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}
