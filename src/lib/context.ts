import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  // Return 5 most similar vectors
  let pinecone: Pinecone | null = null;
  pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENVIRONMENT!,
  });
  const index = await pinecone.Index("pdfchatter");
  // The value of index is the name in your Pinecone client
  try {
    const queryResult = await index.query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    });
    return queryResult.matches || [];
  } catch (error) {
    console.log("error querying embeddings: ", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  // A file key is needed to find the correct namespace
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.25
  );

  type Metadata = {
    text: string;
    pageNumber: number;
  };

  console.log(
    `MD for 1 = ${qualifyingDocs[0].metadata}                                               `
  );
  let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);
  // 5 vectors
  return docs.join("\n").substring(0, 3000);
}
