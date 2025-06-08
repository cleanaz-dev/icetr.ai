import { ThemeChanger } from "./useChangeTheme";

export const Logo = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-lg">I</span>
      </div>
      <span className="text-2xl font-bold text-primary">
        icetr<span>.</span>ai
      </span>
      <ThemeChanger />
    </div>
  );
};
