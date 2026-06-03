import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { EditorView, keymap, Prec } from '@uiw/react-codemirror';
import { useMemo } from 'react';
import { useTheme } from '@/lib/theme';

const contentPadding = EditorView.theme({
  '.cm-content': { padding: '20px', fontSize: '15px', lineHeight: '1.75rem' },
  '.cm-line': { paddingLeft: '0', paddingRight: '0' },
});

type NoteEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  onSelectionChange?: (selection: { from: number; to: number }) => void;
};

export default function NoteEditor({ value, onChange, onSave, onSelectionChange }: NoteEditorProps) {
  const { resolvedTheme } = useTheme();

  const saveKeymap = useMemo(
    () =>
      onSave
        ? Prec.highest(keymap.of([{ key: 'Mod-s', run: () => { onSave(); return true; } }]))
        : [],
    [onSave],
  );

  const selectionListener = useMemo(
    () =>
      onSelectionChange
        ? EditorView.updateListener.of((update) => {
          if (!update.selectionSet) return;
          const { from, to } = update.state.selection.main;
          onSelectionChange({ from, to });
        })
        : [],
    [onSelectionChange],
  );

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={[markdown({ codeLanguages: [] }), contentPadding, EditorView.lineWrapping, saveKeymap, selectionListener]}
      theme={resolvedTheme === 'dark' ? githubDark : githubLight}
      height="100%"
      className="h-full text-sm"
      basicSetup={{
        lineNumbers: false,
        highlightActiveLine: false,
        foldGutter: false,
        dropCursor: false,
        allowMultipleSelections: false,
        indentOnInput: true,
      }}
    />
  );
}
