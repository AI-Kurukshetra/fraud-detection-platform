import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get("entityType");
  const entityKey = searchParams.get("entityKey");

  if (!entityType || !entityKey) {
    return fail("entityType and entityKey are required.", 422);
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return ok({ nodes: [], edges: [] });
  }

  const { data: node, error: nodeError } = await supabase
    .from("graph_entities")
    .select("id")
    .eq("entity_type", entityType)
    .eq("entity_key", entityKey)
    .maybeSingle();

  if (nodeError) {
    return fail(nodeError.message, 500);
  }

  if (!node) {
    return ok({ nodes: [], edges: [] });
  }

  const { data: edges, error: edgesError } = await supabase
    .from("graph_edges")
    .select(
      "id, edge_type, weight, created_at, from_entity:from_entity_id(*), to_entity:to_entity_id(*)",
    )
    .or(`from_entity_id.eq.${node.id},to_entity_id.eq.${node.id}`);

  if (edgesError) {
    return fail(edgesError.message, 500);
  }

  return ok(edges);
}


