type ToggleButtonProps = {
  handleButtonClick: () => void;
  isVisible: boolean;
  prevStatus: string;
  postStatus: string;
};
export default function ToggleButton({ handleButtonClick, isVisible, prevStatus, postStatus }: ToggleButtonProps) {
  return (
    <button
      onClick={handleButtonClick}
      className={`px-8 py-3 border-2 rounded-[10px] text-base font-semibold cursor-pointer transition-all duration-300 ${
        isVisible
          ? "bg-gradient-to-r from-[#F59E0B] to-[#F97316] text-white border-[#F59E0B] shadow-[0_2px_10px_rgba(245,158,11,0.3)]"
          : "border-[#E8F5E9] bg-white text-[#4F4F4F] hover:border-[#7BC67E] hover:bg-[#F8FBF8] hover:text-[#2D5F2E]"
      }`}
    >
      {isVisible ? postStatus : prevStatus}
    </button>
  );
}
