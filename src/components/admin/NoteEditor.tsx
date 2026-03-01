import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { EditorView } from '@uiw/react-codemirror';
import { useTheme } from '@/lib/theme';

const contentPadding = EditorView.theme({
  '.cm-content': { padding: '20px', fontSize: '15px', lineHeight: '1.75rem' },
  '.cm-line': { paddingLeft: '0', paddingRight: '0' },
});

type NoteEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function NoteEditor({ value, onChange }: NoteEditorProps) {
  const { resolvedTheme } = useTheme();

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={[markdown(), contentPadding, EditorView.lineWrapping]}
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
