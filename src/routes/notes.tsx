import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/notes')({
  component: NotesLayout,
});

function NotesLayout() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <Outlet />
    </div>
  );
}