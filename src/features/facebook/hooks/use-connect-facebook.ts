import { useCallback } from "react";

export const useConnectFacebook = () => {
  const handleConnect = useCallback(() => {
    const params = new URLSearchParams({
      client_id: "1011399698142763",
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/facebook/callback`,
      response_type: 'code',
      config_id: process.env.NEXT_PUBLIC_FB_CONFIG_ID!, // from your Login Config
      state: crypto.randomUUID(), // store this server-side/in a cookie to verify on callback
    });
    window.location.href = `https://www.facebook.com/v25.0/dialog/oauth?${params}`;
  }, [])

  return { handleConnect };
}