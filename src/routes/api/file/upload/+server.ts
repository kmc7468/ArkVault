import Busboy from "@fastify/busboy";
import { error, text } from "@sveltejs/kit";
import { Readable, Writable } from "stream";
import { authorize } from "$lib/server/modules/auth";
import { fileUploadRequest } from "$lib/server/schemas";
import { uploadFile } from "$lib/server/services/file";
import type { RequestHandler } from "./$types";

const parseFormData = async (contentType: string, body: ReadableStream<Uint8Array>) => {
  return new Promise<{ metadata: string; content: Readable }>((resolve, reject) => {
    let metadata: string | null = null;
    let content: Readable | null = null;

    const bb = Busboy({ headers: { "content-type": contentType } });
    bb.on("field", (fieldname, val) => {
      if (fieldname !== "metadata") return reject(new Error("Invalid request body"));
      if (metadata || content) return reject(new Error("Invalid request body")); // metadata must be first
      metadata = val;
    });
    bb.on("file", (fieldname, file) => {
      if (fieldname !== "content") return reject(new Error("Invalid request body"));
      if (!metadata || content) return reject(new Error("Invalid request body")); // metadata must be first
      content = file;
      resolve({ metadata, content });
    });
    bb.on("finish", () => reject(new Error("Invalid request body")));
    bb.on("error", (e) => reject(e));

    body.pipeTo(Writable.toWeb(bb));
  });
};

export const POST: RequestHandler = async ({ locals, request }) => {
  const { userId } = await authorize(locals, "activeClient");

  const contentTypeHeader = request.headers.get("Content-Type");
  if (!contentTypeHeader?.startsWith("multipart/form-data") || !request.body) {
    error(400, "Invalid request body");
  }

  let metadata;
  let content;

  try {
    const formData = await parseFormData(contentTypeHeader, request.body);
    metadata = formData.metadata;
    content = formData.content;
  } catch (e) {
    if (e instanceof Error && e.message === "Invalid request body") {
      error(400, "Invalid request body");
    }
    throw e;
  }

  const zodRes = fileUploadRequest.safeParse(JSON.parse(metadata));
  if (!zodRes.success) error(400, "Invalid request body");
  const {
    parentId,
    mekVersion,
    dek,
    dekVersion,
    hskVersion,
    contentHmac,
    contentType,
    contentIv,
    name,
    nameIv,
    createdAt,
    createdAtIv,
    lastModifiedAt,
    lastModifiedAtIv,
  } = zodRes.data;
  if ((createdAt && !createdAtIv) || (!createdAt && createdAtIv))
    error(400, "Invalid request body");

  await uploadFile(
    {
      userId,
      parentId,
      mekVersion,
      encDek: dek,
      dekVersion: new Date(dekVersion),
      hskVersion,
      contentHmac,
      contentType,
      encContentIv: contentIv,
      encName: name,
      encNameIv: nameIv,
      encCreatedAt: createdAt ?? null,
      encCreatedAtIv: createdAtIv ?? null,
      encLastModifiedAt: lastModifiedAt,
      encLastModifiedAtIv: lastModifiedAtIv,
    },
    content,
  );
  return text("File uploaded", { headers: { "Content-Type": "text/plain" } });
};
