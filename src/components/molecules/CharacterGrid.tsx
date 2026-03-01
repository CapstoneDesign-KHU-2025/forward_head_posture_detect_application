"use client";

type CharacterGridProps = {
  characterObject: {
    id: string;
    icon: string;
    name: string;
    description: string;
  };
  handleGridClick: () => void;
  selectedCharacterId: string | null;
};
export default function CharacterGrid({ characterObject, handleGridClick, selectedCharacterId }: CharacterGridProps) {
  return (
    <div
      onClick={handleGridClick}
      className={`
                bg-[var(--green-pale)] rounded-2xl py-8 px-6 text-center cursor-pointer transition-all duration-300
                border-[3px] border-transparent relative
                hover:-translate-y-2 hover:shadow-[0_8px_25px_rgba(45,95,46,0.2)] hover:border-[#7BC67E]
                ${
                  selectedCharacterId === characterObject.id
                    ? "bg-gradient-to-br from-[#E8F5E9] to-[#F0F9F0] border-[#4A9D4D] shadow-[0_8px_25px_rgba(74,157,77,0.3)]"
                    : ""
                }
              `}
    >
      {selectedCharacterId === characterObject.id && (
        <div className="absolute top-4 right-4 bg-[#4A9D4D] text-white w-[30px] h-[30px] rounded-full flex items-center justify-center font-bold text-[1.2rem]">
          ✓
        </div>
      )}
      <div className="w-24 h-24 mx-auto mb-4">
        <img src={characterObject.icon} alt={characterObject.name} className="w-full h-full object-contain" />
      </div>
      <div className="text-[1.2rem] font-bold text-[#2D5F2E] mb-2">{characterObject.name}</div>
      <div className="text-[0.9rem] text-[#4F4F4F] leading-[1.4] whitespace-pre-line">
        {characterObject.description}
      </div>
    </div>
  );
}
