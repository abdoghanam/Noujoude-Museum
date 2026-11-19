import type { Metadata } from "next";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";

import config from "@/payload/payload.config";
import { importMap } from "../importMap";

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Args): Promise<Metadata> {
  return generatePageMetadata({
    config: Promise.resolve(config),
    params,
    searchParams,
  });
}

export default async function AdminPage({ params, searchParams }: Args) {
  return RootPage({
    config: Promise.resolve(config),
    importMap,
    params,
    searchParams,
  });
}
