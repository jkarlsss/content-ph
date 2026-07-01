// app/connect/page.tsx
'use client';

import { useConnectFacebook } from "../features/facebook/hooks/use-connect-facebook";
import { Button } from "./ui/button";

export default function ConnectFacebook() {
  const { handleConnect } = useConnectFacebook();

  return <Button onClick={handleConnect}>Connect Facebook Page</Button>;
}