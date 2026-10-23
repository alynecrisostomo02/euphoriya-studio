import { KnowledgeStudio } from "../components/knowledge-studio";
import { buildArchive } from "../lib/archive-seed";
export default async function Page() {
  return <KnowledgeStudio seed={await buildArchive()} />;
}
