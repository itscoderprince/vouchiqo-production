import { Bell } from "lucide-react";

export const NotificationBell = ({ count }) => (
  <button
    className="relative p-1 text-gray-700 hover:text-gray-900 transition cursor-pointer bg-transparent border-0"
    aria-label="Notifications"
  >
    <Bell className="h-[22px] w-[22px]" />
    {count > 0 && (
      <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-[#dc2626] text-white text-[10px] font-bold h-[18px] w-[18px] flex items-center justify-center rounded-full border-2 border-white">
        {count}
      </span>
    )}
  </button>
);

export default NotificationBell;
