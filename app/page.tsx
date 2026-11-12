import StudioApp from "@/components/studio/StudioApp";

/** Open `/?mock=1` to use the offline mock generator (no API calls) for testing. */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { mock } = await searchParams;
  return <StudioApp mockMode={mock === "1"} />;
}
