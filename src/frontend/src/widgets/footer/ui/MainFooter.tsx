import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Avatar, Icon } from "@shared/ui";
import { useAppStore } from "@shared/store/app.store";

type TabType = "profile" | "map" | "list" | "dogs";

export const MainFooter: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { currentDog } = useAppStore();

  const getActiveTab = (): TabType => {
    if (location.pathname.includes("/profile")) return "profile";
    if (location.pathname.includes("/map")) return "map";
    if (location.pathname === "/dog") return "dogs";
    return "list";
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tab: TabType) => {
    const routes: Record<TabType, string> = {
      profile: "/profile",
      map: "/map",
      list: "/home?tab=walks",
      dogs: "/dog",
    };
    history.push(routes[tab]);
  };

  return (
    <div className="w-full px-[3px] pt-2.5 pb-5 bg-white/60 rounded-t-2xl shadow-[0px_0px_9.3px_0px_rgba(66,58,58,0.06)] backdrop-blur-[5.5px] flex justify-center items-center gap-10">
      <button
        onClick={() => handleTabClick("profile")}
        className="p-3.5 rounded-full flex justify-start items-start transition-colors"
      >
        <Avatar
          src={currentDog?.avatar || "https://placehold.co/28x28"}
          alt={currentDog?.name || "Dog"}
          size="small"
          variant="circular"
          className="w-7 h-7"
        />
      </button>

      <div className="p-[3px] rounded-full flex justify-start items-center gap-0">
        <button
          onClick={() => handleTabClick("map")}
          className="p-3 rounded-full flex justify-start items-start transition-colors"
        >
          <Icon
            name={activeTab === "map" ? "pin-filled" : "pin-stroke"}
            size={24}
            color={activeTab === "map" ? "var(--color-text-primary)" : "var(--color-text-secondary)"}
          />
        </button>

        <button
          onClick={() => handleTabClick("list")}
          className="p-3 rounded-full flex justify-start items-start transition-colors"
        >
          <Icon
            name={activeTab === "list" ? "list-filled" : "list-stroke"}
            size={24}
            color={activeTab === "list" ? "var(--color-text-primary)" : "var(--color-text-secondary)"}
          />
        </button>
      </div>

      <button
        onClick={() => handleTabClick("dogs")}
        className="p-4 rounded-full flex justify-start items-start transition-colors"
      >
        <Icon
          name={activeTab === "dogs" ? "paw-filled" : "paw-stroke"}
          size={24}
          color={activeTab === "dogs" ? "var(--color-text-primary)" : "var(--color-text-secondary)"}
        />
      </button>
    </div>
  );
};
