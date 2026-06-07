type RpcClient = {
  rpc: (fn: string) => PromiseLike<{ error: { code?: string; message?: string } | null }>;
};

function isMissingRpc(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";
  return error.code === "PGRST202" || message.includes("could not find the function");
}

export async function claimCurrentUserProfile(supabase: RpcClient) {
  const { error } = await supabase.rpc("claim_current_user_profile");
  if (error && !isMissingRpc(error)) throw error;
}
