import { ACCOUNT_TYPES } from "../../../constants/accounts";
import { Platform } from "../../../generated/prisma/enums";
import { PlatformCards } from "../../ideas/components/platform-cards";

export default function AccountsView() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 md:grid-cols-3 gap-4 mx-auto">
      {Object.values(Platform).map((platform) => {
        const accountType = ACCOUNT_TYPES[platform];

        return (
          <PlatformCards
            key={platform}
            label={accountType.label}
            color={accountType.color}
            icon={accountType.icon}
            caption={accountType.caption}
            description={accountType.description}
          />
        );
      })}
    </div>
  );
}
