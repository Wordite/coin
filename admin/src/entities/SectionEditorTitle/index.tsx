interface SectionEditorTitleProps {
  title: string
}

const SectionEditorTitle = ({ title }: SectionEditorTitleProps) => {
  return <p className='text-xl font-bold text-white mb-4'>{title}</p>
}

export { SectionEditorTitle }
