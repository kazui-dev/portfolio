import SocialLinks from './SocialLinks';

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-slate-950 mt-auto">
      <div className="mx-auto w-full px-4 sm:px-6 py-4 flex flex-row items-center justify-center gap-5">
        <SocialLinks className="flex items-center gap-3 text-slate-400" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} kazui
        </p>
      </div>
    </footer>
  );
}