import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react";
import { AccountType } from "../../../constants/accounts";

export function PlatformCards({ label, color, icon, caption, description }: AccountType) {
  return (
    // 1. Added 'h-full flex flex-col' to ensure the card stretches to match its siblings
    <Card size="sm" className="w-full max-w-sm h-full flex flex-col justify-between">
      
      {/* 2. Changed items-center to items-start so the icon stays neatly aligned if captions wrap */}
      <CardHeader className="flex flex-row items-start gap-4 space-y-0"> 
        <div className="shrink-0 pt-0.5">
          <HugeiconsIcon icon={icon} color={color} className="size-6" />
        </div>
        <div className="space-y-1">
          <CardTitle>{label}</CardTitle>
          <CardDescription className="min-h-[20px]">
            {caption}
          </CardDescription>
        </div>
      </CardHeader>

      {/* 3. Added 'flex-1' to make the content area grow and push the footer to the very bottom */}
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </CardContent>

      <CardFooter className="pt-0">
        <Button size="sm" className="w-full">
          connect
        </Button>
      </CardFooter>
    </Card>
  )
}